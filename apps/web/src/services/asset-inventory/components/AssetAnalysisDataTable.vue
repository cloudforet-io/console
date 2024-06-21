<script lang="ts" setup>
import { computed, reactive, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router/composables';

import { PTextPagination, PToolboxTable } from '@spaceone/design-system';
import type { DataTableFieldType } from '@spaceone/design-system/types/data-display/tables/data-table/type';
import bytes from 'bytes';
import dayjs from 'dayjs';

import { getPageStart } from '@cloudforet/core-lib/component-util/pagination';
import { setApiQueryWithToolboxOptions } from '@cloudforet/core-lib/component-util/toolbox';
import { QueryHelper } from '@cloudforet/core-lib/query';
import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { getCancellableFetcher } from '@cloudforet/core-lib/space-connector/cancallable-fetcher';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import { byteFormatter, numberFormatter } from '@cloudforet/utils';

import type { AnalyzeResponse } from '@/schema/_common/api-verbs/analyze';
import type { MetricDataAnalyzeParameters } from '@/schema/inventory/metric-data/api-verbs/analyze';
import type { MetricLabelKey } from '@/schema/inventory/metric/type';

import { FILE_NAME_PREFIX } from '@/lib/excel-export/constant';
import { downloadExcel } from '@/lib/helper/file-download-helper';
import type { ExcelDataField } from '@/lib/helper/file-download-helper/type';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useProperRouteLocation } from '@/common/composables/proper-route-location';

import { GRANULARITY } from '@/services/asset-inventory/constants/asset-analysis-constant';
import {
    getAssetAnalysisDataTableDateFields,
    getRefinedAssetAnalysisTableData,
} from '@/services/asset-inventory/helpers/asset-analysis-data-table-helper';
import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/routes/route-constant';
import { useAssetAnalysisPageStore } from '@/services/asset-inventory/stores/asset-analysis-page-store';
import type { MetricDataAnalyzeResult } from '@/services/asset-inventory/types/asset-analysis-type';


const UNITS = ['bytes', 'Bytes', 'b', 'gb', 'kb', 'mb', 'pb', 'tb', 'B', 'GB', 'KB', 'MB', 'PB', 'TB'];
const DATE_FORMAT_MAP = {
    [GRANULARITY.DAILY]: 'M/D',
    [GRANULARITY.MONTHLY]: 'MMM',
};

