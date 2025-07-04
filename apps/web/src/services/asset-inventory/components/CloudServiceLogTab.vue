<template>
    <p-data-loader :loading="isDataSourceListLoading"
                   :data="state.dataSourceList"
                   :class="{ 'data-loader': isDataSourceListLoading }"
                   class="cloud-service-history-log-tab"
    >
        <p-heading class="pt-8 px-4 pb-4"
                   heading-type="sub"
                   :title="$t('INVENTORY.CLOUD_SERVICE.HISTORY.DETAIL.LOG')"
                   use-total-count
                   :total-count="logListData?.total_count ?? 0"
        />
        <p-button-tab v-if="state.tabs.length > 0"
                      :tabs="state.tabs"
                      :active-tab="state.activeTab"
                      keep-alive-all
                      @change="handleChangeTab"
        >
            <template v-for="(layout, i) in state.layouts"
                      #[layout.name]
            >
                <div :key="`${layout.name}-${i}`"
                     class="log-dynamic-layout"
                >
                    <p-dynamic-layout :type="layout.type"
                                      :options="layout.options"
                                      :data="state.data.slice(state.pageStart - 1, state.pageStart + state.pageLimit - 1)"
                                      :type-options="{
                                          totalCount: state.totalCount,
                                          sortable: false,
                                          loading: isLogListLoading,
                                      }"
                                      :fetch-options="{
                                          pageLimit: state.pageLimit,
                                          pageStart: state.pageStart,
                                          searchText: state.searchText,
                                      }"
                                      v-on="dynamicLayoutListeners"
                    >
                        <template #toolbox-top>
                            <div class="filter">
                                <span class="filter-label">{{ $t('INVENTORY.CLOUD_SERVICE.HISTORY.DETAIL.LOG_TAB.TIME_WITHIN') }}</span>
                                <p-select-status
                                    v-for="(item, index) in state.timeWithinList"
                                    :key="`${item.name}-${index}`"
                                    v-model="state.selectedTimeWithin"
                                    :value="item.name"
                                >
                                    {{ item.label }}
                                </p-select-status>
                            </div>
                        </template>
                    </p-dynamic-layout>
                </div>
            </template>
        </p-button-tab>
        <template #no-data>
            <div class="empty-tab">
                <div class="container">
                    <img class="image"
                         src="@/assets/images/illust_microscope.svg"
                    >
                    <p class="desc">
                        {{ $t('INVENTORY.CLOUD_SERVICE.HISTORY.DETAIL.LOG_TAB.NO_LOG_HELP_TEXT') }}
                    </p>
                </div>
            </div>
        </template>
    </p-data-loader>
</template>
<script lang="ts" setup>
import {
    reactive, computed, watch,
} from 'vue';
import type { TranslateResult } from 'vue-i18n';

import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';

import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import {
    PButtonTab, PDynamicLayout, PHeading, PSelectStatus, PDataLoader,
} from '@cloudforet/mirinae';
import type { DynamicLayoutEventListener } from '@cloudforet/mirinae/types/data-display/dynamic/dynamic-layout/type';
import type { DynamicLayout } from '@cloudforet/mirinae/types/data-display/dynamic/dynamic-layout/type/layout-schema';
import type { TabItem } from '@cloudforet/mirinae/types/navigation/tabs/tab/type';

import { useMonitoringDataSourceApi } from '@/api-clients/monitoring/data-source/composables/use-monitoring-data-source-api';
import type { DataSourceListParameters } from '@/api-clients/monitoring/data-source/schema/api-verbs/list';
import type { DataSourceModel } from '@/api-clients/monitoring/data-source/schema/model';
import { useLogApi } from '@/api-clients/monitoring/log/composables/use-log-api';
import type { MonitoringLogListParameters } from '@/api-clients/monitoring/log/schema/api-verbs/list';
import type { LogModel } from '@/api-clients/monitoring/log/schema/model';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { useScopedQuery } from '@/query/service-query/use-scoped-query';
import { i18n } from '@/translations';

import { useUserStore } from '@/store/user/user-store';

import { dynamicFieldsToExcelDataFields } from '@/lib/excel-export';
import { FILE_NAME_PREFIX } from '@/lib/excel-export/constant';
import { downloadExcel } from '@/lib/helper/file-download-helper';


