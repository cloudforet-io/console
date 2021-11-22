<template>
    <p-toolbox-table :loading="tableState.loading"
                     :fields="tableState.fields"
                     :items="tableState.items"
                     :total-count="tableState.totalCount"
                     :sort-desc="true"
                     sort-by="total_count"
                     searchable
                     exportable
                     sortable
                     @change="handleChange"
                     @refresh="handleChange()"
    >
        <template v-for="field in tableState.fields" v-slot:[`col-${field.name}-format`]="{value, index}">
            <div :key="`${field.name}-${index}-${value}`">
                <span v-if="field.name === GROUP_BY_ITEM.PROJECT">
                    {{ projects[value] ? projects[value].label : value }}
                </span>
                <span v-else-if="field.name === GROUP_BY_ITEM.PROVIDER">
                    {{ providers[value] ? providers[value].label : value }}
                </span>
                <span v-else-if="field.name === GROUP_BY_ITEM.REGION">
                    {{ regions[value] ? regions[value].name : value }}
                </span>
                <span v-else>
                    {{ value ? value : '--' }}
                </span>
            </div>
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
import { commaFormatter, numberFormatter } from '@spaceone/console-core-lib';
import { setApiQueryWithToolboxOptions } from '@spaceone/console-core-lib/component-util/toolbox';

import { GroupByItem } from '@/services/billing/cost-management/cost-analysis/store/type';
import {
    getConvertedFilter, getConvertedGranularity, getTimeUnit,
} from '@/services/billing/cost-management/cost-analysis/lib/helper';
import { GRANULARITY, GROUP_BY_ITEM } from '@/services/billing/cost-management/cost-analysis/lib/config';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { store } from '@/store';


interface CostAnalysisItem {
    [key: string]: string | number | object;
}

interface TableData {
    [key: string]: any;
}

interface Value {
    usd_cost: number;
    date: string;
}

interface RawTableData {
    [key: string]: any;
    values: Value[];
}

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
            currency: computed(() => store.state.service.costAnalysis.currency),
            period: computed(() => store.state.service.costAnalysis.period),
            groupByItems: computed(() => store.state.service.costAnalysis.groupByItems),
            filters: computed(() => store.state.service.costAnalysis.filters),
        });
        const tableState = reactive({
            loading: true,
            fields: [] as DataTableField[],
            items: [] as CostAnalysisItem[],
            totalCount: 0,
        });

        /* util */
        const setTableFields = (granularity: GRANULARITY, groupByItems: GroupByItem[]) => {
            /* get group by fields (ex. Provider, Region) */
            const groupByFields: DataTableField[] = [...groupByItems];
            if (!groupByItems.length) {
                groupByFields.push({
                    name: 'total_cost', label: ' ', sortable: false,
                });
            }

            /* get date fields (ex. 11/1, 11/2) */
            const dateFields: DataTableField[] = [];
            const start = dayjs(state.period.start);
            const end = dayjs(state.period.end);
            const timeUnit = getTimeUnit(granularity, start, end);

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
                });
                now = now.add(1, timeUnit);
            }

            tableState.fields = groupByFields.concat(dateFields);
        };
        const getTableDataFromRawData = (rawData: RawTableData[], groupByItems: GroupByItem[]): TableData[] => {
            const tableData: TableData[] = [];
            rawData.forEach((eachRawData) => {
                const rowData: TableData = {};

                /* extract group by data (ex. { provider: 'aws', region_code: 'us-west-1' }) */
                if (groupByItems.length) {
                    groupByItems.forEach((item) => {
                        rowData[item.name] = eachRawData[item.name];
                    });
                } else {
                    rowData.total_cost = 'Total Cost';
                }

                /* extract data per each date (ex. { 2021-11-01: '29.4K', 2021-11-02: '8,962' } ) */
                eachRawData.values.forEach((value) => {
                    rowData[value.date] = commaFormatter(numberFormatter(value.usd_cost));
                });
                tableData.push(rowData);
            });
            return tableData;
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
                const { results, total_count } = await SpaceConnector.client.costAnalysis.cost.analyze({
                    granularity,
                    group_by: state.groupByItems.map(d => d.name),
                    start: state.period.start,
                    end: state.period.end,
                    pivot_type: 'TABLE',
                    ...costApiQueryHelper.data,
                });
                tableState.items = getTableDataFromRawData(results, state.groupByItems);
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
            // await getTableData();
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
            GROUP_BY_ITEM,
            handleChange,
            handleRefresh,
        };
    },
};
</script>
