<script lang="ts" setup>
import { computed, reactive, watch } from 'vue';
import type { Location } from 'vue-router';

import {
    PButtonModal, PI, PLink, PToolboxTable, PDivider,
} from '@spaceone/design-system';
import type { DataTableFieldType } from '@spaceone/design-system/types/data-display/tables/data-table/type';
import dayjs from 'dayjs';
import { cloneDeep, find, sortBy } from 'lodash';

import { byteFormatter, numberFormatter } from '@cloudforet/core-lib';
import { setApiQueryWithToolboxOptions } from '@cloudforet/core-lib/component-util/toolbox';
import { QueryHelper } from '@cloudforet/core-lib/query';
import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { getCancellableFetcher } from '@cloudforet/core-lib/space-connector/cancallable-fetcher';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import { store } from '@/store';

import type { ExcelDataField } from '@/store/modules/file/type';
import type { ProjectGroupReferenceMap } from '@/store/modules/reference/project-group/type';
import type { ProjectReferenceMap } from '@/store/modules/reference/project/type';
import type { ProviderReferenceMap } from '@/store/modules/reference/provider/type';
import type { RegionReferenceMap } from '@/store/modules/reference/region/type';
import type { ServiceAccountReferenceMap } from '@/store/modules/reference/service-account/type';

import { FILE_NAME_PREFIX } from '@/lib/excel-export';
import { arrayToQueryString, objectToQueryString, primitiveToQueryString } from '@/lib/router-query-string';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/route-config';
import { DATE_FORMAT } from '@/services/cost-explorer/cost-analysis/lib/widget-data-helper';
import {
    GRANULARITY, GROUP_BY, GROUP_BY_ITEM_MAP, ADDITIONAL_GROUP_BY, ADDITIONAL_GROUP_BY_ITEM_MAP,
} from '@/services/cost-explorer/lib/config';
import { getDataTableCostFields, getTimeUnitByPeriod } from '@/services/cost-explorer/lib/helper';
import { useCostAnalysisPageStore } from '@/services/cost-explorer/store/cost-analysis-page-store';
import type { CostAnalyzeResponse, Granularity, Period } from '@/services/cost-explorer/type';


type CostAnalyzeRawData = {
    [groupBy: string]: string | any;
    cost_sum?: Array<{
        date: string;
        value: number
    }>;
    usage_quantity_sum?: Array<{
        date: string;
        value: number|null;
    }>;
    usage_unit?: string;
    _total_cost_sum?: number;
    _total_usage_quantity_sum?: number;
};

const costAnalysisPageStore = useCostAnalysisPageStore();
const costAnalysisPageState = costAnalysisPageStore.$state;

