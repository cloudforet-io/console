<template>
    <div>
        <p-panel-top :title="title" use-total-count :total-count="totalCount" />
        <p-button-tab v-if="tabs.length > 0"
                      :tabs="tabs"
                      :active-tab="activeTab"
                      keep-alive-all
                      @change="handleChangeTab"
        >
            <template v-for="(layout, i) in layouts" #[layout.name]>
                <div :key="`${layout.name}-${i}`" class="log-dynamic-layout">
                    <p-dynamic-layout :type="layout.type"
                                      :options="layout.options"
                                      :data="data"
                                      :type-options="{
                                          loading,
                                          searchText,
                                          totalCount,
                                      }"
                                      :fetch-options="{
                                          pageLimit,
                                      }"
                                      v-on="dynamicLayoutListeners"
                    >
                        <template #toolbox-top>
                            <div class="filter">
                                <!--song-lang-->
                                <span class="filter-label">{{ $t('Time Within') }}</span>
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
</template>
<script lang="ts">
import {
    reactive, toRefs, computed, defineComponent, watch,
} from '@vue/composition-api';

import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import {
    PButtonTab, PDynamicLayout, PPanelTop, PSelectStatus,
} from '@spaceone/design-system';
import { DynamicLayoutEventListener } from '@spaceone/design-system/dist/src/data-display/dynamic/dynamic-layout/type';
import { DynamicLayout } from '@spaceone/design-system/dist/src/data-display/dynamic/dynamic-layout/type/layout-schema';
import { TabItem } from '@spaceone/design-system/dist/src/navigation/tabs/tab/type';
import dayjs, { Dayjs } from 'dayjs';
import { TranslateResult } from 'vue-i18n';


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
interface PeriodItem {
    name: string;
    label: TranslateResult;
    start: Dayjs;
    end: Dayjs;
}

export default defineComponent<Props>({
    name: 'CloudServiceHistoryLogTab',
    components: {
        PDynamicLayout: PDynamicLayout as any,
        PButtonTab,
        PPanelTop,
        PSelectStatus,
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
            default: '',
        },
    },
    setup(props) {
        const state = reactive({
            loading: true,
            searchText: '',
            title: computed(() => i18n.t('Log')),
            totalCount: 0,
            pageStart: 1,
            pageLimit: 15,
            tabs: [] as TabItem[],
            activeTab: '',
            timeWithinList: computed<PeriodItem[]>(() => ([
                // song-lang
                {
                    name: 'last6hrs',
                    label: i18n.t('LAST_6_HRS'),
                    start: dayjs.utc(props.date).subtract(6, 'hour'),
                    end: dayjs.utc(props.date),
                },
                {
                    name: 'last12hrs',
                    label: i18n.t('LAST_12_HRS'),
                    start: dayjs.utc(props.date).subtract(12, 'hour'),
                    end: dayjs.utc(props.date),
                },
                {
                    name: 'last1day',
                    label: i18n.t('LAST_1_DAY'),
                    start: dayjs.utc(props.date).subtract(1, 'day'),
                    end: dayjs.utc(props.date),
                },
                {
                    name: 'last2day',
                    label: i18n.t('LAST_2_DAYS'),
                    start: dayjs.utc(props.date).subtract(2, 'day'),
                    end: dayjs.utc(props.date),
                },
            ])),
            selectedTimeWithin: 'last6hrs',
            layouts: [] as DynamicLayout[],
            currentLayout: computed(() => state.layouts.find(layout => layout.name === state.activeTab)),
            dataSourceIds: {} as { [key: string]: string },
            data: [],
        });
        const handleChangeTab = (tab) => {
            state.activeTab = tab;
        };
        const getLogData = async () => {
            try {
                state.loading = true;
                const selectedTimeWithin = state.timeWithinList.find(timeWith => timeWith.name === state.selectedTimeWithin);
                const { logs } = await SpaceConnector.client.monitoring.log.list({
                    data_source_id: state.dataSourceIds[state.activeTab],
                    resource_id: props.cloudServiceId,
                    keyword: state.searchText,
                    start: selectedTimeWithin?.start.toISOString(),
                    end: selectedTimeWithin?.end.toISOString(),
                });
                state.totalCount = logs.length;
                state.data = logs.slice(state.pageStart - 1, state.pageStart + state.pageLimit - 1);
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
                if (!total_count) return total_count;
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
                return total_count;
            } catch (e) {
                ErrorHandler.handleError(e);
                state.layouts = [];
                state.dataSourceIds = {};
                return 0;
            }
        };

        // handler
        const dynamicLayoutListeners: Partial<DynamicLayoutEventListener> = {
            fetch(options) {
                if (options?.pageStart) {
                    state.pageStart = options.pageStart;
                }
                if (options?.pageLimit) {
                    state.pageLimit = options.pageLimit;
                }
                state.searchText = options?.searchText ?? '';
                getLogData();
            },
            async export() {
                const fields = state.currentLayout?.options?.fields;
                if (!fields) return;
                const selectedTimeWithin = state.timeWithinList.find(timeWith => timeWith.name === state.selectedTimeWithin);
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
                    file_name_prefix: FILE_NAME_PREFIX.cloudServiceHistoryLog,
                });
            },
        };
        // init
        (async () => {
            const totalLayoutCount = await getSchema();
            if (totalLayoutCount) await getLogData();
        })();

        // watcher
        watch([() => state.selectedTimeWithin, () => props.date], () => {
            getLogData();
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
.log-dynamic-layout::v-deep {
    .p-toolbox {
        padding-top: 0;
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
</style>
