<template>
    <p-toolbox-table :loading="tableState.loading"
                     :fields="tableState.fields"
                     :items="tableState.items"
                     :total-count="tableState.totalCount"
                     :searchable="false"
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
                {{ currencyMoneyFormatter(value, currency, currencyRates, true) }}
                <!--                <p-anchor :to="value ? getLink(item) : undefined" target="_self"-->
                <!--                          :show-icon="false"-->
                <!--                >-->
                <!--                </p-anchor>-->
            </span>
        </template>
    </p-toolbox-table>
</template>

<script lang="ts">
import dayjs from 'dayjs';
import axios, { CancelTokenSource } from 'axios';

import {
    computed, reactive, toRefs, watch,
} from '@vue/composition-api';

import { PToolboxTable } from '@spaceone/design-system';
import { DataTableField } from '@spaceone/design-system/dist/src/data-display/tables/data-table/type';

import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { ApiQueryHelper } from '@spaceone/console-core-lib/space-connector/helper';
import { setApiQueryWithToolboxOptions } from '@spaceone/console-core-lib/component-util/toolbox';

import { GRANULARITY, GROUP_BY, GROUP_BY_ITEM_MAP } from '@/services/billing/cost-management/lib/config';
import {
    getConvertedFilter,
    getTimeUnitByPeriod,
} from '@/services/billing/cost-management/cost-analysis/lib/helper';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { GroupByItem } from '@/services/billing/cost-management/cost-analysis/store/type';
import { FILE_NAME_PREFIX } from '@/lib/excel-export';
import { currencyMoneyFormatter } from '@/lib/helper/currency-helper';
import { showLoadingMessage } from '@/lib/helper/notice-alert-helper';
import { objectToQueryString, primitiveToQueryString } from '@/lib/router-query-string';
import { i18n } from '@/translations';
import { store } from '@/store';
import { INVENTORY_ROUTE } from '@/services/inventory/routes';
import { QueryHelper } from '@spaceone/console-core-lib/query';
import { Location } from 'vue-router';
import { QueryStoreFilter } from '@spaceone/console-core-lib/query/type';
import { Period } from '@/services/billing/cost-management/type';
import { CostAnalyzeModel, UsdCost } from '@/services/billing/cost-management/widgets/type';
import { ExcelDataField } from '@/store/modules/file/type';


