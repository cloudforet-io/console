<script lang="ts" setup>
import { computed, reactive, watch } from 'vue';
import type { Location } from 'vue-router';

import {
    PButtonModal, PI, PLink, PToolboxTable, PTextPagination, PCollapsibleToggle,
} from '@spaceone/design-system';
import type { DataTableFieldType } from '@spaceone/design-system/types/data-display/tables/data-table/type';
import dayjs from 'dayjs';
import { cloneDeep, find, sortBy } from 'lodash';

import { getPageStart } from '@cloudforet/core-lib/component-util/pagination';
import { setApiQueryWithToolboxOptions } from '@cloudforet/core-lib/component-util/toolbox';
import { QueryHelper } from '@cloudforet/core-lib/query';
import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { getCancellableFetcher } from '@cloudforet/core-lib/space-connector/cancallable-fetcher';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import { store } from '@/store';

import type { ProjectReferenceMap } from '@/store/modules/reference/project/type';
import type { ProviderReferenceMap } from '@/store/modules/reference/provider/type';
import type { RegionReferenceMap } from '@/store/modules/reference/region/type';
import type { ServiceAccountReferenceMap } from '@/store/modules/reference/service-account/type';

import { FILE_NAME_PREFIX } from '@/lib/excel-export/constant';
import { downloadExcel } from '@/lib/helper/file-download-helper';
import type { ExcelDataField } from '@/lib/helper/file-download-helper/type';
import { usageUnitFormatter } from '@/lib/helper/usage-formatter';
import { arrayToQueryString, objectToQueryString, primitiveToQueryString } from '@/lib/router-query-string';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/routes/route-constant';
import CostAnalysisDataTableDataTypeDropdown from '@/services/cost-explorer/components/CostAnalysisDataTableDataTypeDropdown.vue';
import {
    GRANULARITY,
    GROUP_BY,
    GROUP_BY_ITEM_MAP,
    ADDITIONAL_GROUP_BY,
    ADDITIONAL_GROUP_BY_ITEM_MAP,
} from '@/services/cost-explorer/constants/cost-explorer-constant';
import {
    getDataTableCostFields, getTimeUnitByGranularity,
} from '@/services/cost-explorer/helpers/cost-analysis-data-table-helper';
import { useCostAnalysisPageStore } from '@/services/cost-explorer/stores/cost-analysis-page-store';
import type {
    CostAnalyzeResponse, Granularity, Period, DisplayDataType,
} from '@/services/cost-explorer/types/cost-explorer-query-type';


type CostAnalyzeRawData = {
    [groupBy: string]: string | any;
    value_sum?: Array<{
        date: string;
        value: number|null;
    }>;
    usage_unit?: string;
    _total_value_sum?: number;
};

const costAnalysisPageStore = useCostAnalysisPageStore();
const costAnalysisPageGetters = costAnalysisPageStore.getters;
const costAnalysisPageState = costAnalysisPageStore.state;

