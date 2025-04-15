<script lang="ts" setup>
import {
    computed, reactive, watch,
} from 'vue';
import { useRoute, useRouter } from 'vue-router/composables';

import bytes from 'bytes';
import dayjs from 'dayjs';

import { getPageStart } from '@cloudforet/core-lib/component-util/pagination';
import { setApiQueryWithToolboxOptions } from '@cloudforet/core-lib/component-util/toolbox';
import { QueryHelper } from '@cloudforet/core-lib/query';
import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { getCancellableFetcher } from '@cloudforet/core-lib/space-connector/cancellable-fetcher';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import { PTextPagination, PToolboxTable } from '@cloudforet/mirinae';
import type { DataTableFieldType } from '@cloudforet/mirinae/types/data-display/tables/data-table/type';
import { byteFormatter, numberFormatter } from '@cloudforet/utils';

import type { AnalyzeResponse } from '@/api-clients/_common/schema/api-verbs/analyze';
import type { MetricDataAnalyzeParameters } from '@/api-clients/inventory/metric-data/schema/api-verbs/analyze';
import type { MetricLabelKey } from '@/schema/inventory/metric/type';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';

import { FILE_NAME_PREFIX } from '@/lib/excel-export/constant';
import { downloadExcel } from '@/lib/helper/file-download-helper';
import type { ExcelDataField } from '@/lib/helper/file-download-helper/type';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { getReferenceLabel } from '@/common/modules/widgets/_helpers/widget-date-helper';

