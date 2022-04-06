<template>
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
        <template #col-format="{field, value, item}">
            <span v-if="tableState.loading" />
            <span v-else-if="Object.values(GROUP_BY).includes(field.name) && !value">
                --
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
            <span v-else-if="typeof value !== 'string'" class="text-center">
                <p-anchor :to="value ? getLink(item, field.name) : undefined"
                          :show-icon="false"
                >
                    <template v-if="getIsRaised(item, field.name)">
                        <span class="cell-text raised">{{ currencyMoneyFormatter(value, currency, currencyRates, true) }}</span>
                        <p-i name="ic_bold-arrow-up" width="0.75rem" />
                    </template>
                    <template v-else>
                        {{ currencyMoneyFormatter(value, currency, currencyRates, true) }}
                    </template>
                </p-anchor>
            </span>
        </template>
    </p-toolbox-table>
</template>

<script lang="ts">
import dayjs from 'dayjs';
import axios, { CancelTokenSource } from 'axios';
import { get } from 'lodash';
import {
    computed, reactive, toRefs, watch,
} from '@vue/composition-api';

import {
    PAnchor, PI, PToolboxTable, PDataTable,
} from '@spaceone/design-system';
import { DataTableFieldType } from '@spaceone/design-system/dist/src/data-display/tables/data-table/type';

import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { ApiQueryHelper } from '@spaceone/console-core-lib/space-connector/helper';
import { setApiQueryWithToolboxOptions } from '@spaceone/console-core-lib/component-util/toolbox';

import { GRANULARITY, GROUP_BY, GROUP_BY_ITEM_MAP } from '@/services/cost-explorer/lib/config';
import {
    getConvertedFilter, getDataTableCostFields, getTimeUnitByPeriod,
} from '@/services/cost-explorer/cost-analysis/lib/helper';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { GroupByItem } from '@/services/cost-explorer/cost-analysis/store/type';
import { FILE_NAME_PREFIX } from '@/lib/excel-export';
import { currencyMoneyFormatter } from '@/lib/helper/currency-helper';
import { objectToQueryString, primitiveToQueryString, arrayToQueryString } from '@/lib/router-query-string';
import { store } from '@/store';
import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/route-config';
import { QueryHelper } from '@spaceone/console-core-lib/query';
import { Location } from 'vue-router';
import { QueryStoreFilter } from '@spaceone/console-core-lib/query/type';
import { CostAnalyzeModel, UsdCost } from '@/services/cost-explorer/widgets/type';
import { ExcelDataField } from '@/store/modules/file/type';
import { Item as PdfOverlayItem } from '@/common/components/layouts/PdfDownloadOverlay/PdfDownloadOverlay.vue';
import { i18n } from '@/translations';
import { ResourceMap } from '@/store/modules/resource/type';
// eslint-disable-next-line import/extensions,import/no-unresolved
import { Table } from 'pdfmake/interfaces';

interface PrintModeFieldSet {
    widths?: Table['widths'];
    fields: DataTableFieldType[];
}
// must be greater than selectable group by items' count
const PRINT_MODE_MAX_COL = 10;

