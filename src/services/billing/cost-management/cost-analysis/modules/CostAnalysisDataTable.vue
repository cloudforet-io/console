<template>
    <p-toolbox-table :loading="tableState.loading"
                     :fields="tableState.fields"
                     :items="tableState.items"
                     :total-count="tableState.totalCount"
                     :sort-desc="true"
                     sort-by="total_count"
                     :searchable="false"
                     exportable
                     sortable
                     @change="handleChange"
                     @refresh="handleChange()"
    >
        <template #col-format="{field, value, index}">
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
                {{ currencyMoneyFormatter(value, currency, currencyRates, true) }}
            </span>
        </template>
    </p-toolbox-table>
</template>

<script lang="ts">
import dayjs from 'dayjs';

import {
    computed, reactive, toRefs, watch,
} from '@vue/composition-api';

import { PToolboxTable } from '@spaceone/design-system';
import { DataTableField } from '@spaceone/design-system/dist/src/data-display/tables/data-table/type';

import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { ApiQueryHelper } from '@spaceone/console-core-lib/space-connector/helper';
import { setApiQueryWithToolboxOptions } from '@spaceone/console-core-lib/component-util/toolbox';

import { GRANULARITY, GROUP_BY } from '@/services/billing/cost-management/lib/config';
import { GroupByItem } from '@/services/billing/cost-management/cost-analysis/store/type';
import {
    getConvertedFilter, getConvertedGranularity, getTimeUnitByPeriod,
} from '@/services/billing/cost-management/cost-analysis/lib/helper';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { currencyMoneyFormatter } from '@/lib/helper/currency-helper';
import { getTableDataFromRawData } from '@/services/billing/cost-management/widgets/lib/widget-data-helper';
import { TableData } from '@/services/billing/cost-management/widgets/type';
import { store } from '@/store';


export default {
    name: 'CostAnalysisDataTable',
    components: {
        PToolboxTable,
    },
    props: {},
    setup() {
        const state = reactive({
            projects: computed(() => store.state.resource.project.items),
            providers: computed(() => store.state.resource.provider.items),
            regions: computed(() => store.state.resource.region.items),
            //
            granularity: computed(() => store.state.service.costAnalysis.granularity),
            period: computed(() => store.state.service.costAnalysis.period),
            groupByItems: computed(() => store.state.service.costAnalysis.groupByItems),
            filters: computed(() => store.state.service.costAnalysis.filters),
            //
            currency: computed(() => store.state.display.currency),
            currencyRates: computed(() => store.state.display.currencyRates),
        });
        const tableState = reactive({
            loading: true,
            fields: [] as DataTableField[],
            items: [] as TableData[],
            totalCount: 0,
        });

        /* util */
        const setTableFields = (granularity: GRANULARITY, groupByItems: GroupByItem[]) => {
            /* get group by fields (ex. Provider, Region) */
            const groupByFields: DataTableField[] = [...groupByItems];
            if (!groupByItems.length) {
                groupByFields.push({
                    name: 'totalCost', label: ' ', sortable: false, textAlign: 'center',
                });
            }

            /* get date fields (ex. 11/1, 11/2) */
            const dateFields: DataTableField[] = [];
            const start = dayjs(state.period.start);
            const end = dayjs(state.period.end);
            const timeUnit = getTimeUnitByPeriod(granularity, start, end);

            let nameDateFormat = 'YYYY-MM-DD';
            let labelDateFormat = 'M/D';
            if (timeUnit === 'month') {
                nameDateFormat = 'YYYY-MM';
                labelDateFormat = 'MMM YYYY';
            } else if (timeUnit === 'year') {
                nameDateFormat = 'YYYY';
                labelDateFormat = 'YYYY';
            }

            let now = start;
            while (now.isSameOrBefore(end, timeUnit)) {
                dateFields.push({
                    name: now.format(nameDateFormat),
                    label: now.format(labelDateFormat),
                    sortable: false,
                    textAlign: 'center',
                });
                now = now.add(1, timeUnit);
            }

            tableState.fields = groupByFields.concat(dateFields);
        };


        /* api */
        const costApiQueryHelper = new ApiQueryHelper()
            .setPageStart(1).setPageLimit(15)
            .setSort('total_count', true);
        const listCostAnalysisTableData = async () => {
            try {
                const granularity = getConvertedGranularity(state.period, state.granularity);
                const convertedFilters = getConvertedFilter(state.filters);
                costApiQueryHelper.setFilters(convertedFilters);

                const groupBy = state.groupByItems.map(d => d.name);
                const { results, total_count } = await SpaceConnector.client.costAnalysis.cost.analyze({
                    granularity,
                    group_by: groupBy,
                    start: state.period.start,
                    end: state.period.end,
                    pivot_type: 'TABLE',
                    ...costApiQueryHelper.data,
                });
                tableState.items = getTableDataFromRawData(results, groupBy);
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
            await listCostAnalysisTableData();
        };
        const handleRefresh = async () => {
            await listCostAnalysisTableData();
        };

        watch([() => state.granularity, () => state.groupByItems, () => state.period, () => state.filters], async () => {
            tableState.loading = true;
            await Promise.all([
                listCostAnalysisTableData(),
                setTableFields(state.granularity, state.groupByItems),
            ]);
            tableState.loading = false;
        }, { immediate: true, deep: true });

        return {
            ...toRefs(state),
            tableState,
            GROUP_BY,
            handleChange,
            handleRefresh,
            currencyMoneyFormatter,
        };
    },
};
</script>