interface Props {
    provider: string;
    cloudServiceId: string;
    date?: string;
}
type PeriodType = 'last1day' | 'last3days' | 'last1week' | 'last2weeks' | 'last1month' | 'last3months' | 'last1year';
interface PeriodItem {
    name: PeriodType;
    label: TranslateResult;
    start: Dayjs;
    end: Dayjs;
}

const HISTORY_LOG_PERIOD_LIST: PeriodType[] = ['last1day', 'last3days', 'last1week'];
const CLOUD_SERVICE_LOG_PERIOD_LIST: PeriodType[] = ['last1week', 'last2weeks', 'last1month', 'last3months', 'last1year'];


const props = defineProps<Props>();
const userStore = useUserStore();
const state = reactive({
    timezone: computed<string>(() => userStore.state.timezone ?? 'UTC'),
    schemaLoading: true,
    loading: true,
    searchText: '',
    pageStart: 1,
    pageLimit: 15,
    activeTab: '',
    // time within filter
    timeWithinList: computed<PeriodItem[]>(() => {
        const _date = props.date ? dayjs.utc(props.date) : dayjs.utc();
        const timeWithinList: PeriodItem[] = [
            {
                name: 'last1day',
                label: i18n.t('INVENTORY.CLOUD_SERVICE.HISTORY.DETAIL.LOG_TAB.LAST_1_DAY'),
                start: _date.subtract(1, 'day'),
                end: _date,
            },
            {
                name: 'last3days',
                label: i18n.t('INVENTORY.CLOUD_SERVICE.HISTORY.DETAIL.LOG_TAB.LAST_3_DAYS'),
                start: _date.subtract(3, 'day'),
                end: _date,
            },
            {
                name: 'last1week',
                label: i18n.t('INVENTORY.CLOUD_SERVICE.HISTORY.DETAIL.LOG_TAB.LAST_A_WEEK'),
                start: _date.subtract(1, 'week'),
                end: _date,
            },
            {
                name: 'last2weeks',
                label: i18n.t('INVENTORY.CLOUD_SERVICE.HISTORY.DETAIL.LOG_TAB.LAST_2_WEEKS'),
                start: _date.subtract(2, 'week'),
                end: _date,
            },
            {
                name: 'last1month',
                label: i18n.t('INVENTORY.CLOUD_SERVICE.HISTORY.DETAIL.LOG_TAB.LAST_1_MONTH'),
                start: _date.subtract(1, 'month'),
                end: _date,
            },
            {
                name: 'last3months',
                label: i18n.t('INVENTORY.CLOUD_SERVICE.HISTORY.DETAIL.LOG_TAB.LAST_3_MONTHS'),
                start: _date.subtract(3, 'month'),
                end: _date,
            },
            {
                name: 'last1year',
                label: i18n.t('INVENTORY.CLOUD_SERVICE.HISTORY.DETAIL.LOG_TAB.LAST_1_YEAR'),
                start: _date.subtract(1, 'year'),
                end: _date,
            },
        ];
        if (props.date) return timeWithinList.filter((d) => HISTORY_LOG_PERIOD_LIST.includes(d.name));
        return timeWithinList.filter((d) => CLOUD_SERVICE_LOG_PERIOD_LIST.includes(d.name));
    }),
    selectedTimeWithin: props.date ? HISTORY_LOG_PERIOD_LIST[0] : CLOUD_SERVICE_LOG_PERIOD_LIST[0],
    selectedPeriod: computed<PeriodItem|undefined>(() => state.timeWithinList.find((d) => d.name === state.selectedTimeWithin)),
    // log data
    data: computed<LogModel[]>(() => logListData.value?.results ?? []),
    totalCount: computed(() => state.data.length),
    // dataSources and computed data by dataSources(schema, tabs)
    dataSourceList: computed<DataSourceModel[]>(() => dataSourceListData.value?.results ?? []),
    layouts: computed<DynamicLayout[]>(() => state.dataSourceList.map((dataSource) => {
        const layout = dataSource.plugin_info?.metadata?.view?.table?.layout ?? {};
        return {
            ...layout,
            name: dataSource.data_source_id,
        };
    })),
    currentLayout: computed(() => state.layouts.find((layout) => layout.name === state.activeTab)),
    tabs: computed<TabItem[]>(() => state.dataSourceList.map((dataSource) => ({
        name: dataSource.data_source_id,
        label: dataSource.name,
    }))),
});


