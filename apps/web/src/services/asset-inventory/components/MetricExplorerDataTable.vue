<script lang="ts" setup>
import { computed, reactive, watch } from 'vue';

import {
    PToolboxTable, PTextPagination,
} from '@spaceone/design-system';
import type { DataTableFieldType } from '@spaceone/design-system/types/data-display/tables/data-table/type';

import { getPageStart } from '@cloudforet/core-lib/component-util/pagination';
import { setApiQueryWithToolboxOptions } from '@cloudforet/core-lib/component-util/toolbox';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { getCancellableFetcher } from '@cloudforet/core-lib/space-connector/cancallable-fetcher';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import type { AnalyzeResponse } from '@/schema/_common/api-verbs/analyze';
import type { MetricDataAnalyzeParameters } from '@/schema/inventory/metric-data/api-verbs/analyze';

import { FILE_NAME_PREFIX } from '@/lib/excel-export/constant';
import { downloadExcel } from '@/lib/helper/file-download-helper';
import type { ExcelDataField } from '@/lib/helper/file-download-helper/type';

import ErrorHandler from '@/common/composables/error/errorHandler';

import {
    getMetricExplorerDataTableDateFields, getRefinedMetricExplorerTableData,
} from '@/services/asset-inventory/helpers/metric-explorer-data-table-helper';
import { useMetricExplorerPageStore } from '@/services/asset-inventory/stores/metric-explorer-page-store';
import type { MetricDataAnalyzeResult } from '@/services/asset-inventory/types/metric-explorer-type';


const metricExplorerPageStore = useMetricExplorerPageStore();
const metricExplorerPageState = metricExplorerPageStore.state;
const metricExplorerPageGetters = metricExplorerPageStore.getters;
const state = reactive({
    loading: false,
    groupByFields: computed<DataTableFieldType[]>(() => {
        const filteredLabelKeys = metricExplorerPageGetters.refinedMetricLabelKeys.filter((d) => metricExplorerPageState.selectedGroupByList.includes(d.key));
        return filteredLabelKeys.map((d) => ({
            name: d.key, label: d.name,
        }));
    }),
    dateFields: computed<DataTableFieldType[]>(() => getMetricExplorerDataTableDateFields(
        metricExplorerPageState.granularity,
        metricExplorerPageState.period ?? {},
        !!metricExplorerPageState.selectedGroupByList.length,
    )),
    fields: computed<DataTableFieldType[]>(() => [
        ...state.groupByFields,
        ...state.dateFields,
    ]),
    excelFields: computed<ExcelDataField[]>(() => {
        const fields: DataTableFieldType[] = [];
        if (metricExplorerPageGetters.selectedGroupByItems.length) fields.push(...state.groupByFields);
        fields.push(...state.dateFields);
        return fields.map((d) => {
            const field: ExcelDataField = { key: d.name, name: (d.label) ?? '' };
            return field;
        });
    }),
    items: [] as any[],
    thisPage: 1,
    pageSize: 15,
    more: false,
});

/* Api */
const analyzeApiQueryHelper = new ApiQueryHelper().setPage(1, 15);
const fetcher = getCancellableFetcher<MetricDataAnalyzeParameters, AnalyzeResponse<MetricDataAnalyzeResult>>(SpaceConnector.clientV2.inventory.metricData.analyze);
const analyzeMetricData = async (setPage = true): Promise<AnalyzeResponse<MetricDataAnalyzeResult>|undefined> => {
    try {
        analyzeApiQueryHelper
            .setFilters(metricExplorerPageGetters.consoleFilters)
            .setPage(getPageStart(state.thisPage, state.pageSize), state.pageSize);
        const { status, response } = await fetcher({
            metric_id: metricExplorerPageGetters.metricId as string,
            query: {
                granularity: metricExplorerPageState.granularity,
                group_by: metricExplorerPageState.selectedGroupByList,
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
                ...(setPage ? analyzeApiQueryHelper.data : { filter: analyzeApiQueryHelper.apiQuery.filter }),
            },
        });
        if (status === 'succeed') return response;
        return undefined;
    } catch (e) {
        return { more: false, results: [] };
    }
};
const setDataTableData = async () => {
    state.loading = true;
    const res = await analyzeMetricData();
    if (!res) return;
    state.items = getRefinedMetricExplorerTableData(res.results, metricExplorerPageState.granularity, metricExplorerPageState.period ?? {});
    state.more = res.more;
    state.loading = false;
};

/* Event */
const handleChange = async (options: any = {}) => {
    setApiQueryWithToolboxOptions(analyzeApiQueryHelper, options, { queryTags: true });
    await setDataTableData();
};
const handleUpdateThisPage = async () => {
    await setDataTableData();
};
const handleExport = async () => {
    try {
        const res = await analyzeMetricData(false);
        if (!res) return;
        const refinedData = getRefinedMetricExplorerTableData(res.results, metricExplorerPageState.granularity, metricExplorerPageState.period ?? {});
        await downloadExcel({
            data: refinedData,
            fields: state.excelFields,
            file_name_prefix: FILE_NAME_PREFIX.metricExplorer,
        });
    } catch (e) {
        ErrorHandler.handleError(e);
    }
};

watch(
    [
        () => metricExplorerPageGetters.metricId,
        () => metricExplorerPageState.period,
        () => metricExplorerPageState.selectedOperator,
        () => metricExplorerPageState.selectedChartGroupBy,
        () => metricExplorerPageGetters.consoleFilters,
    ],
    async ([metricId]) => {
        if (!metricId) return;
        state.thisPage = 1;
        await setDataTableData();
    },
    { immediate: true, deep: true },
);
watch(() => metricExplorerPageState.refreshMetricData, async (refresh) => {
    if (refresh) {
        await setDataTableData();
        metricExplorerPageStore.setRefreshMetricData(false);
    }
}, { immediate: false });
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
                     @export="handleExport"
    >
        <template #pagination-area>
            <p-text-pagination :this-page.sync="state.thisPage"
                               :disable-next-page="state.loading"
                               :has-next-page="state.more"
                               @update:thisPage="handleUpdateThisPage"
            />
        </template>
        <template #col-format="{field, value}">
            <span v-if="state.loading" />
            <span v-else-if="field.name === 'totalCount'">
                {{ $t('INVENTORY.METRIC_EXPLORER.TOTAL_COUNT') }}
            </span>
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
