<template>
    <p-data-loader :loading="loading"
                   :class="{ 'data-loader': loading }"
                   class="cloud-service-history-log-tab"
    >
        <div v-if="tabs.length">
            <p-panel-top :title="$t('INVENTORY.CLOUD_SERVICE.HISTORY.DETAIL.LOG')"
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
        </div>
        <div v-else
             class="empty-tab"
        >
            <div class="container">
                <img class="image"
                     src="@/assets/images/illust_microscope.svg"
                >
                <p class="desc">
                    {{ $t('INVENTORY.CLOUD_SERVICE.HISTORY.DETAIL.LOG_TAB.NO_LOG_HELP_TEXT') }}
                </p>
            </div>
        </div>
    </p-data-loader>
</template>
<script lang="ts">
import {
    reactive, toRefs, computed, defineComponent, watch,
} from 'vue';
import type { TranslateResult } from 'vue-i18n';

import {
    PButtonTab, PDynamicLayout, PPanelTop, PSelectStatus, PDataLoader,
} from '@spaceone/design-system';
import type { DynamicLayoutEventListener } from '@spaceone/design-system/types/data-display/dynamic/dynamic-layout/type';
import type { DynamicLayout } from '@spaceone/design-system/types/data-display/dynamic/dynamic-layout/type/layout-schema';
import type { TabItem } from '@spaceone/design-system/types/navigation/tabs/tab/type';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import { isEmpty } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

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

export default defineComponent<Props>({
    name: 'CloudServiceLogTab',
    components: {
        PDynamicLayout: PDynamicLayout as any,
        PButtonTab,
        PPanelTop,
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
            loading: true,
            searchText: '',
            totalCount: 0,
            pageStart: 1,
            pageLimit: 15,
            tabs: [] as TabItem[],
            activeTab: '',
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
            layouts: [] as DynamicLayout[],
            currentLayout: computed(() => state.layouts.find((layout) => layout.name === state.activeTab)),
            dataSourceIds: {} as { [key: string]: string },
            totalLayoutCount: 0,
            data: [],
        });
        const handleChangeTab = (tab) => {
            state.activeTab = tab;
        };
        const getLogData = async () => {
            try {
                state.loading = true;
                const selectedTimeWithin = state.timeWithinList.find((timeWith) => timeWith.name === state.selectedTimeWithin);
                const { results } = await SpaceConnector.client.monitoring.log.list({
                    data_source_id: state.dataSourceIds[state.activeTab],
                    resource_id: props.cloudServiceId,
                    keyword: state.searchText,
                    start: selectedTimeWithin?.start.toISOString(),
                    end: selectedTimeWithin?.end.toISOString(),
                });
                state.totalCount = results.length;
                state.data = results;
            } catch (e) {
                ErrorHandler.handleError(e);
                state.data = [];
            } finally {
                state.loading = false;
            }
        };
        const getSchema = async () => {
            try {
                const { results, total_count } = await SpaceConnector.client.monitoring.dataSource.list({
                    monitoring_type: 'LOG',
                    provider: props.provider,
                });
                state.totalLayoutCount = total_count;
                if (!total_count) return;
                const layouts:DynamicLayout[] = [];
                const dataSourceIds = {};
                state.tabs = (results ?? []).map((dataSource) => {
                    const layout = dataSource.plugin_info?.metadata?.view?.table?.layout;
                    layouts.push(layout);
                    dataSourceIds[layout?.name] = dataSource.data_source_id;
                    return { name: layout?.name, label: dataSource.name };
                });
                state.activeTab = state.tabs[0]?.name;
                state.layouts = layouts;
                state.dataSourceIds = dataSourceIds;
            } catch (e) {
                ErrorHandler.handleError(e);
                state.layouts = [];
                state.dataSourceIds = {};
                state.totalLayoutCount = 0;
            }
        };

        // handler
        const dynamicLayoutListeners: Partial<DynamicLayoutEventListener> = {
            fetch(options) {
                if (isEmpty(options)) { // refresh case
                    getLogData();
                    return;
                }
                if (options?.pageStart) state.pageStart = options.pageStart;
                if (options?.pageLimit) state.pageLimit = options.pageLimit;
                if (options?.searchText !== undefined && state.searchText !== options?.searchText) {
                    state.searchText = options?.searchText ?? '';
                    getLogData();
                }
            },
            async export() {
                const fields = state.currentLayout?.options?.fields;
                if (!fields) return;
                const selectedTimeWithin = state.timeWithinList.find((timeWith) => timeWith.name === state.selectedTimeWithin);
                await store.dispatch('file/downloadExcel', {
                    url: '/monitoring/log/list',
                    param: {
                        data_source_id: state.dataSourceIds[state.activeTab],
                        resource_id: props.cloudServiceId,
                        start: selectedTimeWithin?.start.toISOString(),
                        end: selectedTimeWithin?.end.toISOString(),
                        keyword: state.searchText,
                        query: {},
                    },
                    fields: dynamicFieldsToExcelDataFields(fields),
                    file_name_prefix: FILE_NAME_PREFIX.cloudServiceLog,
                });
            },
        };
        // init
        (async () => {
            await getSchema();
            if (state.totalLayoutCount) await getLogData();
            state.loading = false;
        })();

        // watcher
        watch([() => state.selectedTimeWithin, () => props.date, () => props.cloudServiceId], () => {
            if (state.totalLayoutCount) getLogData();
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
