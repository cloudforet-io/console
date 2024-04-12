<script lang="ts" setup>
import { computed, reactive, watch } from 'vue';

import {
    PToolboxTable, PTextPagination,
} from '@spaceone/design-system';
import type { DataTableFieldType } from '@spaceone/design-system/types/data-display/tables/data-table/type';

import { setApiQueryWithToolboxOptions } from '@cloudforet/core-lib/component-util/toolbox';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { getCancellableFetcher } from '@cloudforet/core-lib/space-connector/cancallable-fetcher';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import type { AnalyzeResponse } from '@/schema/_common/api-verbs/analyze';
import type { MetricDataAnalyzeParameters } from '@/schema/inventory/metric-data/api-verbs/analyze';

import {
    getMetricExplorerDataTableDateFields, getRefinedMetricDataAnalyzeQueryGroupBy,
    getRefinedMetricExplorerTableData,
} from '@/services/asset-inventory/helpers/metric-explorer-data-table-helper';
import { useMetricExplorerPageStore } from '@/services/asset-inventory/stores/metric-explorer-page-store';
import type { MetricDataAnalyzeResult } from '@/services/asset-inventory/types/metric-explorer-type';


const metricExplorerPageStore = useMetricExplorerPageStore();
const metricExplorerPageState = metricExplorerPageStore.state;
const metricExplorerPageGetters = metricExplorerPageStore.getters;
const state = reactive({
    loading: false,
    groupByFields: computed<DataTableFieldType[]>(() => metricExplorerPageGetters.groupByItems.filter((d) => metricExplorerPageState.selectedGroupByList.includes(d.name))),
    dateFields: computed<DataTableFieldType[]>(() => getMetricExplorerDataTableDateFields(
        metricExplorerPageState.granularity,
        metricExplorerPageState.period ?? {},
        !!metricExplorerPageState.selectedGroupByList.length,
    )),
    fields: computed<DataTableFieldType[]>(() => [
        ...state.groupByFields,
        ...state.dateFields,
    ]),
    items: [] as any[],
    thisPage: 1,
    pageSize: 15,
    more: false,
});

/* Api */
const analyzeApiQueryHelper = new ApiQueryHelper().setPage(1, 15);
const fetcher = getCancellableFetcher<MetricDataAnalyzeParameters, AnalyzeResponse<MetricDataAnalyzeResult>>(SpaceConnector.clientV2.inventory.metricData.analyze);
const analyzeMetricData = async (): Promise<AnalyzeResponse<MetricDataAnalyzeResult>> => {
    try {
        analyzeApiQueryHelper.setFilters(metricExplorerPageGetters.consoleFilters);
        const { status, response } = await fetcher({
            metric_id: metricExplorerPageState.metricId as string,
            query: {
                granularity: metricExplorerPageState.granularity,
                group_by: getRefinedMetricDataAnalyzeQueryGroupBy(metricExplorerPageState.selectedGroupByList),
                start: metricExplorerPageState.period?.start,
                end: metricExplorerPageState.period?.end,
                fields: {
                    count: {
                        key: 'value',
                        operator: metricExplorerPageState.selectedOperator,
                    },
                },
                sort: [{ key: '_total_count', desc: true }],
                field_group: ['date'],
                ...analyzeApiQueryHelper.data,
            },
        });
        if (status === 'succeed') return response;
        return { more: false, results: [] };
    } catch (e) {
        state.loading = false;
        return { more: false, results: [] };
    }
};

/* Event */
const handleChange = async (options: any = {}) => {
    setApiQueryWithToolboxOptions(analyzeApiQueryHelper, options, { queryTags: true });
    const { results, more } = await analyzeMetricData();
    state.items = getRefinedMetricExplorerTableData(results, metricExplorerPageState.granularity, metricExplorerPageState.period ?? {});
    state.more = more ?? false;
};
const handleUpdateThisPage = async () => {
    const { results, more } = await analyzeMetricData();
    state.items = getRefinedMetricExplorerTableData(results, metricExplorerPageState.granularity, metricExplorerPageState.period ?? {});
    state.more = more ?? false;
};

watch(
    [
        () => metricExplorerPageState.metricId,
        () => metricExplorerPageState.period,
        () => metricExplorerPageState.selectedOperator,
        () => metricExplorerPageState.selectedChartGroupBy,
    ],
    async ([metricId]) => {
        if (!metricId) return;
        state.thisPage = 1;
        const { results, more } = await analyzeMetricData();
        state.items = getRefinedMetricExplorerTableData(results, metricExplorerPageState.granularity, metricExplorerPageState.period);
        state.more = more ?? false;
    },
    { immediate: true, deep: true },
);
</script>

<template>
    <p-toolbox-table :loading="state.loading"
                     :fields="state.fields"
                     :items="state.items"
                     :searchable="false"
                     :page-size.sync="state.pageSize"
                     row-height-fixed
                     exportable
                     @change="handleChange"
                     @refresh="handleChange()"
    >
        <template #pagination-area>
            <p-text-pagination :this-page.sync="state.thisPage"
                               :disable-next-page="state.loading"
                               :has-next-page="state.more"
                               @update:thisPage="handleUpdateThisPage"
            />
        </template>
        <template #col-format="{value}">
            <span v-if="state.loading" />
            <span v-else>
                {{ value }}
            </span>
        </template>
    </p-toolbox-table>
</template>

<style lang="postcss" scoped>
.cell-text {
    &.raised {
        @apply text-alert;
    }
}
</style>