export default {
    name: 'CostAnalysisDataTable',
    components: {
        PToolboxTable,
        // PAnchor,
    },
    props: {},
    setup(props, { root }) {
        const state = reactive({
            timeUnit: computed(() => getTimeUnitByPeriod(state.granularity, dayjs.utc(state.period.start), dayjs.utc(state.period.end))),
            //
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
        });
        const tableState = reactive({
            loading: true,
            fields: [] as DataTableField[],
            excelFields: computed<ExcelDataField[]>(() => tableState.fields.map((d) => {
                const field: ExcelDataField = { key: d.name, name: d.label };
                if (d.name === GROUP_BY.PROJECT) field.reference = { reference_key: 'project_id', resource_type: 'identity.Project' };
                if (d.name === GROUP_BY.SERVICE_ACCOUNT) field.reference = { reference_key: 'service_account_id', resource_type: 'identity.ServiceAccount' };
                if (d.name === GROUP_BY.REGION) field.reference = { reference_key: 'region_code', resource_type: 'inventory.Region' };
                if (d.name === GROUP_BY.PROVIDER) field.reference = { reference_key: 'provider', resource_type: 'identity.Provider' };
                return field;
            })),
            items: [] as CostAnalyzeModel[],
            totalCount: 0,
        });

        /* util */
        const _getTableDateFields = (period: Period): DataTableField[] => {
            const dateFields: DataTableField[] = [];
            const start = dayjs(period.start);
            const end = dayjs(period.end);

            let nameDateFormat = 'YYYY-MM-DD';
            let labelDateFormat = 'M/D';
            if (state.timeUnit === 'month') {
                nameDateFormat = 'YYYY-MM';
                labelDateFormat = 'MMM YYYY';
            } else if (state.timeUnit === 'year') {
                nameDateFormat = 'YYYY';
                labelDateFormat = 'YYYY';
            }

            let now = start;
            while (now.isSameOrBefore(end, state.timeUnit)) {
                dateFields.push({
                    name: `usd_cost.${now.format(nameDateFormat)}`,
                    label: now.format(labelDateFormat),
                    textAlign: 'right',
                    sortable: true,
                });
                now = now.add(1, state.timeUnit);
            }
            return dateFields;
        };
        const _getTableFields = (granularity: GRANULARITY, groupByItems: GroupByItem[], period: Period) => {
            const groupByFields: DataTableField[] = groupByItems.map(d => ({
                name: d.name,
                label: d.label,
                sortable: false,
            }));

            if (granularity === GRANULARITY.ACCUMULATED) {
                const label = `${dayjs(period.start).format('M/D')}~${dayjs(period.end).format('M/D')}`;
                if (!groupByItems.length) {
                    groupByFields.push({
                        name: 'totalCost', label: ' ', sortable: false,
                    });
                }
                groupByFields.push({
                    name: 'usd_cost', label, textAlign: 'right', sortable: false,
                });
                return groupByFields;
            }

            if (!groupByItems.length) {
                groupByFields.push({
                    name: 'totalCost', label: ' ', textAlign: 'right', sortable: false,
                });
            }

            const dateFields = _getTableDateFields(period);
            return groupByFields.concat(dateFields);
        };
        const getLink = (item) => {
            const queryHelper = new QueryHelper();
            const query: Location['query'] = {};
            if (item.region_code) {
                query.region = item.region_code;
            } else if (state.filters.region_code?.length) {
                query.region = state.filters.region_code;
            }
            if (item.provider) {
                query.provider = primitiveToQueryString(item.provider);
            } else if (state.filters.provider?.length) {
                query.provider = state.filters.provider;
            }

            query.period = objectToQueryString(state.period);

            const filters: QueryStoreFilter[] = [];
            if (item.project_id) {
                filters.push({ k: 'project_id', v: item.project_id, o: '=' });
            } else if (state.filters.project_id?.length) {
                filters.push({ k: 'project_id', v: state.filters.project_id, o: '=' });
            }
            if (item.service_account_id) {
                filters.push({ k: 'collection_info.service_accounts', v: item.service_account_id, o: '=' });
            } else if (state.filters.service_account_id?.length) {
                filters.push({ k: 'collection_info.service_accounts', v: state.filters.service_account_id, o: '=' });
            }

            return {
                name: INVENTORY_ROUTE.CLOUD_SERVICE.TYPE._NAME,
                params: {},
                query: {
                    filters: queryHelper.setFilters(filters).rawQueryStrings,
                    ...query,
                },
            };
        };
        const _getStackedTableData = (rawData: CostAnalyzeModel[], granularity, period): CostAnalyzeModel[] => {
            let dateFormat = 'YYYY-MM-DD';
            if (granularity === GRANULARITY.MONTHLY) dateFormat = 'YYYY-MM';
            if (granularity === GRANULARITY.YEARLY) dateFormat = 'YYYY';
            const results: CostAnalyzeModel[] = [];
            rawData.forEach((d) => {
                const usdCost: UsdCost = {};
                let now = dayjs.utc(period.start).clone();
                let stackedData = 0;
                while (now.isSameOrBefore(dayjs.utc(period.end), state.timeUnit)) {
                    const currValue = d.usd_cost[now.format(dateFormat)] || 0;
                    stackedData += currValue;
                    usdCost[now.format(dateFormat)] = stackedData;
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

                const { results, total_count } = await SpaceConnector.client.costAnalysis.cost.analyze({
                    granularity,
                    group_by: groupBy,
                    start: dayjs.utc(period.start),
                    end: dayjs.utc(period.end).add(1, state.timeUnit),
                    pivot_type: 'TABLE',
                    ...costApiQueryHelper.data,
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
                showLoadingMessage(i18n.t('COMMON.EXCEL.ALT_L_READY_FOR_FILE_DOWNLOAD'), '', root);

                const _convertedFilters = getConvertedFilter(state.filters);
                costApiQueryHelper.setFilters(_convertedFilters);

                await store.dispatch('file/downloadExcel', {
                    url: '/cost-analysis/cost/analyze',
                    param: {
                        granularity: state.granularity,
                        group_by: state.groupBy,
                        start: dayjs.utc(state.period.start),
                        end: dayjs.utc(state.period.end).add(1, state.timeUnit),
                        pivot_type: 'TABLE',
                        query: costApiQueryHelper.data,
                    },
                    fields: tableState.excelFields,
                    file_name_prefix: FILE_NAME_PREFIX.costAnalysis,
                });
            } catch (e) {
                ErrorHandler.handleError(e);
            }
        };

        watch([() => state.granularity, () => state.groupBy, () => state.period, () => state.filters, () => state.stack], async ([granularity, groupBy, period, filters, stack]) => {
            await listCostAnalysisTableData(granularity, groupBy, period, filters, stack);
            tableState.fields = _getTableFields(granularity, state.groupByItems, period);
        }, { immediate: true, deep: true });

        return {
            ...toRefs(state),
            tableState,
            GROUP_BY,
            GROUP_BY_ITEM_MAP,
            handleChange,
            handleRefresh,
            handleExport,
            getLink,
            currencyMoneyFormatter,
        };
    },
};
</script>