const state = reactive({
    component: computed(() => PToolboxTable),
    timeUnit: computed(() => getTimeUnitByPeriod(costAnalysisPageState.granularity, dayjs.utc(costAnalysisPageState.period?.start), dayjs.utc(costAnalysisPageState.period?.end))),
    dateFormat: computed(() => {
        if (costAnalysisPageState.granularity === GRANULARITY.MONTHLY) return 'YYYY-MM';
        if (costAnalysisPageState.granularity === GRANULARITY.YEARLY) return 'YYYY';
        return 'YYYY-MM-DD';
    }),
    //
    projectGroups: computed<ProjectGroupReferenceMap>(() => store.getters['reference/projectGroupItems']),
    projects: computed<ProjectReferenceMap>(() => store.getters['reference/projectItems']),
    providers: computed<ProviderReferenceMap>(() => store.getters['reference/providerItems']),
    regions: computed<RegionReferenceMap>(() => store.getters['reference/regionItems']),
    serviceAccounts: computed<ServiceAccountReferenceMap>(() => store.getters['reference/serviceAccountItems']),
    //
    currency: computed(() => store.state.settings.currency),
    currencyRates: computed(() => store.state.settings.currencyRates),
    groupByStoreMap: computed(() => ({
        [GROUP_BY.PROJECT_GROUP]: state.projectGroups,
        [GROUP_BY.PROJECT]: state.projects,
        [GROUP_BY.PROVIDER]: state.providers,
        [GROUP_BY.REGION]: state.regions,
        [GROUP_BY.SERVICE_ACCOUNT]: state.serviceAccounts,
    })),
    visibleExcelNotiModal: false,
    isIncludedUsageTypeInGroupBy: computed<boolean>(() => costAnalysisPageState.groupBy.includes(GROUP_BY.USAGE_TYPE)),

});
const tableState = reactive({
    loading: true,
    excelFields: computed<ExcelDataField[]>(() => tableState.groupByFields.concat(tableState.costFields).map((d) => {
        const field: ExcelDataField = { key: d.name, name: d.label };
        if (d.name === GROUP_BY.PROJECT) field.reference = { reference_key: 'project_id', resource_type: 'identity.Project' };
        if (d.name === GROUP_BY.PROJECT_GROUP) field.reference = { reference_key: 'project_group_id', resource_type: 'identity.ProjectGroup' };
        if (d.name === GROUP_BY.SERVICE_ACCOUNT) field.reference = { reference_key: 'service_account_id', resource_type: 'identity.ServiceAccount' };
        if (d.name === GROUP_BY.REGION) field.reference = { reference_key: 'region_code', resource_type: 'inventory.Region' };
        if (d.name === GROUP_BY.PROVIDER) field.reference = { reference_key: 'provider', resource_type: 'identity.Provider' };
        if (d.name.startsWith('cost')) {
            field.type = 'currency';
            field.options = {
                currency: state.currency,
                currencyRates: state.currencyRates,
            };
        }
        return field;
    })),
    groupByFields: computed<DataTableFieldType[]>(() => costAnalysisPageState.groupBy.map((d) => {
        if (GROUP_BY_ITEM_MAP[d]) {
            return {
                ...GROUP_BY_ITEM_MAP[d],
                sortable: false,
            };
        }
        return {
            name: d.split('.')[1], // tags.Name -> Name
            label: d.split('.')[1], // tags.Name -> Name
            sortable: false,
        };
    })),
    costFields: [] as DataTableFieldType[],
    fields: computed<DataTableFieldType[]>(() => tableState.groupByFields.concat(tableState.costFields)),
    items: [] as CostAnalyzeRawData[],
    more: false,
});