const state = reactive({
    component: computed(() => PToolboxTable),
    timeUnit: computed(() => getTimeUnitByGranularity(costAnalysisPageState.granularity)),
    dateFormat: computed(() => {
        if (costAnalysisPageState.granularity === GRANULARITY.MONTHLY) return 'YYYY-MM';
        if (costAnalysisPageState.granularity === GRANULARITY.YEARLY) return 'YYYY';
        return 'YYYY-MM-DD';
    }),
    //
    projects: computed<ProjectReferenceMap>(() => store.getters['reference/projectItems']),
    providers: computed<ProviderReferenceMap>(() => store.getters['reference/providerItems']),
    regions: computed<RegionReferenceMap>(() => store.getters['reference/regionItems']),
    serviceAccounts: computed<ServiceAccountReferenceMap>(() => store.getters['reference/serviceAccountItems']),
    //
    groupByStoreMap: computed(() => ({
        [GROUP_BY.PROJECT]: state.projects,
        [GROUP_BY.PROVIDER]: state.providers,
        [GROUP_BY.REGION]: state.regions,
        [GROUP_BY.SERVICE_ACCOUNT]: state.serviceAccounts,
    })),
    visibleExcelNotiModal: false,
    isIncludedUsageTypeInGroupBy: computed<boolean>(() => costAnalysisPageState.groupBy.includes(GROUP_BY.USAGE_TYPE)),
    analyzeQuery: computed(() => {
        let dateFormat = 'YYYY-MM';
        if (costAnalysisPageState.granularity === GRANULARITY.YEARLY) dateFormat = 'YYYY';
        const groupBy = state.isIncludedUsageTypeInGroupBy ? [...costAnalysisPageState.groupBy, 'usage_unit'] : costAnalysisPageState.groupBy;
        const fields = {
            value_sum: {
                key: state.selectedDisplayDataType === 'usage' ? 'usage_quantity' : 'cost',
                operator: 'sum',
            },
        };
        return {
            granularity: costAnalysisPageState.granularity,
            group_by: groupBy,
            start: dayjs.utc(costAnalysisPageState.period?.start).format(dateFormat),
            end: dayjs.utc(costAnalysisPageState.period?.end).format(dateFormat),
            fields,
            sort: [{ key: '_total_value_sum', desc: true }],
            field_group: ['date'],
        };
    }),
    headerMenuItems: [
        { type: 'item', name: 'cost', label: 'Cost' },
        { type: 'item', name: 'usage', label: 'Usage' },
    ],
    selectedDisplayDataType: 'cost' as DisplayDataType,
});
const tableState = reactive({
    loading: true,
    excelFields: computed<ExcelDataField[]>(() => {
        const fields: DataTableFieldType[] = [];
        if (costAnalysisPageState.groupBy.length) fields.push(...tableState.groupByFields);
        if (state.isIncludedUsageTypeInGroupBy && state.selectedDisplayDataType === 'usage') {
            fields.push({
                name: 'usage_unit',
                label: 'Usage Unit',
                textAlign: 'right',
                sortable: false,
            });
        }
        fields.push(...tableState.costFields);
        return fields.map((d) => {
            const field: ExcelDataField = { key: d.name, name: (d.label) ?? '' };
            if (d.name === GROUP_BY.PROJECT) field.reference = { reference_key: 'project_id', resource_type: 'identity.Project' };
            if (d.name === GROUP_BY.SERVICE_ACCOUNT) field.reference = { reference_key: 'service_account_id', resource_type: 'identity.ServiceAccount' };
            if (d.name === GROUP_BY.REGION) field.reference = { reference_key: 'region_code', resource_type: 'inventory.Region' };
            if (d.name === GROUP_BY.PROVIDER) field.reference = { reference_key: 'provider', resource_type: 'identity.Provider' };
            return field;
        });
    }),
    groupByFields: computed<DataTableFieldType[]>(() => costAnalysisPageState.groupBy.map((d) => {
        if (GROUP_BY_ITEM_MAP[d]) {
            return {
                ...GROUP_BY_ITEM_MAP[d],
                sortable: false,
            };
        }
        return {
            name: d.split('.')[1],
            label: d.split('.')[1], // tags.Name -> Name
            isTagField: true,
            sortable: false,
        };
    })),
    costFields: [] as DataTableFieldType[],
    fields: computed<DataTableFieldType[]>(() => {
        const fields: DataTableFieldType[] = [];
        if (costAnalysisPageState.groupBy.length) fields.push(...tableState.groupByFields);
        if (state.isIncludedUsageTypeInGroupBy && state.selectedDisplayDataType === 'usage') {
            fields.push({
                name: 'usage_unit',
                label: 'Usage Unit',
                textAlign: 'right',
                sortable: false,
            });
        }
        fields.push(...tableState.costFields);
        return fields;
    }),
    items: [] as CostAnalyzeRawData[],
    thisPage: 1,
    pageSize: 15,
    more: false,
    showFormattedData: true,
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
    const date = item.value_sum?.[dateIndex].date;
    if (date) {
        const _period = { start: date, end: date };
        if (costAnalysisPageState.granularity === GRANULARITY.MONTHLY) {
            _period.start = dayjs.utc(date).format('YYYY-MM-01');
            _period.end = dayjs.utc(date).endOf('month').format('YYYY-MM-DD');
        }
        query.period = objectToQueryString(_period);
    }


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
const isIncreasedByHalfOrMore = (item: CostAnalyzeRawData, fieldName: string): boolean => {
    const currIndex = Number(fieldName.split('.')[1]); // value_sum.0.value -> 0
    if (currIndex === 0) return false;

    const prevIndex = currIndex - 1;
    const currValue = item.value_sum?.[currIndex]?.value ?? 0;
    const prevValue = item.value_sum?.[prevIndex]?.value ?? 0;

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
    if (field.name?.startsWith(`${ADDITIONAL_GROUP_BY.TAGS}_`)) {
        return ` (${ADDITIONAL_GROUP_BY_ITEM_MAP[ADDITIONAL_GROUP_BY.TAGS].label})`;
    }
    if (field.name?.startsWith(`${ADDITIONAL_GROUP_BY.ADDITIONAL_INFO}_`)) {
        return ` (${ADDITIONAL_GROUP_BY_ITEM_MAP[ADDITIONAL_GROUP_BY.ADDITIONAL_INFO].label})`;
    }
    return '';
};
const getRefinedChartTableData = (results: CostAnalyzeRawData[], granularity: Granularity, period: Period) => {
    const timeUnit = getTimeUnitByGranularity(granularity);
    let dateFormat = 'YYYY-MM-DD';
    if (timeUnit === 'month') dateFormat = 'YYYY-MM';
    else if (timeUnit === 'year') dateFormat = 'YYYY';

    const _results: CostAnalyzeRawData[] = cloneDeep(results);
    const refinedTableData: CostAnalyzeRawData[] = [];
    const today = dayjs.utc();
    _results.forEach((d) => {
        let target = cloneDeep(d.value_sum);
        let now = dayjs.utc(period.start).clone();
        while (now.isSameOrBefore(dayjs.utc(period.end), timeUnit)) {
            if (now.isAfter(today, timeUnit)) break;
            if (!find(target, { date: now.format(dateFormat) })) {
                target?.push({ date: now.format(dateFormat), value: 0 });
            }
            now = now.add(1, timeUnit);
        }
        target = sortBy(target, ['date']);
        refinedTableData.push({
            ...d,
            value_sum: target,
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
        analyzeApiQueryHelper
            .setFilters(costAnalysisPageGetters.consoleFilters)
            .setPage(getPageStart(tableState.thisPage, tableState.pageSize), tableState.pageSize);
        const { status, response } = await fetchCostAnalyze({
            data_source_id: costAnalysisPageGetters.selectedDataSourceId,
            query: {
                ...state.analyzeQuery,
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
const costAnalyzeExportQueryHelper = new QueryHelper();
const listCostAnalysisExcelData = async (): Promise<CostAnalyzeRawData[]> => {
    try {
        costAnalyzeExportQueryHelper.setFilters(costAnalysisPageGetters.consoleFilters);
        const { status, response } = await fetchCostAnalyze({
            data_source_id: costAnalysisPageGetters.selectedDataSourceId,
            query: {
                ...state.analyzeQuery,
                filter: costAnalyzeExportQueryHelper.apiQuery.filter,
            },
        });
        if (status === 'succeed') return response.results;
        return [];
    } catch (e) {
        ErrorHandler.handleError(e);
        return [];
    }
};

/* event */
const handleChange = async (options: any = {}) => {
    setApiQueryWithToolboxOptions(analyzeApiQueryHelper, options, { queryTags: true });
    const { results, more } = await listCostAnalysisTableData();
    if (costAnalysisPageState.period) tableState.items = getRefinedChartTableData(results, costAnalysisPageState.granularity, costAnalysisPageState.period);
    tableState.more = more ?? false;
};
const handleExcelDownload = async () => {
    try {
        const results = await listCostAnalysisExcelData();
        const refinedData = getRefinedChartTableData(results, costAnalysisPageState.granularity, costAnalysisPageState.period ?? {});
        await downloadExcel({
            data: refinedData,
            fields: tableState.excelFields,
            file_name_prefix: FILE_NAME_PREFIX.costAnalysis,
            version: 'v2',
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
const handleUpdateThisPage = async () => {
    const { results, more } = await listCostAnalysisTableData();
    tableState.items = getRefinedChartTableData(results, costAnalysisPageState.granularity, costAnalysisPageState.period ?? {});
    tableState.more = more ?? false;
};
const handleUpdateSelectedDisplayDataType = (selected: DisplayDataType) => {
    state.selectedDisplayDataType = selected;
};

watch(
    [
        () => costAnalysisPageState,
        () => costAnalysisPageGetters.selectedDataSourceId,
        () => costAnalysisPageGetters.selectedQueryId,
        () => state.selectedDisplayDataType,
    ],
    async ([, selectedDataSourceId]) => {
        if (!selectedDataSourceId) return;
        tableState.thisPage = 1;
        const { results, more } = await listCostAnalysisTableData();
        if (costAnalysisPageState.period) {
            tableState.items = getRefinedChartTableData(results, costAnalysisPageState.granularity, costAnalysisPageState.period);
            tableState.more = more ?? false;
            tableState.costFields = getDataTableCostFields(costAnalysisPageState.granularity, costAnalysisPageState.period, !!tableState.groupByFields.length);
        }
    },
    { immediate: true, deep: true },
);

// LOAD REFERENCE STORE
(async () => {
    await Promise.allSettled([
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
                         :page-size.sync="tableState.pageSize"
                         row-height-fixed
                         exportable
                         @change="handleChange"
                         @refresh="handleChange()"
                         @export="handleExport"
        >
            <template #pagination-area>
                <p-text-pagination :this-page.sync="tableState.thisPage"
                                   :disable-next-page="tableState.loading"
                                   :has-next-page="tableState.more"
                                   @update:thisPage="handleUpdateThisPage"
                />
            </template>
            <template #toolbox-left>
                <cost-analysis-data-table-data-type-dropdown @update-display-data-type="handleUpdateSelectedDisplayDataType" />
                <div class="toggle-wrapper">
                    <span class="label">{{ $t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.ORIGINAL_DATA') }}</span>
                    <p-collapsible-toggle :toggle-type="'switch'"
                                          :is-collapsed.sync="tableState.showFormattedData"
                                          class="collapsible-toggle"
                    />
                </div>
            </template>
            <template #th-format="{field}">
                {{ field.label }}
                <span class="field-description">{{ fieldDescriptionFormatter(field) }}</span>
            </template>
            <template #col-format="{field, value, item}">
                <span v-if="tableState.loading" />
                <span v-else-if="Object.values(GROUP_BY).includes(field.name) && !value">
                    Unknown
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
                <span v-else-if="field.name === 'Instance Type'">
                    {{ value ?? 'Unknown' }}
                </span>
                <span v-else-if="field.name === 'totalCost'">
                    {{ $t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.TOTAL_COST') }}
                </span>
                <span v-else-if="field.isTagField">
                    {{ value ?? 'Unknown' }}
                </span>
                <span v-else-if="field.name === 'usage_unit'">
                    {{ value ?? '--' }}
                </span>
                <span v-else-if="typeof value !== 'string'"
                      class="text-center"
                >
                    <p-link :to="value ? getLink(item, field.name) : undefined"
                            class="!align-middle"
                    >
                        <span class="usage-wrapper">
                            <span :class="isIncreasedByHalfOrMore(item, field.name) ? 'cell-text raised' : undefined">
                                {{ usageUnitFormatter(value, {unit: item.usage_unit}, tableState.showFormattedData) }}
                            </span>
                            <p-i v-if="isIncreasedByHalfOrMore(item, field.name)"
                                 name="ic_arrow-up-bold-alt"
                                 width="0.75rem"
                                 height="0.75rem"
                            />
                        </span>
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
    .toggle-wrapper {
        display: flex;
        align-items: center;
        padding-left: 1rem;
        .label {
            @apply text-label-md;
            font-weight: 700;
            padding-right: 0.5rem;
        }
    }
    .usage-wrapper {
        display: inline-flex;
        align-items: center;
    }
}
</style>