const router = useRouter();
const route = useRoute();
const { getProperRouteLocation } = useProperRouteLocation();
const assetAnalysisPageStore = useAssetAnalysisPageStore();
const assetAnalysisPageState = assetAnalysisPageStore.state;
const assetAnalysisPageGetters = assetAnalysisPageStore.getters;
const state = reactive({
    loading: false,
    currentMetricId: computed<string>(() => route.params.metricId),
    realtimeDate: undefined as string|undefined,
    groupByFields: computed<DataTableFieldType[]>(() => {
        const filteredLabelKeys = assetAnalysisPageGetters.refinedMetricLabelKeys.filter((d) => assetAnalysisPageState.selectedGroupByList.includes(d.key));
        return filteredLabelKeys.map((d) => ({
            name: d.key.replace('labels.', ''), label: d.name,
        }));
    }),
    dateFields: computed<DataTableFieldType[]>(() => getAssetAnalysisDataTableDateFields(
        assetAnalysisPageState.granularity,
        assetAnalysisPageState.period ?? {},
        !!assetAnalysisPageState.selectedGroupByList.length,
        state.realtimeDate,
    )),
    fields: computed<DataTableFieldType[]>(() => [
        ...state.groupByFields,
        ...state.dateFields,
    ]),
    excelFields: computed<ExcelDataField[]>(() => {
        const fields: DataTableFieldType[] = [];
        if (assetAnalysisPageState.selectedGroupByList.length) fields.push(...state.groupByFields);
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
    metricResourceType: computed<string|undefined>(() => assetAnalysisPageState.metric?.resource_type),
    hasSearchKeyLabelKeys: computed<MetricLabelKey[]>(() => assetAnalysisPageState.metric?.labels_info.filter((d) => !!d.search_key?.length) ?? []),
    metricAdditionalFilter: computed(() => (assetAnalysisPageState.metric?.query_options?.filter ?? []).map((d) => ({ k: d.key ?? d.k, v: d.value ?? d.v, o: d.operator ?? d.o })) ?? []),
});

/* Util */
const getRefinedColumnValue = (field, value) => {
    if (field.name?.startsWith('count.') && field.name?.endsWith('.value')) {
        if (typeof value !== 'number') {
            const _dateFormat = DATE_FORMAT_MAP[assetAnalysisPageState.granularity];
            if (dayjs.utc().format(_dateFormat) === field.label) return '--';
            return 0;
        }
        const _unit = assetAnalysisPageState.metric?.unit;
        const _originalVal = bytes.parse(`${value}${_unit}`);
        if (_unit && UNITS.includes(_unit)) {
            return byteFormatter(_originalVal);
        }
        return numberFormatter(value, { notation: 'compact' }) || 0;
    }
    return assetAnalysisPageGetters.labelKeysReferenceMap?.[field.name]?.[value]?.label || value;
};

/* Api */
const analyzeApiQueryHelper = new ApiQueryHelper().setPage(1, 15);
const fetcher = getCancellableFetcher<MetricDataAnalyzeParameters, AnalyzeResponse<MetricDataAnalyzeResult>>(SpaceConnector.clientV2.inventory.metricData.analyze);
const analyzeMetricData = async (setPage = true): Promise<AnalyzeResponse<MetricDataAnalyzeResult>|undefined> => {
    try {
        analyzeApiQueryHelper
            .setFilters(assetAnalysisPageGetters.consoleFilters)
            .setPage(getPageStart(state.thisPage, state.pageSize), state.pageSize);
        const _sort = assetAnalysisPageGetters.isRealtimeChart ? [{ key: 'date', desc: true }] : [{ key: '_total_count', desc: true }];
        const _fieldGroup = assetAnalysisPageGetters.isRealtimeChart ? [] : ['date'];
        const { status, response } = await fetcher({
            metric_id: state.currentMetricId,
            query: {
                granularity: assetAnalysisPageState.granularity,
                group_by: assetAnalysisPageState.selectedGroupByList,
                start: assetAnalysisPageState.period?.start,
                end: assetAnalysisPageState.period?.end,
                fields: {
                    count: {
                        key: 'value',
                        operator: assetAnalysisPageState.selectedOperator,
                    },
                },
                sort: _sort,
                field_group: _fieldGroup,
                ...(setPage ? analyzeApiQueryHelper.data : { filter: analyzeApiQueryHelper.apiQuery.filter }),
            },
        });
        if (status === 'succeed') {
            if (assetAnalysisPageGetters.isRealtimeChart) {
                state.realtimeDate = response.results?.[0]?.date;
            } else {
                state.realtimeDate = undefined;
            }
            return response;
        }
        return undefined;
    } catch (e) {
        return { more: false, results: [] };
    }
};
const setDataTableData = async () => {
    state.loading = true;
    const res = await analyzeMetricData();
    if (!res) return;
    state.items = getRefinedAssetAnalysisTableData(res.results, assetAnalysisPageState.granularity, assetAnalysisPageState.period ?? {}, state.realtimeDate);
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
        const refinedData = getRefinedAssetAnalysisTableData(res.results, assetAnalysisPageState.granularity, assetAnalysisPageState.period ?? {}, state.realtimeDate);
        await downloadExcel({
            data: refinedData,
            fields: state.excelFields,
            file_name_prefix: FILE_NAME_PREFIX.metricExplorer,
        });
    } catch (e) {
        ErrorHandler.handleError(e);
    }
};
const queryHelper = new QueryHelper();
const handleClickRow = (item) => {
    const _filters: ConsoleFilter[] = [];

    // set filters from groupBy
    assetAnalysisPageState.selectedGroupByList.forEach((d) => {
        const _targetLabelKey = state.hasSearchKeyLabelKeys.find((k) => k.key === d);
        if (_targetLabelKey) {
            const _fieldName = _targetLabelKey.key.replace('labels.', '');
            if (item[_fieldName]) {
                _filters.push({ k: _targetLabelKey.search_key, v: item[_fieldName], o: '=' });
            }
        }
    });

    // set filters from popper
    Object.entries(assetAnalysisPageState.filters)
        .filter(([key]) => !assetAnalysisPageState.selectedGroupByList.includes(key))
        .forEach(([key, value]) => {
            const _targetLabelKey = state.hasSearchKeyLabelKeys.find((k) => k.key === key);
            if (_targetLabelKey && value?.length) {
                _filters.push({ k: _targetLabelKey.search_key, v: value, o: '=' });
            }
        });

    let _routeName = ASSET_INVENTORY_ROUTE.CLOUD_SERVICE._NAME;
    let _params = {};
    let apiQuery: {
        filters: string[],
        default_filters?: string[],
    } = {
        filters: queryHelper.setFilters(_filters).rawQueryStrings,
    };

    if (state.metricResourceType.startsWith('inventory.CloudService:')) {
        const [provider, group, name] = state.metricResourceType.replace('inventory.CloudService:', '').split('.');
        _params = { provider, group, name };
        _routeName = ASSET_INVENTORY_ROUTE.CLOUD_SERVICE.DETAIL._NAME;

        if (state.metricAdditionalFilter.length) {
            apiQuery = {
                ...apiQuery,
                default_filters: state.metricAdditionalFilter.map((d) => JSON.stringify(d)),
            };
        }
    }

    window.open(router.resolve(getProperRouteLocation({
        name: _routeName,
        params: _params,
        query: apiQuery,
    })).href, '_blank');
};

watch(
    [
        () => state.currentMetricId,
        () => assetAnalysisPageState.metricInitiated,
        () => assetAnalysisPageState.period,
        () => assetAnalysisPageState.selectedOperator,
        () => assetAnalysisPageState.selectedGroupByList,
        () => assetAnalysisPageGetters.consoleFilters,
    ],
    async ([metricId, metricInitiated]) => {
        if (!metricId || !metricInitiated) return;
        state.thisPage = 1;
        await setDataTableData();
    },
    { immediate: true, deep: true },
);
watch(() => assetAnalysisPageGetters.isRealtimeChart, async () => {
    await setDataTableData();
});
watch(() => assetAnalysisPageState.refreshMetricData, async (refresh) => {
    if (refresh) {
        await setDataTableData();
        assetAnalysisPageStore.setRefreshMetricData(false);
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
                     row-cursor-pointer
                     exportable
                     @change="handleChange"
                     @refresh="handleChange()"
                     @export="handleExport"
                     @rowLeftClick="handleClickRow"
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
                {{ getRefinedColumnValue(field, value) }}
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
