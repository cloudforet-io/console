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
        <template #col-format="{field, value, index, item}">
            <span v-if="field.name === GROUP_BY.PROJECT">
                {{ projects[value] ? projects[value].label : value }}
            </span>
            <span v-else-if="field.name === GROUP_BY.PROVIDER">
                {{ providers[value] ? providers[value].name : value }}
            </span>
            <span v-else-if="field.name === GROUP_BY.REGION">
                {{ regions[value] ? regions[value].name : value }}
            </span>
            <span v-else-if="typeof value !== 'string'" class="text-center">
                <p-anchor :to="value ? getLink(item) : undefined" target="_self"
                          :show-icon="false"
                >
                    {{ currencyMoneyFormatter(value, currency, currencyRates) }}
                </p-anchor>
            </span>
        </template>
    </p-toolbox-table>
</template>

<script lang="ts">
import dayjs from 'dayjs';

import {
    computed, reactive, toRefs, watch,
} from '@vue/composition-api';

import { PToolboxTable, PAnchor } from '@spaceone/design-system';
import { DataTableField } from '@spaceone/design-system/dist/src/data-display/tables/data-table/type';

import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { ApiQueryHelper } from '@spaceone/console-core-lib/space-connector/helper';
import { setApiQueryWithToolboxOptions } from '@spaceone/console-core-lib/component-util/toolbox';

import { GRANULARITY, GROUP_BY } from '@/services/billing/cost-management/lib/config';
import {
    getConvertedFilter,
    getConvertedGranularity,
    getTimeUnitByPeriod,
} from '@/services/billing/cost-management/cost-analysis/lib/helper';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { currencyMoneyFormatter } from '@/lib/helper/currency-helper';
import { getTableDataFromRawData } from '@/services/billing/cost-management/widgets/lib/widget-data-helper';
import { TableData } from '@/services/billing/cost-management/widgets/type';
import { GroupByItem } from '@/services/billing/cost-management/cost-analysis/store/type';
import { FILE_NAME_PREFIX } from '@/lib/excel-export';
import { showLoadingMessage } from '@/lib/helper/notice-alert-helper';
import { i18n } from '@/translations';
import { store } from '@/store';
import { INVENTORY_ROUTE } from '@/services/inventory/routes';
import { QueryHelper } from '@spaceone/console-core-lib/query';
import { Location } from 'vue-router';
import { QueryStoreFilter } from '@spaceone/console-core-lib/query/type';