import { GRANULARITY, SIZE_UNITS } from '@/services/asset-inventory/constants/asset-analysis-constant';
import {
    getAssetAnalysisDataTableDateFields,
    getRefinedAssetAnalysisTableData,
} from '@/services/asset-inventory/helpers/asset-analysis-data-table-helper';
import { ADMIN_ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/routes/admin/route-constant';
import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/routes/route-constant';
import { useMetricExplorerPageStore } from '@/services/asset-inventory/stores/metric-explorer-page-store';
import type { MetricDataAnalyzeResult } from '@/services/asset-inventory/types/asset-analysis-type';
import type {
    CloudServiceDetailPageUrlQuery,
    CloudServiceMainPageUrlQuery,
} from '@/services/asset-inventory/types/cloud-service-page-type';
import type { AllReferenceTypeInfo } from '@/services/dashboards/stores/all-reference-type-info-store';
import {
    useAllReferenceTypeInfoStore,
} from '@/services/dashboards/stores/all-reference-type-info-store';






const DATE_FORMAT_MAP = {
    [GRANULARITY.DAILY]: 'M/D',
    [GRANULARITY.MONTHLY]: 'MMM',
};

const router = useRouter();
const route = useRoute();
const appContextStore = useAppContextStore();
const userWorkspaceStore = useUserWorkspaceStore();
const metricExplorerPageStore = useMetricExplorerPageStore();
const metricExplorerPageState = metricExplorerPageStore.state;
const metricExplorerPageGetters = metricExplorerPageStore.getters;
const allReferenceTypeInfoStore = useAllReferenceTypeInfoStore();
const storeState = reactive({
    isAdminMode: computed(() => appContextStore.getters.isAdminMode),
    currentWorkspaceId: computed(() => userWorkspaceStore.getters.currentWorkspaceId),
    allReferenceTypeInfo: computed<AllReferenceTypeInfo>(() => allReferenceTypeInfoStore.getters.allReferenceTypeInfo),
});
const state = reactive({
    loading: false,
    currentMetricId: computed<string>(() => route.params.metricId),
    realtimeDate: undefined as string|undefined,
    groupByFields: computed<DataTableFieldType[]>(() => {
        const filteredLabelKeys = metricExplorerPageGetters.refinedMetricLabelKeys.filter((d) => metricExplorerPageState.selectedGroupByList.includes(d.key));
        return filteredLabelKeys.map((d) => ({
            name: d.key.replace('labels.', ''), label: d.name,
        }));
    }),
    dateFields: computed<DataTableFieldType[]>(() => getAssetAnalysisDataTableDateFields(
        metricExplorerPageState.granularity,
        metricExplorerPageState.period ?? {},
        !!metricExplorerPageState.selectedGroupByList.length,
        state.realtimeDate,
    )),
    fields: computed<DataTableFieldType[]>(() => [
        ...state.groupByFields,
        ...state.dateFields,
    ]),
    excelFields: computed<ExcelDataField[]>(() => {
        const fields: DataTableFieldType[] = [];
        if (metricExplorerPageState.selectedGroupByList.length) fields.push(...state.groupByFields);
        fields.push(...state.dateFields);
        return fields.map((d) => {
            const field: ExcelDataField = { key: d.name, name: (d.label) ?? '' };
            if (d.name === 'workspace_id') field.reference = { reference_key: 'workspace_id', resource_type: 'identity.Workspace' };
            if (d.name === 'project_id') field.reference = { reference_key: 'project_id', resource_type: 'identity.Project' };
            if (d.name === 'service_account_id') field.reference = { reference_key: 'service_account_id', resource_type: 'identity.ServiceAccount' };
            if (d.name === 'region_code') field.reference = { reference_key: 'region_code', resource_type: 'inventory.Region' };
            if (d.name === 'provider') field.reference = { reference_key: 'provider', resource_type: 'identity.Provider' };
            return field;
        });
    }),
    items: [] as any[],
    thisPage: 1,
    pageSize: 15,
    more: false,
    metricResourceType: computed<string|undefined>(() => metricExplorerPageState.metric?.resource_type),
    hasSearchKeyLabelKeys: computed<MetricLabelKey[]>(() => metricExplorerPageState.metric?.labels_info.filter((d) => !!d.search_key?.length) ?? []),
    metricAdditionalFilter: computed(() => (metricExplorerPageState.metric?.query_options?.filter ?? []).map((d) => ({ k: d.key ?? d.k, v: d.value ?? d.v, o: d.operator ?? d.o })) ?? []),
});

/* Util */
const getRefinedColumnValue = (field, value) => {
    if (field.name?.startsWith('count.') && field.name?.endsWith('.value')) {
        if (typeof value !== 'number') {
            const _dateFormat = DATE_FORMAT_MAP[metricExplorerPageState.granularity];
            if (dayjs.utc().format(_dateFormat) === field.label) return '--';
            return 0;
        }
        const _unit = metricExplorerPageState.metric?.unit;
        const _originalVal = bytes.parse(`${value}${_unit}`);
        if (_unit && SIZE_UNITS.includes(_unit)) {
            return byteFormatter(_originalVal);
        }
        return numberFormatter(value, { notation: 'compact' }) || 0;
    }
    const _label = metricExplorerPageGetters.labelKeysReferenceMap?.[field.name]?.[value]?.label || value;
    return getReferenceLabel(storeState.allReferenceTypeInfo, field.name, _label);
};

/* Api */
const analyzeApiQueryHelper = new ApiQueryHelper().setPage(1, 15);
const fetcher = getCancellableFetcher<MetricDataAnalyzeParameters, AnalyzeResponse<MetricDataAnalyzeResult>>(SpaceConnector.clientV2.inventory.metricData.analyze);
const analyzeMetricData = async (setPage = true): Promise<AnalyzeResponse<MetricDataAnalyzeResult>|undefined> => {
    try {
        analyzeApiQueryHelper
            .setFilters(metricExplorerPageGetters.consoleFilters)
            .setPage(getPageStart(state.thisPage, state.pageSize), state.pageSize);
        const _sort = metricExplorerPageGetters.isRealtimeChart ? [{ key: 'date', desc: true }] : [{ key: '_total_count', desc: true }];
        const _fieldGroup = metricExplorerPageGetters.isRealtimeChart ? [] : ['date'];
        const { status, response } = await fetcher({
            metric_id: state.currentMetricId,
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
                sort: _sort,
                field_group: _fieldGroup,
                ...(setPage ? analyzeApiQueryHelper.data : { filter: analyzeApiQueryHelper.apiQuery.filter }),
            },
        });
        if (status === 'succeed') {
            if (metricExplorerPageGetters.isRealtimeChart) {
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
    state.items = getRefinedAssetAnalysisTableData(res.results, metricExplorerPageState.granularity, metricExplorerPageState.period ?? {}, state.realtimeDate);
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
        const refinedData = getRefinedAssetAnalysisTableData(res.results, metricExplorerPageState.granularity, metricExplorerPageState.period ?? {}, state.realtimeDate);
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
    metricExplorerPageState.selectedGroupByList.forEach((d) => {
        const _targetLabelKey = state.hasSearchKeyLabelKeys.find((k) => k.key === d);
        if (_targetLabelKey) {
            const _fieldName = _targetLabelKey.key.replace('labels.', '');
            if (item[_fieldName]) {
                _filters.push({ k: _targetLabelKey.search_key, v: item[_fieldName], o: '=' });
            }
        }
    });

    // set filters from popper
    Object.entries(metricExplorerPageState.filters)
        .filter(([key]) => !metricExplorerPageState.selectedGroupByList.includes(key))
        .forEach(([key, value]) => {
            const _targetLabelKey = state.hasSearchKeyLabelKeys.find((k) => k.key === key);
            if (_targetLabelKey && value?.length) {
                _filters.push({ k: _targetLabelKey.search_key, v: value, o: '=' });
            }
        });

    let _routeName = storeState.isAdminMode ? ADMIN_ASSET_INVENTORY_ROUTE.CLOUD_SERVICE._NAME : ASSET_INVENTORY_ROUTE.CLOUD_SERVICE._NAME;
    let _params = {};
    const _query: CloudServiceMainPageUrlQuery|CloudServiceDetailPageUrlQuery = {
        filters: queryHelper.setFilters(_filters).rawQueryStrings,
    };

    if (state.metricResourceType.startsWith('inventory.CloudService:')) {
        const [provider, group, name] = state.metricResourceType.replace('inventory.CloudService:', '').split('.');
        _params = { provider, group, name };
        _routeName = storeState.isAdminMode ? ADMIN_ASSET_INVENTORY_ROUTE.CLOUD_SERVICE.DETAIL._NAME : ASSET_INVENTORY_ROUTE.CLOUD_SERVICE.DETAIL._NAME;

        if (state.metricAdditionalFilter.length) {
            (_query as CloudServiceDetailPageUrlQuery).default_filters = state.metricAdditionalFilter.map((d) => JSON.stringify(d));
        }
    }

    window.open(router.resolve({
        name: _routeName,
        params: { ..._params, workspaceId: storeState.isAdminMode ? undefined : storeState.currentWorkspaceId },
        query: _query,
    }).href, '_blank');
};

watch(
    [
        () => state.currentMetricId,
        () => metricExplorerPageState.metricInitiated,
        () => metricExplorerPageState.period,
        () => metricExplorerPageState.selectedOperator,
        () => metricExplorerPageState.selectedGroupByList,
        () => metricExplorerPageGetters.consoleFilters,
    ],
    async ([metricId, metricInitiated]) => {
        if (!metricId || !metricInitiated) return;
        state.thisPage = 1;
        await setDataTableData();
    },
    { immediate: true, deep: true },
);
watch(() => metricExplorerPageGetters.isRealtimeChart, async () => {
    await setDataTableData();
});
watch(() => metricExplorerPageState.refreshMetricData, async (refresh) => {
    if (refresh) {
        await setDataTableData();
        metricExplorerPageStore.setRefreshMetricData(false);
    }
}, { immediate: false });

const reduce = (arr: (number | undefined)[] | any) => arr.reduce((acc, value) => acc + (value ?? 0), 0);
</script>

<template>
    <p-toolbox-table :loading="state.loading"
                     :fields="state.fields"
                     :items="state.items"
                     :searchable="false"
                     :show-footer="true"
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

        <template #tf-col-format="{field, colIndex, values}">
            <span v-if="colIndex === 0">Total</span>
            <p v-else-if="!state.groupByFields.map((d) => d.name).includes(field.name) && values.length > 0">
                <span v-if="dayjs.utc().format(DATE_FORMAT_MAP[metricExplorerPageState.granularity]) === field.label">
                    {{ values.filter(e => typeof e === 'number').length === 0 ? '--' : numberFormatter(reduce(values), {notation: 'compact'}) }}
                </span>
                <span v-else>
                    {{ numberFormatter(reduce(values), {notation: 'compact'}) }}
                </span>
            </p>
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
