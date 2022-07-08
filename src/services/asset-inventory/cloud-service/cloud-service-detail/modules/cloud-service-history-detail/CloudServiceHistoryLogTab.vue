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
                <div :key="`${layout.name}-${i}`">
                    <p-dynamic-layout :type="layout.type"
                                      :options="layout.options"
                                      :data="data"
                    >
                        <template #toolbox-top>
                            <div class="filter">
                                <!--song-lang-->
                                <span class="filter-label">{{ $t('Time Within') }}</span>
                                <p-select-status
                                    v-for="(item, index) in timeWithinList"
                                    :key="index"
                                    v-model="selectedType"
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
    reactive, toRefs, computed, defineComponent,
} from '@vue/composition-api';

import {
    PButtonTab, PDynamicLayout, PPanelTop, PSelectStatus,
} from '@spaceone/design-system';
import { DynamicLayout } from '@spaceone/design-system/dist/src/data-display/dynamic/dynamic-layout/type/layout-schema';
import { TabItem } from '@spaceone/design-system/dist/src/navigation/tabs/tab/type';

import { i18n } from '@/translations';

export default defineComponent({
    name: 'CloudServiceHistoryLogTab',
    components: {
        PDynamicLayout: PDynamicLayout as any,
        PButtonTab,
        PPanelTop,
        PSelectStatus,
    },
    setup() {
        const state = reactive({
            title: computed(() => i18n.t('Log')),
            totalCount: 10,
            tabs: computed<TabItem[]>(() => (state.layouts.map(layout => ({
                name: layout.name, label: layout.name,
            })))),
            activeTab: 'AWS Cloudtrail',
            timeWithinList: computed(() => ([
                // song-lang
                { name: 'last6hrs', label: i18n.t('Last 6hrs') },
                { name: 'last12hrs', label: i18n.t('Last 12hrs') },
                { name: '1day', label: i18n.t('1 Days') },
                { name: '2day', label: i18n.t('2 Days') },
            ])),
            selectedType: '1',
            layouts: [
                {
                    type: 'table',
                    name: 'AWS Cloudtrail',
                    options: {
                        fields: [
                            { key: 'event_name', name: 'Event Name', type: 'text' },
                            { key: 'event_time', name: 'Event Time', type: 'text' },
                            { key: 'user_name', name: 'User Name', type: 'text' },
                            { key: 'event_source', name: 'Event Source', type: 'text' },
                            { key: 'resource_type', name: 'Resource Type', type: 'text' },
                        ],
                        root_path: '',
                    },
                },
                {
                    type: 'table',
                    name: 'Azure ActiveLog',
                    options: {
                        fields: [
                            { key: 'event_name', name: 'Event Name', type: 'text' },
                            { key: 'event_time', name: 'Event Time', type: 'text' },
                            { key: 'user_name', name: 'User Name', type: 'text' },
                            { key: 'event_source', name: 'Event Source', type: 'text' },
                            { key: 'resource_type', name: 'Resource Type', type: 'text' },
                        ],
                        root_path: '',
                    },
                },
            ] as DynamicLayout[],
            data: [
                {
                    event_name: 'value',
                    event_time: 'value',
                    user_name: 'value',
                    event_source: 'value',
                    resource_type: 'value',
                },
            ],
        });
        const handleChangeTab = (tab) => {
            state.activeTab = tab;
        };
        return {
            ...toRefs(state),
            handleChangeTab,
        };
    },
});
</script>

<style lang="postcss" scoped>
.filter {
    @apply flex items-center items-end flex-wrap gap-4;
    margin: 1.625rem 1rem 1.125rem;
    .filter-label {
        @apply text-gray-400;
        font-size: 0.875rem;
        line-height: 1.15;
    }
}
</style>