export default {
    name: 'CostAnalysisDataTable',
    components: {
        PToolboxTable,
        PAnchor,
    },
    props: {},
    setup(props, { root }) {
        const state = reactive({
            timeUnit: computed(() => getTimeUnitByPeriod(state.granularity, dayjs(state.period.start), dayjs(state.period.end))),
            //
            projects: computed(() => store.state.resource.project.items),
            providers: computed(() => store.state.resource.provider.items),
            regions: computed(() => store.state.resource.region.items),
            //
            granularity: computed(() => store.state.service.costAnalysis.granularity),
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
            excelFields: computed(() => tableState.fields.map(d => ({ key: d.name, name: d.label }))),
            items: [] as TableData[],
            totalCount: 0,
        });

        /* util */
        const setTableFields = (granularity: GRANULARITY, groupByItems: GroupByItem[]) => {
            /* get group by fields (ex. Provider, Region) */
            const groupByFields: DataTableField[] = [...groupByItems];
            if (!groupByItems.length) {
                groupByFields.push({
                    name: 'totalCost', label: ' ', textAlign: 'center',
                });
            }

            /* get date fields (ex. 11/1, 11/2) */
            const dateFields: DataTableField[] = [];
            const start = dayjs(state.period.start);
            const end = dayjs(state.period.end);

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
                    name: now.format(nameDateFormat),
                    label: now.format(labelDateFormat),
                    textAlign: 'center',
                });
                now = now.add(1, state.timeUnit);
            }

            tableState.fields = groupByFields.concat(dateFields);
        };
        const getLink = (item) => {
            const queryHelper = new QueryHelper();
            const query: Location['query'] = {};
            if (item.region_code) {
                query.region = item.region_code;
            } else if (state.filters.region_code?.length) {
                query.region = state.filters.region_code[0]; // todo 일단 첫 번째 것만
            }
            if (item.provider) {
                query.provider = item.provider;
            }

            const filters: QueryStoreFilter[] = [];
            if (item.project_id) {
                filters.push({ k: 'project_id', v: item.project_id, o: '=' });
            } else if (state.filters.project_id?.length) {
                filters.push({ k: 'project_id', v: state.filters.project_id, o: '=' });
            }
            // if (item.product) {
            //     filters.push({ k: 'cloud_service_type', v: item.product, o: '=' });
            // } else if (state.filters.product?.length) {
            //     filters.push({ k: 'cloud_service_type', v: state.filters.product, o: '=' });
            // }
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

        /* api */
        const costApiQueryHelper = new ApiQueryHelper()
            .setPageStart(1).setPageLimit(15)
            .setSort('total_count', true);
        const listCostAnalysisTableData = async (granularity, groupBy, period, filters) => {
            try {
                const _granularity = getConvertedGranularity(period, granularity);
                const _convertedFilters = getConvertedFilter(filters);
                costApiQueryHelper.setFilters(_convertedFilters);

                const { results, total_count } = await SpaceConnector.client.costAnalysis.cost.analyze({
                    granularity: _granularity,
                    group_by: groupBy,
                    start: dayjs.utc(period.start),
                    end: dayjs.utc(period.end).add(1, state.timeUnit),
                    pivot_type: 'TABLE',
                    ...costApiQueryHelper.data,
                });
                tableState.items = getTableDataFromRawData(results, state.groupBy);
                tableState.totalCount = total_count;
            } catch (e) {
                tableState.items = [];
                tableState.totalCount = 0;
                ErrorHandler.handleError(e);
            }
        };

        /* event */
        const handleChange = async (options: any = {}) => {
            setApiQueryWithToolboxOptions(costApiQueryHelper, options, { queryTags: true });
            await listCostAnalysisTableData(state.granularity, state.groupBy, state.period, state.filters);
        };
        const handleRefresh = async () => {
            await listCostAnalysisTableData(state.granularity, state.groupBy, state.period, state.filters);
        };
        const handleExport = async () => {
            try {
                showLoadingMessage(i18n.t('COMMON.EXCEL.ALT_L_READY_FOR_FILE_DOWNLOAD'), '', root);

                const granularity = getConvertedGranularity(state.period, state.granularity);
                const convertedFilters = getConvertedFilter(state.filters);
                costApiQueryHelper.setFilters(convertedFilters);

                await store.dispatch('file/downloadExcel', {
                    url: '/cost-analysis/cost/analyze',
                    param: {
                        granularity,
                        group_by: state.groupBy,
                        start: dayjs.utc(state.period.start),
                        end: dayjs.utc(state.period.end).add(1, state.timeUnit),
                        pivot_type: 'EXCEL',
                        query: costApiQueryHelper.data,
                    },
                    fields: tableState.excelFields,
                    file_name_prefix: FILE_NAME_PREFIX.costAnalysis,
                });
            } catch (e) {
                ErrorHandler.handleError(e);
            }
        };

        watch([() => state.granularity, () => state.groupBy, () => state.period, () => state.filters], async ([granularity, groupBy, period, filters]) => {
            tableState.loading = true;
            await Promise.all([
                listCostAnalysisTableData(granularity, groupBy, period, filters),
                setTableFields(granularity, state.groupByItems),
            ]);
            tableState.loading = false;
        }, { immediate: true, deep: true });

        return {
            ...toRefs(state),
            tableState,
            GROUP_BY,
            handleChange,
            handleRefresh,
            handleExport,
            getLink,
            currencyMoneyFormatter,
        };
    },
};
</script>
