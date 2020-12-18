<template>
    <div class="project-personal-health-dashboard">
        <div class="title">
            {{ $t('COMMON.WIDGETS.PERSONAL_HEALTH_DASHBOARD.TITLE') }}
        </div>
        <widget-layout>
            <div class="top-part">
                <div class="summary-wrapper grid grid-cols-12">
                    <div v-for="(data, index) in summaryData" :key="index"
                         class="summary col-span-4"
                    >
                        <span class="count">{{ data.count }}</span>
                        <span class="label">{{ data.label }}</span>
                        <span class="date">{{ data.date }}</span>
                    </div>
                </div>
            </div>
            <p-tab :tabs="tabState.tabs"
                   :active-tab.sync="tabState.activeTab"
            >
                <template #openIssues>
                    <div class="search-wrapper">
                        <p-search v-model="search" class="p-search"
                                  :placeholder="$t('COMMON.WIDGETS.PERSONAL_HEALTH_DASHBOARD.SEARCH')"
                                  @search="onSearch"
                                  @delete="onSearch"
                        />
                        <p-icon-button
                            name="ic_refresh"
                            @click="onClickRefresh"
                        />
                    </div>
                    <p-data-table :fields="fields"
                                  :selectable="false"
                                  :items="openIssuesData"
                    />
                </template>
                <template #scheduledChanges>
                    scheduledChanges
                </template>
                <template #otherNotifications>
                    otherNotifications
                </template>
            </p-tab>
        </widget-layout>
    </div>
</template>

<script lang="ts">
import {
    computed, reactive, toRefs,
    ComponentRenderProxy, getCurrentInstance,
} from '@vue/composition-api';

import WidgetLayout from '@/views/common/components/layouts/WidgetLayout.vue';
import PDataTable from '@/components/organisms/tables/data-table/PDataTable.vue';
import PTab from '@/components/organisms/tabs/tab/PTab.vue';
import PSearch from '@/components/molecules/search/PSearch.vue';
import PIconButton from '@/components/molecules/buttons/icon-button/PIconButton.vue';


export default {
    name: 'ProjectPersonalHealthDashboard',
    components: {
        PIconButton,
        PSearch,
        PTab,
        PDataTable,
        WidgetLayout,
    },
    setup() {
        const vm = getCurrentInstance() as ComponentRenderProxy;

        const state = reactive({
            loading: false,
            data: [],
            summaryData: computed(() => ([
                {
                    label: vm.$t('COMMON.WIDGETS.PERSONAL_HEALTH_DASHBOARD.SUMMARY_OPEN_ISSUES'),
                    count: 24,
                    date: 'Past 7 days',
                },
                {
                    label: vm.$t('COMMON.WIDGETS.PERSONAL_HEALTH_DASHBOARD.SUMMARY_SCHEDULED_CHANGES'),
                    count: 123,
                    date: 'Upcoming and Past 7 days',
                },
                {
                    label: vm.$t('COMMON.WIDGETS.PERSONAL_HEALTH_DASHBOARD.SUMMARY_OTHER_NOTIFICATIONS'),
                    count: 6,
                    date: 'Past 7 days',
                },
            ])),
            fields: computed(() => [
                { name: 'event', label: vm.$t('COMMON.WIDGETS.PERSONAL_HEALTH_DASHBOARD.FIELD_EVENT') },
                { name: 'region', label: vm.$t('COMMON.WIDGETS.PERSONAL_HEALTH_DASHBOARD.FIELD_REGION') },
                { name: 'startTime', label: vm.$t('COMMON.WIDGETS.PERSONAL_HEALTH_DASHBOARD.FIELD_START_TIME') },
                { name: 'lastUpdateTime', label: vm.$t('COMMON.WIDGETS.PERSONAL_HEALTH_DASHBOARD.FIELD_LAST_UPDATE_TIME') },
                { name: 'affectedResources', label: vm.$t('COMMON.WIDGETS.PERSONAL_HEALTH_DASHBOARD.FIELD_AFFECTED_RESOURCES') },
            ]),
            openIssuesData: [],
            search: '',
        });
        const tabState = reactive({
            tabs: computed(() => [
                {
                    name: 'openIssues',
                    label: vm.$t('COMMON.WIDGETS.PERSONAL_HEALTH_DASHBOARD.SUMMARY_OPEN_ISSUES'),
                    type: 'item',
                }, {
                    name: 'scheduledChanges',
                    label: vm.$t('COMMON.WIDGETS.PERSONAL_HEALTH_DASHBOARD.SUMMARY_SCHEDULED_CHANGES'),
                    type: 'item',
                }, {
                    name: 'otherNotifications',
                    label: vm.$t('COMMON.WIDGETS.PERSONAL_HEALTH_DASHBOARD.SUMMARY_OTHER_NOTIFICATIONS'),
                    type: 'item',
                },
            ]),
            activeTab: 'openIssues',
        });

        const onSearch = async (val?: string) => {
            state.search = val || '';
            // proxyState.searchText = val || '';
            // emitChange({ searchText: val || '' });
        };
        const onClickRefresh = () => {

        };

        return {
            ...toRefs(state),
            tabState,
            onSearch,
            onClickRefresh,
        };
    },
};
</script>

<style lang="postcss" scoped>
.project-personal-health-dashboard {
    .title {
        font-size: 1.5rem;
        line-height: 1.2;
        margin-top: 1rem;
    }
    .widget-layout {
        @apply border border-gray-200;
        border-radius: 2px;
        padding: 0;
    }
}
.top-part {
    margin: 1rem 1rem 0 1rem;
    .summary-wrapper {
        @apply border border-gray-200;
        height: 4.25rem;
        border-radius: 2px;
        margin-bottom: 1rem;
        .summary {
            @apply border-r border-gray-200;
            margin: auto 0;
            padding-left: 1rem;
            &:last-child {
                @apply border-none;
            }
            .count {
                @apply text-violet-600;
                font-size: 1.125rem;
                padding-right: 0.375rem;
            }
            .label {
                @apply text-gray-600;
                font-size: 0.875rem;
                font-weight: bold;
            }
            .date {
                @apply text-gray-500;
                display: block;
                font-size: 0.75rem;
                line-height: 1.2;
            }
        }
    }
}
.p-tab {
    border: none;
    .search-wrapper {
        display: flex;
        padding: 1.5rem 1rem;
        .p-icon-button {
            margin-left: 1rem;
        }
    }
}
</style>
