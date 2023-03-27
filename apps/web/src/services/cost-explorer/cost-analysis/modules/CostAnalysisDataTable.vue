<template>
    <fragment>
        <p-toolbox-table class="cost-analysis-data-table"
                         :loading="tableState.loading"
                         :fields="tableState.fields"
                         :items="tableState.items"
                         :total-count="tableState.totalCount"
                         :searchable="false"
                         :row-height-fixed="!printMode"
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
                    {{ projectGroups[value] ? projectGroups[value].label : value }}
                </span>
                <span v-else-if="field.name === GROUP_BY.PROJECT">
                    {{ projects[value] ? projects[value].label : value }}
                </span>
                <span v-else-if="field.name === GROUP_BY.PROVIDER">
                    {{ providers[value] ? providers[value].name : value }}
                </span>
                <span v-else-if="field.name === GROUP_BY.REGION">
                    {{ regions[value] ? regions[value].name : value }}
                </span>
                <span v-else-if="field.name === GROUP_BY.SERVICE_ACCOUNT">
                    {{ serviceAccounts[value] ? serviceAccounts[value].name : value }}
                </span>
                <span v-else-if="field.name === 'totalCost'">
                    {{ $t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.TOTAL_COST') }}
                </span>
                <span v-else-if="typeof value !== 'string'"
                      class="text-center"
                >
                    <p-anchor :to="value ? getLink(item, field.name) : undefined"
                              hide-icon
                              class="!align-middle"
                    >
                        <template v-if="getIsRaised(item, field.name)">
                            <span class="cell-text raised">{{ currencyMoneyFormatter(value, currency, currencyRates, true) }}</span>
                            <p-i name="ic_arrow-up-bold-alt"
                                 width="0.75rem"
                                 height="0.75rem"
                            />
                        </template>
                        <template v-else>
                            {{ currencyMoneyFormatter(value, currency, currencyRates, true) }}
                        </template>
                    </p-anchor>
                </span>
            </template>
        </p-toolbox-table>
        <p-button-modal :visible.sync="visibleExcelNotiModal"
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

<script lang="ts">
import {
    computed, reactive, toRefs, watch,
} from 'vue';
import type { Location } from 'vue-router';

import {
    PAnchor, PI, PToolboxTable, PDataTable, PButtonModal,
} from '@spaceone/design-system';
import type { DataTableFieldType } from '@spaceone/design-system/types/data-display/tables/data-table/type';
import type { CancelTokenSource } from 'axios';
import axios from 'axios';
import dayjs from 'dayjs';
import { get } from 'lodash';
import type { Table } from 'pdfmake/interfaces';

import { setApiQueryWithToolboxOptions } from '@cloudforet/core-lib/component-util/toolbox';
import { QueryHelper } from '@cloudforet/core-lib/query';
import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import { store } from '@/store';
import { i18n } from '@/translations';

import type { ExcelDataField } from '@/store/modules/file/type';
import type { ProjectGroupReferenceMap } from '@/store/modules/reference/project-group/type';
import type { ProjectReferenceMap } from '@/store/modules/reference/project/type';
import type { ProviderReferenceMap } from '@/store/modules/reference/provider/type';
import type { RegionReferenceMap } from '@/store/modules/reference/region/type';
import type { ServiceAccountReferenceMap } from '@/store/modules/reference/service-account/type';

import { FILE_NAME_PREFIX } from '@/lib/excel-export';
import { currencyMoneyFormatter } from '@/lib/helper/currency-helper';
import { objectToQueryString, primitiveToQueryString, arrayToQueryString } from '@/lib/router-query-string';

import type { Item as PdfOverlayItem } from '@/common/components/layouts/PdfDownloadOverlay/PdfDownloadOverlay.vue';
import ErrorHandler from '@/common/composables/error/errorHandler';

import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/route-config';
import {
    GRANULARITY, GROUP_BY, GROUP_BY_ITEM_MAP, MORE_GROUP_BY, MORE_GROUP_BY_ITEM_MAP,
} from '@/services/cost-explorer/lib/config';
import {
    getConvertedFilter, getDataTableCostFields, getTimeUnitByPeriod,
} from '@/services/cost-explorer/lib/helper';
import { useCostAnalysisPageStore } from '@/services/cost-explorer/store/cost-analysis-page-store';
import type { CostAnalyzeModel, UsdCost } from '@/services/cost-explorer/widgets/type';


interface PrintModeFieldSet {
    widths?: Table['widths'];
    fields: DataTableFieldType[];
}
// must be greater than selectable group by items' count
const PRINT_MODE_MAX_COL = 10;

export default {
    name: 'CostAnalysisDataTable',
    components: {
        PButtonModal,
        PAnchor,
        PI,
        PToolboxTable,
    },
    props: {
        printMode: {
            type: Boolean,
            default: false,
        },
    },
    setup(props, { emit }) {
        const costAnalysisPageStore = useCostAnalysisPageStore();
        const costAnalysisPageState = costAnalysisPageStore.$state;

        const state = reactive({
            component: computed(() => (props.printMode ? PDataTable : PToolboxTable)),
            timeUnit: computed(() => getTimeUnitByPeriod(costAnalysisPageState.granularity, dayjs.utc(costAnalysisPageState.period.start), dayjs.utc(costAnalysisPageState.period.end))),
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
            currency: computed(() => store.state.display.currency),
            currencyRates: computed(() => store.state.display.currencyRates),
            groupByStoreMap: computed(() => ({
                [GROUP_BY.PROJECT_GROUP]: state.projectGroups,
                [GROUP_BY.PROJECT]: state.projects,
                [GROUP_BY.PROVIDER]: state.providers,
                [GROUP_BY.REGION]: state.regions,
                [GROUP_BY.SERVICE_ACCOUNT]: state.serviceAccounts,
            })),
            visibleExcelNotiModal: false,
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
                if (d.name.startsWith('usd_cost')) {
                    field.type = 'currency';
                    field.options = {
                        currency: state.currency,
                        currencyRates: state.currencyRates,
                    };
                }
                return field;
            })),
            groupByFields: computed<DataTableFieldType[]>(() => {
                const groupByItems = costAnalysisPageState.groupBy.map((d) => ({
                    ...GROUP_BY_ITEM_MAP[d],
                    sortable: false,
                }));
                const moreGroupByItems = costAnalysisPageStore.orderedMoreGroupByItems.filter((d) => d.selected).map((d) => ({
                    name: `${d.category}_${d.key}`,
                    label: d.key,
                    sortable: false,
                }));
                return [...groupByItems, ...moreGroupByItems];
            }),
            costFields: [] as DataTableFieldType[],
            fields: computed<DataTableFieldType[]>(() => tableState.groupByFields.concat(tableState.costFields)),
            items: [] as CostAnalyzeModel[],
            totalCount: 0,
        });

        /* util */
        const getLink = (item: CostAnalyzeModel, fieldName: string) => {
            const queryHelper = new QueryHelper();
            const query: Location['query'] = {};
            if (item.region_code) {
                query.region = arrayToQueryString([item.region_code]);
            } else if (costAnalysisPageState.filters.region_code?.length) {
                query.region = arrayToQueryString(costAnalysisPageState.filters.region_code);
            }
            if (item.provider) {
                query.provider = primitiveToQueryString(item.provider);
            } else if (costAnalysisPageState.filters.provider?.length) {
                query.provider = primitiveToQueryString(costAnalysisPageState.filters.provider[0].v);
            }

            if (costAnalysisPageState.granularity === GRANULARITY.ACCUMULATED) {
                query.period = objectToQueryString(costAnalysisPageState.period);
            } else {
                const date = fieldName.split('.')[1]; // usd_cost.2022-01-04
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
            } else if (costAnalysisPageState.filters.project_id?.length) {
                filters.push({ k: 'project_id', v: costAnalysisPageState.filters.project_id.map(({ v }) => v), o: '=' });
            }

            if (typeof item.project_group_id === 'string') {
                filters.push({ k: 'project_group_id', v: item.project_group_id, o: '=' });
            } else if (costAnalysisPageState.filters.project_group_id?.length) {
                filters.push({ k: 'project_group_id', v: costAnalysisPageState.filters.project_group_id.map(({ v }) => v), o: '=' });
            }

            if (typeof item.service_account_id === 'string') {
                filters.push({ k: 'collection_info.service_account_id', v: item.service_account_id, o: '=' });
            } else if (costAnalysisPageState.filters.service_account_id?.length) {
                filters.push({ k: 'collection_info.service_account_id', v: costAnalysisPageState.filters.service_account_id.map(({ v }) => v), o: '=' });
            }

            if (typeof item.account === 'string') {
                filters.push({ k: 'account', v: item.account, o: '=' });
            } else if (costAnalysisPageState.filters.account?.length) {
                filters.push({ k: 'account', v: costAnalysisPageState.filters.account.map(({ v }) => v), o: '=' });
            }

            if (typeof item.product === 'string') {
                filters.push({ k: 'service_code', v: item.product, o: '=' });
            } else if (costAnalysisPageState.filters.product?.length) {
                filters.push({ k: 'service_code', v: costAnalysisPageState.filters.product.map(({ v }) => v), o: '=' });
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
        const getIsRaised = (item: CostAnalyzeModel, fieldName: string): boolean => {
            const currDate: string = fieldName.split('.')[1]; // usd_cost.2022-01-04
            const prevDate: string = dayjs.utc(currDate).subtract(1, state.timeUnit).format(state.dateFormat);
            const currValue: number|undefined = item.usd_cost[currDate];
            const prevValue: number|undefined = item.usd_cost[prevDate];

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
        const _getStackedTableData = (rawData: CostAnalyzeModel[], granularity, period): CostAnalyzeModel[] => {
            const results: CostAnalyzeModel[] = [];
            rawData.forEach((d) => {
                const usdCost: UsdCost = {};
                let now = dayjs.utc(period.start).clone();
                let stackedData = 0;
                while (now.isSameOrBefore(dayjs.utc(period.end), state.timeUnit)) {
                    const currValue = d.usd_cost[now.format(state.dateFormat)] || 0;
                    stackedData += currValue;
                    usdCost[now.format(state.dateFormat)] = stackedData;
                    now = now.add(1, state.timeUnit);
                }
                results.push({
                    ...d,
                    usd_cost: usdCost,
                });
            });
            return results;
        };
        const fieldDescriptionFormatter = (field: DataTableFieldType): string => {
            if (field.name.startsWith(`${MORE_GROUP_BY.TAGS}_`)) {
                return ` (${MORE_GROUP_BY_ITEM_MAP[MORE_GROUP_BY.TAGS].label})`;
            }
            if (field.name.startsWith(`${MORE_GROUP_BY.ADDITIONAL_INFO}_`)) {
                return ` (${MORE_GROUP_BY_ITEM_MAP[MORE_GROUP_BY.ADDITIONAL_INFO].label})`;
            }
            return '';
        };

        /* api */
        let listCostAnalysisRequest: CancelTokenSource | undefined;
        const costApiQueryHelper = new ApiQueryHelper()
            .setPageStart(1).setPageLimit(15)
            .setSort('total_usd_cost', true);
        const listCostAnalysisTableData = async (granularity, groupBy, moreGroupBy, period, filters, stack) => {
            if (listCostAnalysisRequest) {
                listCostAnalysisRequest.cancel('Next request has been called.');
                listCostAnalysisRequest = undefined;
            }
            listCostAnalysisRequest = axios.CancelToken.source();
            try {
                tableState.loading = true;
                const _convertedFilters = getConvertedFilter(filters);
                costApiQueryHelper.setFilters(_convertedFilters);

                const query = costApiQueryHelper.data;
                if (props.printMode) query.page = undefined;

                const moreGroupByKeyList = moreGroupBy.filter((d) => d.selected).map((d) => `${d.category}.${d.key}`);

                const dateFormat = costAnalysisPageState.granularity === GRANULARITY.MONTHLY ? 'YYYY-MM' : 'YYYY-MM-DD';
                const { results, total_count } = await SpaceConnector.client.costAnalysis.cost.analyze({
                    granularity,
                    group_by: [...groupBy, ...moreGroupByKeyList],
                    start: dayjs.utc(period.start).format(dateFormat),
                    end: dayjs.utc(period.end).format(dateFormat),
                    ...query,
                });
                let items = results;
                if (granularity !== GRANULARITY.ACCUMULATED && stack) items = _getStackedTableData(results, granularity, period);
                tableState.items = items;
                tableState.totalCount = total_count;
                listCostAnalysisRequest = undefined;
            } catch (e) {
                tableState.items = [];
                tableState.totalCount = 0;
                ErrorHandler.handleError(e);
            } finally {
                tableState.loading = false;
            }
        };

        /* event */
        const handleChange = async (options: any = {}) => {
            setApiQueryWithToolboxOptions(costApiQueryHelper, options, { queryTags: true });
            await listCostAnalysisTableData(
                costAnalysisPageStore.currentQuerySetOptions.granularity,
                costAnalysisPageStore.currentQuerySetOptions.group_by,
                costAnalysisPageStore.orderedMoreGroupByItems,
                costAnalysisPageStore.currentQuerySetOptions.period,
                costAnalysisPageStore.currentQuerySetOptions.filters,
                costAnalysisPageStore.currentQuerySetOptions.stack,
            );
        };
        const handleRefresh = async () => {
            await listCostAnalysisTableData(
                costAnalysisPageStore.currentQuerySetOptions.granularity,
                costAnalysisPageStore.currentQuerySetOptions.group_by,
                costAnalysisPageStore.orderedMoreGroupByItems,
                costAnalysisPageStore.currentQuerySetOptions.period,
                costAnalysisPageStore.currentQuerySetOptions.filters,
                costAnalysisPageStore.currentQuerySetOptions.stack,
            );
        };
        const handleExcelDownload = async () => {
            try {
                const _convertedFilters = getConvertedFilter(costAnalysisPageState.filters);
                costApiQueryHelper.setFilters(_convertedFilters);

                const dateFormat = costAnalysisPageState.granularity === GRANULARITY.MONTHLY ? 'YYYY-MM' : 'YYYY-MM-DD';


                await store.dispatch('file/downloadExcel', {
                    url: '/cost-analysis/cost/analyze',
                    param: {
                        granularity: costAnalysisPageStore.currentQuerySetOptions.granularity,
                        group_by: costAnalysisPageStore.currentQuerySetOptions.group_by,
                        start: dayjs.utc(costAnalysisPageState.period.start).format(dateFormat),
                        end: dayjs.utc(costAnalysisPageState.period.end).format(dateFormat),
                        filter: costApiQueryHelper.data.filter,
                        query: costApiQueryHelper.data,
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
            if (costAnalysisPageState.granularity !== GRANULARITY.ACCUMULATED && costAnalysisPageState.stack) {
                state.visibleExcelNotiModal = true;
            } else await handleExcelDownload();
        };

        // Link for setting table widths: https://pdfmake.github.io/docs/0.1/document-definition-object/tables/
        const getPrintModeFieldSets = (): PrintModeFieldSet[] => {
            const groupByLength = tableState.groupByFields.length;
            const costFieldLength = tableState.costFields.length;
            const totalLength = costFieldLength + groupByLength;
            const costColumnCount = PRINT_MODE_MAX_COL - groupByLength;
            const groupByFieldWidthValues = Array(groupByLength).fill('auto');
            let costFieldWidthValues = Array(tableState.costFields.length).fill('*');

            if (props.printMode && totalLength > PRINT_MODE_MAX_COL) {
                const fieldSetCount = Math.ceil(costFieldLength / costColumnCount);
                const results = [] as PrintModeFieldSet[];
                for (let idx = 0; idx < fieldSetCount; idx++) {
                    const tableFields = tableState.costFields.slice(idx * costColumnCount, (idx + 1) * costColumnCount);
                    costFieldWidthValues = Array(tableFields.length).fill('*');
                    const widths = groupByFieldWidthValues.concat(costFieldWidthValues);
                    results.push({
                        widths,
                        fields: tableState.groupByFields.concat(tableFields),
                    });
                }
                return results;
            }
            return [{
                widths: groupByFieldWidthValues.concat(costFieldWidthValues),
                fields: tableState.groupByFields.concat(tableState.costFields),
            }];
        };

        const getPdfItems = (): PdfOverlayItem[] => {
            const items = tableState.items;
            const fieldSets = getPrintModeFieldSets();
            return fieldSets.map(({ widths, fields }) => {
                const headRows: string[][] = [fields.map((f) => f.label as string)];
                const bodyRows: string[][] = items.map((d) => fields.map((f) => {
                    let value = get(d, f.name, '-');
                    if (f.name === 'totalCost') value = i18n.t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.TOTAL_COST');
                    else if (state.groupByStoreMap[f.name]) {
                        const referenceStore = state.groupByStoreMap[f.name];
                        value = referenceStore[value] ? referenceStore[value].label : value;
                    } else if (typeof value === 'number') {
                        value = currencyMoneyFormatter(value, state.currency, state.currencyRates, true);
                    }

                    return value;
                }));
                return {
                    tableData: {
                        widths,
                        body: headRows.concat(bodyRows),
                    },
                    type: 'data-table',
                };
            });
        };

        watch(
            [
                () => costAnalysisPageState.granularity,
                () => costAnalysisPageState.groupBy,
                () => costAnalysisPageStore.orderedMoreGroupByItems,
                () => costAnalysisPageState.period,
                () => costAnalysisPageState.filters,
                () => costAnalysisPageState.stack,
            ],
            async ([granularity, groupBy, moreGroupBy, period, filters, stack]) => {
                await listCostAnalysisTableData(granularity, groupBy, moreGroupBy, period, filters, stack);
                tableState.costFields = getDataTableCostFields(granularity, period, !!tableState.groupByFields.length);
                if (props.printMode) emit('rendered', getPdfItems());
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

        return {
            ...toRefs(state),
            tableState,
            GROUP_BY,
            GROUP_BY_ITEM_MAP,
            handleChange,
            handleRefresh,
            handleExport,
            handleExcelDownload,
            getLink,
            getIsRaised,
            fieldDescriptionFormatter,
            currencyMoneyFormatter,
        };
    },
};
</script>

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
}
</style>