/* util */
const getLink = (item: CostAnalyzeRawData, fieldName: string) => {
    const queryHelper = new QueryHelper();
    const query: Location['query'] = {};
    if (item.region_code) {
        query.region = arrayToQueryString([item.region_code]);
    } else if (costAnalysisPageState.filters?.region_code?.length) {
        query.region = arrayToQueryString(costAnalysisPageState.filters.region_code);
    }
    if (item.provider) {
        query.provider = primitiveToQueryString(item.provider);
    } else if (costAnalysisPageState.filters?.provider?.length) {
        query.provider = primitiveToQueryString(costAnalysisPageState.filters.provider[0]);
    }

    const dateIndex = Number(fieldName.split('.')[1]);
    const date = item.cost_sum?.[dateIndex].date;
    const _period = { start: date, end: date };
    if (costAnalysisPageState.granularity === GRANULARITY.MONTHLY) {
        _period.start = dayjs.utc(date).format('YYYY-MM-01');
        _period.end = dayjs.utc(date).endOf('month').format('YYYY-MM-DD');
    }
    query.period = objectToQueryString(_period);

    const filters: ConsoleFilter[] = [];
    if (typeof item.project_id === 'string') {
        filters.push({ k: 'project_id', v: item.project_id, o: '=' });
    } else if (costAnalysisPageState.filters?.project_id?.length) {
        filters.push({ k: 'project_id', v: costAnalysisPageState.filters.project_id, o: '=' });
    }

    if (typeof item.project_group_id === 'string') {
        filters.push({ k: 'project_group_id', v: item.project_group_id, o: '=' });
    } else if (costAnalysisPageState.filters?.project_group_id?.length) {
        filters.push({ k: 'project_group_id', v: costAnalysisPageState.filters.project_group_id, o: '=' });
    }

    if (typeof item.service_account_id === 'string') {
        filters.push({ k: 'collection_info.service_account_id', v: item.service_account_id, o: '=' });
    } else if (costAnalysisPageState.filters?.service_account_id?.length) {
        filters.push({ k: 'collection_info.service_account_id', v: costAnalysisPageState.filters.service_account_id, o: '=' });
    }

    if (typeof item.product === 'string') {
        filters.push({ k: 'service_code', v: item.product, o: '=' });
    } else if (costAnalysisPageState.filters?.product?.length) {
        filters.push({ k: 'service_code', v: costAnalysisPageState.filters.product, o: '=' });
    }

    return {
        name: ASSET_INVENTORY_ROUTE.CLOUD_SERVICE._NAME,
        params: {},
        query: {
            filters: queryHelper.setFilters(filters).rawQueryStrings,
            ...query,
        },
    };
};
const getIsRaised = (item: CostAnalyzeRawData, fieldName: string): boolean => {
    const currDate: string = fieldName.split('.')[1]; // cost.2022-01-04 -> 2022-01-04
    const prevDate: string = dayjs.utc(currDate).subtract(1, state.timeUnit).format(state.dateFormat);
    const currValue: number|undefined = item.cost_sum?.find(({ date }) => date === currDate)?.value;
    const prevValue: number|undefined = item.cost_sum?.find(({ date }) => date === prevDate)?.value;

    if (prevValue === undefined || currValue === undefined) return false;
    if (currValue < prevValue) return false;
    if (currValue > 0) {
        if (prevValue < 0) return true;
        if (currValue - prevValue > 0) return ((currValue - prevValue) / currValue) * 100 >= 50;
    }
    if (currValue < 0 && currValue > prevValue) {
        return currValue * 2 >= prevValue;
    }
    return false;
};
const fieldDescriptionFormatter = (field: DataTableFieldType): string => {
    if (field.name.startsWith(`${ADDITIONAL_GROUP_BY.TAGS}_`)) {
        return ` (${ADDITIONAL_GROUP_BY_ITEM_MAP[ADDITIONAL_GROUP_BY.TAGS].label})`;
    }
    if (field.name.startsWith(`${ADDITIONAL_GROUP_BY.ADDITIONAL_INFO}_`)) {
        return ` (${ADDITIONAL_GROUP_BY_ITEM_MAP[ADDITIONAL_GROUP_BY.ADDITIONAL_INFO].label})`;
    }
    return '';
};

const getRefinedChartTableData = (results: CostAnalyzeRawData[], granularity: Granularity, period: Period) => {
    const timeUnit = getTimeUnitByPeriod(granularity, dayjs.utc(period.start), dayjs.utc(period.end));
    const dateFormat = DATE_FORMAT[timeUnit];

    const _results: CostAnalyzeRawData[] = cloneDeep(results);
    const refinedTableData: CostAnalyzeRawData[] = [];
    _results.forEach((d) => {
        let _costSum = cloneDeep(d.cost_sum);
        let _usageQuantitySum = cloneDeep(d?.usage_quantity_sum);
        let now = dayjs.utc(period.start).clone();
        while (now.isSameOrBefore(dayjs.utc(period.end), timeUnit)) {
            if (!find(_costSum, { date: now.format(dateFormat) })) {
                _costSum?.push({ date: now.format(dateFormat), value: 0 });
            }
            if (!find(_usageQuantitySum, { date: now.format(dateFormat) })) {
                _usageQuantitySum?.push({ date: now.format(dateFormat), value: null });
            }
            now = now.add(1, timeUnit);
        }
        _costSum = sortBy(_costSum, ['date']);
        _usageQuantitySum = sortBy(_usageQuantitySum, ['date']);
        refinedTableData.push({
            ...d,
            cost_sum: _costSum,
            ...(state.isIncludedUsageTypeInGroupBy && { usage_quantity_sum: _usageQuantitySum }),
        });
    });
    return refinedTableData;
};


