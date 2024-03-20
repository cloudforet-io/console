<script lang="ts" setup>
import { computed, reactive } from 'vue';

import {
    PToolboxTable, PTextPagination, PSelectDropdown,
} from '@spaceone/design-system';
import type { DataTableFieldType } from '@spaceone/design-system/types/data-display/tables/data-table/type';

import { setApiQueryWithToolboxOptions } from '@cloudforet/core-lib/component-util/toolbox';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import {
    getMetricExplorerDataTableDateFields,
    getRefinedMetricExplorerTableData,
} from '@/services/asset-inventory/helpers/metric-explorer-data-table-helper';
import { useMetricExplorerPageStore } from '@/services/asset-inventory/stores/metric-explorer-page-store';


const metricExplorerPageStore = useMetricExplorerPageStore();
const metricExplorerPageState = metricExplorerPageStore.state;
const state = reactive({
    loading: false,
    groupByFields: computed<DataTableFieldType[]>(() => metricExplorerPageState.selectedGroupByList.map((d) => ({
        name: d,
        label: d,
    }))),
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
const analyzeMetricData = async () => ({ more: false, results: [] });

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

// TODO: watch granularity, period and analyze data
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
        <template #toolbox-left>
            <p-select-dropdown :menu="[]"
                               selection-label="Order by"
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
