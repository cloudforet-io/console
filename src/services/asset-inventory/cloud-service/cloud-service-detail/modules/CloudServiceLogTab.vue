<template>
    <p-data-loader :loading="schemaLoading"
                   :data="dataSourceList"
                   :class="{ 'data-loader': schemaLoading }"
                   class="cloud-service-history-log-tab"
    >
        <p-heading heading-type="sub"
                   :title="$t('INVENTORY.CLOUD_SERVICE.HISTORY.DETAIL.LOG')"
                   use-total-count
                   :total-count="totalCount"
        />
        <p-button-tab v-if="tabs.length > 0"
                      :tabs="tabs"
                      :active-tab="activeTab"
                      keep-alive-all
                      @change="handleChangeTab"
        >
            <template v-for="(layout, i) in layouts"
                      #[layout.name]
            >
                <div :key="`${layout.name}-${i}`"
                     class="log-dynamic-layout"
                >
                    <p-dynamic-layout :type="layout.type"
                                      :options="layout.options"
                                      :data="data.slice(pageStart - 1, pageStart + pageLimit - 1)"
                                      :type-options="{
                                          totalCount,
                                          sortable: false,
                                          loading,
                                      }"
                                      :fetch-options="{
                                          pageLimit,
                                          pageStart,
                                          searchText,
                                      }"
                                      v-on="dynamicLayoutListeners"
                    >
                        <template #toolbox-top>
                            <div class="filter">
                                <span class="filter-label">{{ $t('INVENTORY.CLOUD_SERVICE.HISTORY.DETAIL.LOG_TAB.TIME_WITHIN') }}</span>
                                <p-select-status
                                    v-for="(item, index) in timeWithinList"
                                    :key="`${item.name}-${index}`"
                                    v-model="selectedTimeWithin"
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
<script lang="ts">
import {
    reactive, toRefs, computed, defineComponent, watch,
} from 'vue';
import type { TranslateResult } from 'vue-i18n';

import {
    PButtonTab, PDynamicLayout, PHeading, PSelectStatus, PDataLoader,
} from '@spaceone/design-system';
import type { DynamicLayoutEventListener } from '@spaceone/design-system/types/data-display/dynamic/dynamic-layout/type';
import type { DynamicLayout } from '@spaceone/design-system/types/data-display/dynamic/dynamic-layout/type/layout-schema';
import type { TabItem } from '@spaceone/design-system/types/navigation/tabs/tab/type';
import type { CancelTokenSource } from 'axios';
import axios from 'axios';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import { debounce, isEmpty } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import { store } from '@/store';
import { i18n } from '@/translations';

import { dynamicFieldsToExcelDataFields } from '@/lib/component-util/dynamic-layout';
import { FILE_NAME_PREFIX } from '@/lib/excel-export';

import ErrorHandler from '@/common/composables/error/errorHandler';

interface Props {
    provider: string;
    cloudServiceId: string;
    date: string;
}
type PeriodType = 'last1day' | 'last3days' | 'last1week' | 'last2weeks' | 'last1month' | 'last3months';
interface PeriodItem {
    name: PeriodType;
    label: TranslateResult;
    start: Dayjs;
    end: Dayjs;
}

const HISTORY_LOG_PERIOD_LIST: PeriodType[] = ['last1day', 'last3days', 'last1week'];
const CLOUD_SERVICE_LOG_PERIOD_LIST: PeriodType[] = ['last1week', 'last2weeks', 'last1month', 'last3months'];

interface DataSourceInfo {
    data_source_id: string;
    monitoring_type: string;
    name: string;
    provider: string;
    state: string;
    tags: { [key: string]: string };
    plugin_info?: {
        plugin_id: string;
        provider: string;
        metadata: {
            required_keys: string[];
            supported_providers: string[];
            view: {
                table: {
                    layout: DynamicLayout;
                }
            }
        }
    }
}