/* api */
const fetchCostAnalyze = getCancellableFetcher<CostAnalyzeResponse<CostAnalyzeRawData>>(SpaceConnector.clientV2.costAnalysis.cost.analyze);
const analyzeApiQueryHelper = new ApiQueryHelper().setPage(1, 15);
const listCostAnalysisTableData = async (): Promise<CostAnalyzeResponse<CostAnalyzeRawData>> => {
    try {
        tableState.loading = true;
        analyzeApiQueryHelper.setFilters(costAnalysisPageStore.consoleFilters);
        const dateFormat = costAnalysisPageState.granularity === GRANULARITY.MONTHLY ? 'YYYY-MM' : 'YYYY-MM-DD';
        const groupBy = state.isIncludedUsageTypeInGroupBy ? [...costAnalysisPageState.groupBy, 'usage_unit'] : costAnalysisPageState.groupBy;
        const { status, response } = await fetchCostAnalyze({
            data_source_id: costAnalysisPageStore.selectedDataSourceId,
            query: {
                granularity: costAnalysisPageState.granularity,
                group_by: groupBy,
                start: dayjs.utc(costAnalysisPageState.period?.start).format(dateFormat),
                end: dayjs.utc(costAnalysisPageState.period?.end).format(dateFormat),
                fields: {
                    cost_sum: {
                        key: 'cost',
                        operator: 'sum',
                    },
                    ...(state.isIncludedUsageTypeInGroupBy && {
                        usage_quantity_sum: {
                            key: 'usage_quantity',
                            operator: 'sum',
                        },
                    }),
                },
                field_group: ['date'],
                ...analyzeApiQueryHelper.data,
            },
        });
        if (status === 'succeed') return response;
        return { more: false, results: [] };
    } catch (e) {
        ErrorHandler.handleError(e);
        return { more: false, results: [] };
    } finally {
        tableState.loading = false;
    }
};

const getUsageQuantity = (item: CostAnalyzeRawData, fieldName: string): number|string => {
    const dateIndex = Number(fieldName.split('.')[1]);
    const usageQuantity = item.usage_quantity_sum?.[dateIndex]?.value;
    if (!usageQuantity) return 'unknown';
    if (item.usage_unit === 'Bytes') {
        return `${byteFormatter(usageQuantity, { unit: item.usage_unit })}`;
    }
    return numberFormatter(usageQuantity);
};

/* event */
const handleChange = async (options: any = {}) => {
    setApiQueryWithToolboxOptions(analyzeApiQueryHelper, options, { queryTags: true });
    const { results, more } = await listCostAnalysisTableData();
    if (costAnalysisPageState.period) tableState.items = getRefinedChartTableData(results, costAnalysisPageState.granularity, costAnalysisPageState.period);
    tableState.more = more;
};
const handleExcelDownload = async () => {
    try {
        analyzeApiQueryHelper.setFilters(costAnalysisPageStore.consoleFilters);
        const dateFormat = costAnalysisPageState.granularity === GRANULARITY.MONTHLY ? 'YYYY-MM' : 'YYYY-MM-DD';


        await store.dispatch('file/downloadExcel', {
            url: '/cost-analysis/cost/analyze',
            param: {
                granularity: costAnalysisPageState.granularity,
                group_by: costAnalysisPageState.groupBy,
                start: dayjs.utc(costAnalysisPageState?.period?.start).format(dateFormat),
                end: dayjs.utc(costAnalysisPageState?.period?.end).format(dateFormat),
                filter: analyzeApiQueryHelper.data.filter,
                query: analyzeApiQueryHelper.data,
            },
            fields: tableState.excelFields,
            file_name_prefix: FILE_NAME_PREFIX.costAnalysis,
        });
    } catch (e) {
        ErrorHandler.handleError(e);
    } finally {
        state.visibleExcelNotiModal = false;
    }
};
const handleExport = async () => {
    await handleExcelDownload();
};

watch(
    [
        () => costAnalysisPageState,
        () => costAnalysisPageStore.selectedDataSourceId,
        () => costAnalysisPageStore.selectedQueryId,
    ],
    async ([, selectedDataSourceId]) => {
        if (!selectedDataSourceId) return;
        const { results, more } = await listCostAnalysisTableData();
        if (costAnalysisPageState.period) {
            tableState.items = getRefinedChartTableData(results, costAnalysisPageState.granularity, costAnalysisPageState.period);
            tableState.more = more;
            tableState.costFields = getDataTableCostFields(costAnalysisPageState.granularity, costAnalysisPageState.period, !!tableState.groupByFields.length);
        }
    },
    { immediate: true, deep: true },
);