export default {
    name: 'CostAnalysisDataTable',
    components: {
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
        const state = reactive({
            component: computed(() => (props.printMode ? PDataTable : PToolboxTable)),
            timeUnit: computed(() => getTimeUnitByPeriod(state.granularity, dayjs.utc(state.period.start), dayjs.utc(state.period.end))),
            dateFormat: computed(() => {
                if (state.granularity === GRANULARITY.MONTHLY) return 'YYYY-MM';
                if (state.granularity === GRANULARITY.YEARLY) return 'YYYY';
                return 'YYYY-MM-DD';
            }),
            //
            projectGroups: computed(() => store.state.resource.projectGroup.items),
            projects: computed(() => store.state.resource.project.items),
            providers: computed(() => store.state.resource.provider.items),
            regions: computed(() => store.state.resource.region.items),
            serviceAccounts: computed(() => store.state.resource.serviceAccount.items),
            //
            granularity: computed(() => store.state.service.costAnalysis.granularity),
            stack: computed(() => store.state.service.costAnalysis.stack),
            period: computed(() => store.state.service.costAnalysis.period),
            filters: computed(() => store.state.service.costAnalysis.filters),
            groupBy: computed(() => store.state.service.costAnalysis.groupBy),
            //
            groupByItems: computed<GroupByItem[]>(() => store.getters['service/costAnalysis/groupByItems']),
            currency: computed(() => store.state.display.currency),
            currencyRates: computed(() => store.state.display.currencyRates),
            groupByStoreMap: computed<Record<string, ResourceMap>>(() => ({
                [GROUP_BY.PROJECT_GROUP]: state.projectGroups,
                [GROUP_BY.PROJECT]: state.projects,
                [GROUP_BY.PROVIDER]: state.providers,
                [GROUP_BY.REGION]: state.regions,
                [GROUP_BY.SERVICE_ACCOUNT]: state.serviceAccounts,
            })),
        });
        const tableState = reactive({
            loading: true,
            excelFields: computed<ExcelDataField[]>(() => tableState.groupByFields.concat(tableState.costFields).map((d) => {
                const field: ExcelDataField = { key: d.name, name: d.label };
                if (d.name === GROUP_BY.PROJECT) field.reference = { reference_key: 'project_id', resource_type: 'identity.Project' };
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
            groupByFields: computed<DataTableFieldType[]>(() => state.groupByItems.map(d => ({
                name: d.name,
                label: d.label,
                sortable: false,
            }))),
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
                query.region = item.region_code;
            } else if (state.filters.region_code?.length) {
                query.region = arrayToQueryString(state.filters.region_code);
            }
            if (item.provider) {
                query.provider = primitiveToQueryString(item.provider);
            } else if (state.filters.provider?.length) {
                query.provider = primitiveToQueryString(state.filters.provider[0]);
            }

            if (state.granularity === GRANULARITY.ACCUMULATED) {
                query.period = objectToQueryString(state.period);
            } else {
                const date = fieldName.split('.')[1]; // usd_cost.2022-01-04
                const _period = { start: date, end: date };
                if (state.granularity === GRANULARITY.MONTHLY) {
                    _period.start = dayjs.utc(date).format('YYYY-MM-01');
                    _period.end = dayjs.utc(date).endOf('month').format('YYYY-MM-DD');
                }
                query.period = objectToQueryString(_period);
            }

            const filters: QueryStoreFilter[] = [];
            if (item.project_id) {
                filters.push({ k: 'project_id', v: item.project_id, o: '=' });
            } else if (state.filters.project_id?.length) {
                filters.push({ k: 'project_id', v: state.filters.project_id, o: '=' });
            }

            if (item.project_group_id) {
                filters.push({ k: 'project_group_id', v: item.project_group_id, o: '=' });
            } else if (state.filters.project_group_id?.length) {
                filters.push({ k: 'project_group_id', v: state.filters.project_group_id, o: '=' });
            }

            if (item.service_account_id) {
                filters.push({ k: 'collection_info.service_accounts', v: item.service_account_id, o: '=' });
            } else if (state.filters.service_account_id?.length) {
                filters.push({ k: 'collection_info.service_accounts', v: state.filters.service_account_id, o: '=' });
            }

            if (item.account) {
                filters.push({ k: 'account', v: item.account, o: '=' });
            } else if (state.filters.account?.length) {
                filters.push({ k: 'account', v: state.filters.account, o: '=' });
            }

            if (item.product) {
                filters.push({ k: 'service_code', v: item.product, o: '=' });
            } else if (state.filters.product?.length) {
                filters.push({ k: 'service_code', v: state.filters.product, o: '=' });
            }

            return {
                name: ASSET_INVENTORY_ROUTE.CLOUD_SERVICE.TYPE._NAME,
                params: {},
                query: {
                    filters: queryHelper.setFilters(filters).rawQueryStrings,
                    ...query,
                },
            };
        };
        const getIsRaised = (item: CostAnalyzeModel, fieldName: string) => {
            const currDate = fieldName.split('.')[1]; // usd_cost.2022-01-04
            const prevDate = dayjs.utc(currDate).subtract(1, state.timeUnit).format(state.dateFormat);
            const currValue = item.usd_cost[currDate] ?? 0;
            const prevValue = item.usd_cost[prevDate] ?? 0;
            if (prevValue && currValue - prevValue > 0) return ((currValue - prevValue) / prevValue) * 100 > 50;
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

        /* api */
        let listCostAnalysisRequest: CancelTokenSource | undefined;
        const costApiQueryHelper = new ApiQueryHelper()
            .setPageStart(1).setPageLimit(15)
            .setSort('total_usd_cost', true);
        const listCostAnalysisTableData = async (granularity, groupBy, period, filters, stack) => {
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

                const dateFormat = state.granularity === GRANULARITY.MONTHLY ? 'YYYY-MM' : 'YYYY-MM-DD';
                const { results, total_count } = await SpaceConnector.client.costAnalysis.cost.analyze({
                    granularity,
                    group_by: groupBy,
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
            await listCostAnalysisTableData(state.granularity, state.groupBy, state.period, state.filters, state.stack);
        };
        const handleRefresh = async () => {
            await listCostAnalysisTableData(state.granularity, state.groupBy, state.period, state.filters, state.stack);
        };
        const handleExport = async () => {
            try {
                const _convertedFilters = getConvertedFilter(state.filters);
                costApiQueryHelper.setFilters(_convertedFilters);

                const dateFormat = state.granularity === GRANULARITY.MONTHLY ? 'YYYY-MM' : 'YYYY-MM-DD';
                await store.dispatch('file/downloadExcel', {
                    url: '/cost-analysis/cost/analyze',
                    param: {
                        granularity: state.granularity,
                        group_by: state.groupBy,
                        start: dayjs.utc(state.period.start).format(dateFormat),
                        end: dayjs.utc(state.period.end).format(dateFormat),
                        filter: costApiQueryHelper.data.filter,
                        query: costApiQueryHelper.data,
                    },
                    fields: tableState.excelFields,
                    file_name_prefix: FILE_NAME_PREFIX.costAnalysis,
                });
            } catch (e) {
                ErrorHandler.handleError(e);
            }
        };

        // Link for setting table widths: https://pdfmake.github.io/docs/0.1/document-definition-object/tables/
        const getPrintModeFieldSets = (): PrintModeFieldSet[] => {
            const groupByLength = state.groupByItems.length;
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
                const headRows: string[][] = [fields.map(f => f.label as string)];
                const bodyRows: string[][] = items.map(d => fields.map((f) => {
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

        watch([() => state.granularity, () => state.groupBy, () => state.period, () => state.filters, () => state.stack], async ([granularity, groupBy, period, filters, stack]) => {
            await listCostAnalysisTableData(granularity, groupBy, period, filters, stack);
            tableState.costFields = getDataTableCostFields(granularity, period, !!tableState.groupByFields.length);
            if (props.printMode) emit('rendered', getPdfItems());
        }, { immediate: true, deep: true });

        // LOAD REFERENCE STORE
        (async () => {
            await Promise.allSettled([
                store.dispatch('resource/projectGroup/load'),
                store.dispatch('resource/project/load'),
                store.dispatch('resource/provider/load'),
                store.dispatch('resource/region/load'),
                store.dispatch('resource/serviceAccount/load'),
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
            getLink,
            getIsRaised,
            currencyMoneyFormatter,
        };
    },
};
</script>

<style lang="postcss" scoped>
.cost-analysis-data-table {
    .cell-text {
        &.raised {
            @apply text-alert;
        }
    }
}
</style>