const handleChangeTab = (tab: string) => {
    state.activeTab = tab;
};

const { logAPI } = useLogApi();
const { key: logKey, params: logQueryParams } = useServiceQueryKey('monitoring', 'log', 'list', {
    params: computed<MonitoringLogListParameters>(() => ({
        data_source_id: state.activeTab,
        resource_id: props.cloudServiceId,
        keyword: state.searchText,
        start: state.selectedPeriod?.start.toISOString(),
        end: state.selectedPeriod?.end.toISOString(),
    })),
});

const { data: logListData, isFetching: isLogListLoading } = useScopedQuery({
    queryKey: logKey,
    queryFn: () => logAPI.list(logQueryParams.value),
    enabled: computed(() => !!props.cloudServiceId && !!state.activeTab && !!logQueryParams.value),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 5,
}, ['DOMAIN', 'WORKSPACE']);

const schemaApiQueryHelper = new ApiQueryHelper();

const { dataSourceAPI } = useMonitoringDataSourceApi();
const { key: dataSourceKey, params: dataSourceQueryParams } = useServiceQueryKey('monitoring', 'data-source', 'list', {
    params: computed<DataSourceListParameters>(() => ({
        monitoring_type: 'LOG',
        query: schemaApiQueryHelper.setFilters([
            { k: 'plugin_info.metadata.supported_providers', v: [props.provider, 'all'], o: '=' }, // filtering by provider labels.
        ]).data,
    })),
});

const { data: dataSourceListData, isFetching: isDataSourceListLoading } = useScopedQuery({
    queryKey: dataSourceKey,
    queryFn: () => dataSourceAPI.list(dataSourceQueryParams.value),
    enabled: computed(() => !!props.provider && !!dataSourceQueryParams.value),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 5,
}, ['DOMAIN', 'WORKSPACE']);



// handler
const dynamicLayoutListeners: Partial<DynamicLayoutEventListener> = {
    fetch(options) {
        if (!state.activeTab || !props.cloudServiceId) return;
        if (options?.pageStart) state.pageStart = options.pageStart;
        if (options?.pageLimit) state.pageLimit = options.pageLimit;
        if (options?.searchText !== undefined && state.searchText !== options?.searchText) {
            state.searchText = options?.searchText ?? '';
        }
    },
    async export() {
        const fields = state.currentLayout?.options?.fields;
        if (!fields) return;
        await downloadExcel({
            url: '/monitoring/log/list',
            param: {
                data_source_id: state.activeTab,
                resource_id: props.cloudServiceId,
                start: state.selectedPeriod?.start.toISOString(),
                end: state.selectedPeriod?.end.toISOString(),
                keyword: state.searchText,
                query: {},
            },
            fields: dynamicFieldsToExcelDataFields(fields),
            file_name_prefix: FILE_NAME_PREFIX.cloudServiceLog,
            timezone: state.timezone,
        });
    },
};

// watcher
watch(() => state.dataSourceList, (_dataSourceList) => {
    if (!_dataSourceList) return;
    state.activeTab = state.tabs[0]?.name ?? '';
}, { immediate: true });

</script>

<style lang="postcss" scoped>
.cloud-service-history-log-tab {
    height: 100%;
    padding-bottom: 0.5rem;
    max-width: calc(100vw - 3rem);
}
.data-loader {
    min-height: 26.125rem;
}

/* custom design-system component - p-dynamic-layout */
:deep(.log-dynamic-layout) {
    .p-toolbox {
        padding-top: 0;
    }
    .table-container {
        max-height: 45vh;
    }
}
.filter {
    @apply flex items-center items-end flex-wrap gap-4;
    margin: 0.75rem 1rem 1rem 1rem;
    .filter-label {
        @apply text-gray-400;
        font-size: 0.875rem;
        line-height: 1.15;
    }
}
.empty-tab {
    @apply flex justify-center items-center;
    height: 26.125rem;

    .container {
        @apply flex flex-col items-center justify-center flex-wrap gap-8;
        .desc {
            @apply text-gray-400;
            line-height: 1.25rem;
            font-size: 1rem;
        }
    }
}

</style>