// LOAD REFERENCE STORE
(async () => {
    await Promise.allSettled([
        store.dispatch('reference/projectGroup/load'),
        store.dispatch('reference/project/load'),
        store.dispatch('reference/provider/load'),
        store.dispatch('reference/region/load'),
        store.dispatch('reference/serviceAccount/load'),
    ]);
})();
</script>

<template>
    <fragment>
        <p-toolbox-table class="cost-analysis-data-table"
                         :loading="tableState.loading"
                         :fields="tableState.fields"
                         :items="tableState.items"
                         :searchable="false"
                         row-height-fixed
                         exportable
                         @change="handleChange"
                         @refresh="handleChange()"
                         @export="handleExport"
        >
            <template #th-format="{field}">
                {{ field.label }}
                <span class="field-description">{{ fieldDescriptionFormatter(field) }}</span>
            </template>
            <template #col-format="{field, value, item}">
                <span v-if="tableState.loading" />
                <span v-else-if="Object.values(GROUP_BY).includes(field.name) && !value">
                    Unknown
                </span>
                <span v-else-if="field.name === GROUP_BY.PROJECT_GROUP">
                    {{ state.projectGroups[value] ? state.projectGroups[value].label : value }}
                </span>
                <span v-else-if="field.name === GROUP_BY.PROJECT">
                    {{ state.projects[value] ? state.projects[value].label : value }}
                </span>
                <span v-else-if="field.name === GROUP_BY.PROVIDER">
                    {{ state.providers[value] ? state.providers[value].name : value }}
                </span>
                <span v-else-if="field.name === GROUP_BY.REGION">
                    {{ state.regions[value] ? state.regions[value].name : value }}
                </span>
                <span v-else-if="field.name === GROUP_BY.SERVICE_ACCOUNT">
                    {{ state.serviceAccounts[value] ? state.serviceAccounts[value].name : value }}
                </span>
                <span v-else-if="field.name === 'totalCost'">
                    {{ $t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.TOTAL_COST') }}
                </span>
                <span v-else-if="typeof value !== 'string'"
                      class="text-center"
                >
                    <p-link :to="value ? getLink(item, field.name) : undefined"
                            class="!align-middle"
                    >
                        <template v-if="getIsRaised(item, field.name)">
                            <span class="cell-text raised">{{ numberFormatter(value) }}</span>
                            <p-i name="ic_arrow-up-bold-alt"
                                 width="0.75rem"
                                 height="0.75rem"
                            />
                        </template>
                        <template v-else>
                            <span class="usage-wrapper">
                                {{ numberFormatter(value) }}
                                <p-divider v-if="state.isIncludedUsageTypeInGroupBy"
                                           vertical
                                           class="divider"
                                />
                                <span v-if="state.isIncludedUsageTypeInGroupBy">
                                    {{ getUsageQuantity(item, field.name) }}
                                </span>
                            </span>
                        </template>
                    </p-link>
                </span>
            </template>
        </p-toolbox-table>
        <p-button-modal :visible.sync="state.visibleExcelNotiModal"
                        hide-header
                        size="sm"
                        @confirm="handleExcelDownload"
        >
            <template #body>
                <p class="mt-4">
                    {{ $t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.ALT_EXCEL_DOWNLOAD_STACKED') }}
                </p>
            </template>
            <template #confirm-button>
                {{ $t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.DOWNLOAD') }}
            </template>
        </p-button-modal>
    </fragment>
</template>

<style lang="postcss" scoped>
.cost-analysis-data-table {
    .field-description {
        @apply text-gray-400;
        white-space: pre;
        display: flex;
    }
    .cell-text {
        &.raised {
            @apply text-alert;
        }
    }
    .usage-wrapper {
        display: inline-flex;
        align-items: center;
        .divider {
            @apply text-gray-200 inline-block;
            height: 1rem;
            margin: 0 0.25rem;
        }
    }
}
</style>