export default defineComponent<Props>({
    name: 'CloudServiceLogTab',
    components: {
        PDynamicLayout: PDynamicLayout as any,
        PButtonTab,
        PHeading,
        PSelectStatus,
        PDataLoader,
    },
    props: {
        provider: {
            type: String,
            default: undefined,
        },
        cloudServiceId: {
            type: String,
            default: '',
        },
        date: {
            type: String,
            default: undefined,
        },
    },
    setup(props) {
        const state = reactive({
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
                ];
                if (props.date) return timeWithinList.filter((d) => HISTORY_LOG_PERIOD_LIST.includes(d.name));
                return timeWithinList.filter((d) => CLOUD_SERVICE_LOG_PERIOD_LIST.includes(d.name));
            }),
            selectedTimeWithin: props.date ? HISTORY_LOG_PERIOD_LIST[0] : CLOUD_SERVICE_LOG_PERIOD_LIST[0],
            selectedPeriod: computed<PeriodItem|undefined>(() => state.timeWithinList.find((d) => d.name === state.selectedTimeWithin)),
            // log data
            data: [] as any[],
            totalCount: computed(() => state.data.length),
            // dataSources and computed data by dataSources(schema, tabs)
            dataSourceList: [] as DataSourceInfo[],
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
        let getLogDataToken: CancelTokenSource | undefined;
        const getLogData = debounce(async (dataSourceId: string, resourceId: string) => {
            try {
                if (getLogDataToken) {
                    getLogDataToken.cancel('Next request has been called.');
                    getLogDataToken = undefined;
                }
                getLogDataToken = axios.CancelToken.source();

                state.loading = true;
                const { results } = await SpaceConnector.client.monitoring.log.list({
                    data_source_id: dataSourceId,
                    resource_id: resourceId,
                    keyword: state.searchText,
                    start: state.selectedPeriod?.start.toISOString(),
                    end: state.selectedPeriod?.end.toISOString(),
                }, {
                    cancelToken: getLogDataToken.token,
                });
                getLogDataToken = undefined;
                state.data = results;
                state.loading = false;
            } catch (e: any) {
                if (!axios.isCancel(e.axiosError)) {
                    ErrorHandler.handleError(e);
                    state.data = [];
                    state.loading = false;
                }
            }
        }, 300);
        const schemaApiQueryHelper = new ApiQueryHelper();
        const fetchDataSources = async (provider: string): Promise<DataSourceInfo[]> => {
            try {
                const { results } = await SpaceConnector.client.monitoring.dataSource.list({
                    monitoring_type: 'LOG',
                    query: schemaApiQueryHelper.setFilters([
                        { k: 'plugin_info.metadata.supported_providers', v: [provider, 'all'], o: '=' }, // filtering by provider labels.
                    ]).data,
                });
                return results ?? [];
            } catch (e) {
                ErrorHandler.handleError(e);
                return [];
            }
        };
        const dataSourcesCacheMap = new Map<string, DataSourceInfo[]>(); // provider: DataSourceInfo[]
        const getSchema = async (provider: string) => {
            try {
                state.schemaLoading = true;
                // check cache map and set data source list to cache map
                if (!dataSourcesCacheMap.has(provider)) {
                    const dataSourceList = await fetchDataSources(provider);
                    dataSourcesCacheMap.set(provider, dataSourceList);
                }
                state.dataSourceList = dataSourcesCacheMap.get(provider) ?? [];
            } catch (e) {
                ErrorHandler.handleError(e);
                state.dataSourceList = [];
            } finally {
                state.schemaLoading = false;
            }
        };

        // handler
        const dynamicLayoutListeners: Partial<DynamicLayoutEventListener> = {
            fetch(options) {
                if (!state.activeTab || !props.cloudServiceId) return;
                if (isEmpty(options)) { // refresh case
                    getLogData(state.activeTab, props.cloudServiceId);
                    return;
                }
                if (options?.pageStart) state.pageStart = options.pageStart;
                if (options?.pageLimit) state.pageLimit = options.pageLimit;
                if (options?.searchText !== undefined && state.searchText !== options?.searchText) {
                    state.searchText = options?.searchText ?? '';
                    getLogData(state.activeTab, props.cloudServiceId);
                }
            },
            async export() {
                const fields = state.currentLayout?.options?.fields;
                if (!fields) return;
                await store.dispatch('file/downloadExcel', {
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
                });
            },
        };

        // watcher
        watch(() => props.provider, async (provider) => {
            if (!provider) return;
            await getSchema(provider);
            state.activeTab = state.tabs[0]?.name ?? '';
        }, { immediate: true });
        watch([() => state.selectedPeriod, () => props.cloudServiceId, () => state.activeTab], (
            [, cloudServiceId, activeTab],
        ) => {
            if (cloudServiceId && activeTab) getLogData(activeTab, cloudServiceId);
        });
        return {
            ...toRefs(state),
            handleChangeTab,
            dynamicLayoutListeners,
        };
    },
});
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
