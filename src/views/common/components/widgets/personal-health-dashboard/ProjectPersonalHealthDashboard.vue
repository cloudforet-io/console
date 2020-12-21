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
            />
            <div class="search-wrapper">
                <p-search v-model="search" class="p-search"
                          :placeholder="$t('COMMON.WIDGETS.PERSONAL_HEALTH_DASHBOARD.PLACEHOLDER')"
                          @search="onSearch"
                />
                <p-icon-button name="ic_refresh" @click="getEvents" />
            </div>
            <p-data-table :loading="loading"
                          :fields="fields"
                          :selectable="false"
                          :items="showMore ? data : data.slice(0, 5)"
                          :sortable="true"
                          :sort-by.sync="sortBy"
                          :sort-desc.sync="sortDesc"
                          :class="{ 'more': showMore }"
                          @change="onChange"
            >
                <template #col-event-format="{ value }">
                    <router-link :to="value.to" class="link-text">
                        <span>{{ value.name }}</span>
                    </router-link>
                </template>
                <template #col-start_time-format="{ value }">
                    <span>{{ value }}</span>
                </template>
                <template #col-affected_resources-format="{ value }">
                    <div v-if="value.length > 0">
                        <div v-for="(resource, index) in value" :key="index" class="affected-resources-wrapper">
                            <template v-if="resource.awsAccountId">
                                <span class="label">{{ $t('COMMON.WIDGETS.PERSONAL_HEALTH_DASHBOARD.SERVICE_ACCOUNT_ID') }} : </span>
                                <span class="value">{{ resource.awsAccountId }}</span>
                            </template>
                        </div>
                    </div>
                    <div v-else />
                </template>
            </p-data-table>
            <div v-show="data.length > 5" class="more-button-wrapper"
                 @click="onClickMoreButton"
            >
                <div class="more-button">
                    <span>{{ showMore ? $t('COMMON.WIDGETS.PERSONAL_HEALTH_DASHBOARD.HIDE') : $t('COMMON.WIDGETS.PERSONAL_HEALTH_DASHBOARD.MORE') }}</span>
                    <p-i :name="showMore ? 'ic_arrow_top' : 'ic_arrow_bottom'"
                         height="1rem" width="1rem" color="inherit transparent"
                    />
                </div>
            </div>
        </widget-layout>
    </div>
</template>

<script lang="ts">
/* eslint-disable camelcase */
import dayjs from 'dayjs';

import {
    ComponentRenderProxy, computed, getCurrentInstance, reactive, toRefs, watch,
} from '@vue/composition-api';

import WidgetLayout from '@/views/common/components/layouts/WidgetLayout.vue';
import PDataTable from '@/components/organisms/tables/data-table/PDataTable.vue';
import PTab from '@/components/organisms/tabs/tab/PTab.vue';
import PSearch from '@/components/molecules/search/PSearch.vue';
import PIconButton from '@/components/molecules/buttons/icon-button/PIconButton.vue';
import PI from '@/components/atoms/icons/PI.vue';

import { SpaceConnector } from '@/lib/space-connector';
import { ApiQueryHelper } from '@/lib/space-connector/helper';
import { referenceRouter } from '@/lib/reference/referenceRouter';
import { timestampFormatter } from '@/lib/util';
import { QueryHelper } from '@/lib/query';
import { store } from '@/store';


enum EVENT_CATEGORY {
    accountNotification = 'accountNotification',
    scheduledChanges = 'scheduledChanges',
    issue = 'issue'
}

export default {
    name: 'ProjectPersonalHealthDashboard',
    components: {
        PI,
        PIconButton,
        PSearch,
        PTab,
        PDataTable,
        WidgetLayout,
    },
    props: {
        projectId: {
            type: String,
            default: undefined,
        },
    },
    setup(props) {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const queryHelper = new QueryHelper();
        const getEventsApiQuery = new ApiQueryHelper();

        const state = reactive({
            loading: false,
            regions: computed(() => store.state.resource.region.items),
            timezone: computed(() => store.state.user.timezone),
            data: [],
            summaryData: computed(() => ([
                {
                    label: vm.$t('COMMON.WIDGETS.PERSONAL_HEALTH_DASHBOARD.SUMMARY_ISSUE'),
                    count: state.countData.issue,
                    date: vm.$t('COMMON.WIDGETS.PERSONAL_HEALTH_DASHBOARD.PAST_7_DAYS'),
                },
                {
                    label: vm.$t('COMMON.WIDGETS.PERSONAL_HEALTH_DASHBOARD.SUMMARY_SCHEDULED_CHANGE'),
                    count: state.countData.scheduledChange,
                    date: vm.$t('COMMON.WIDGETS.PERSONAL_HEALTH_DASHBOARD.UPCOMING_AND_PAST_7_DAYS'),
                },
                {
                    label: vm.$t('COMMON.WIDGETS.PERSONAL_HEALTH_DASHBOARD.SUMMARY_NOTIFICATION'),
                    count: state.countData.accountNotification,
                    date: vm.$t('COMMON.WIDGETS.PERSONAL_HEALTH_DASHBOARD.PAST_7_DAYS'),
                },
            ])),
            fields: computed(() => [
                { name: 'event', label: vm.$t('COMMON.WIDGETS.PERSONAL_HEALTH_DASHBOARD.FIELD_EVENT'), sortable: false },
                { name: 'region', label: vm.$t('COMMON.WIDGETS.PERSONAL_HEALTH_DASHBOARD.FIELD_REGION') },
                { name: 'start_time', label: vm.$t('COMMON.WIDGETS.PERSONAL_HEALTH_DASHBOARD.FIELD_START_TIME') },
                { name: 'last_updated_time', label: vm.$t('COMMON.WIDGETS.PERSONAL_HEALTH_DASHBOARD.FIELD_LAST_UPDATE_TIME') },
                { name: 'affected_resources', label: vm.$t('COMMON.WIDGETS.PERSONAL_HEALTH_DASHBOARD.FIELD_AFFECTED_RESOURCES'), sortable: false },
            ]),
            countData: {},
            tags: [],
            search: '',
            sortBy: '',
            sortDesc: true,
            showMore: false,
        });
        const tabState = reactive({
            tabs: computed(() => [
                {
                    name: EVENT_CATEGORY.issue,
                    label: vm.$t('COMMON.WIDGETS.PERSONAL_HEALTH_DASHBOARD.SUMMARY_ISSUE'),
                    type: 'item',
                }, {
                    name: EVENT_CATEGORY.scheduledChanges,
                    label: vm.$t('COMMON.WIDGETS.PERSONAL_HEALTH_DASHBOARD.SUMMARY_SCHEDULED_CHANGE'),
                    type: 'item',
                }, {
                    name: EVENT_CATEGORY.accountNotification,
                    label: vm.$t('COMMON.WIDGETS.PERSONAL_HEALTH_DASHBOARD.SUMMARY_NOTIFICATION'),
                    type: 'item',
                },
            ]),
            activeTab: EVENT_CATEGORY.issue,
        });

        /* api */
        const getCount = async () => {
            try {
                state.countData = await SpaceConnector.client.statistics.topic.phdCountByType({
                    project_id: props.projectId,
                });
            } catch (e) {
                console.error(e);
            }
        };
        const getEvents = async () => {
            try {
                state.loading = true;
                getEventsApiQuery
                    .setSort(state.sortBy, state.sortDesc)
                    .setFilters([{ v: state.search }]);
                const res = await SpaceConnector.client.statistics.topic.phdEvents(
                    {
                        project_id: props.projectId,
                        event_type_category: tabState.activeTab,
                        query: getEventsApiQuery.data,
                    },
                );

                state.data = res.results.map((d) => {
                    const startTime = dayjs.tz(dayjs(d.start_time).utc(), state.timezone).format('YYYY-MM-DD HH:mm:ss');
                    const lastUpdatedTime = dayjs.tz(dayjs(d.last_updated_time).utc(), state.timezone).format('YYYY-MM-DD HH:mm:ss');
                    return {
                        event: {
                            name: d.event_title,
                            to: referenceRouter(d.resource_id, { resource_type: 'inventory.CloudService' }),
                        },
                        region: state.regions[d.region_code]?.name || d.region_code,
                        start_time: startTime,
                        last_updated_time: lastUpdatedTime,
                        affected_resources: d.affected_resources,
                    };
                });
            } catch (e) {
                console.error(e);
            } finally {
                state.loading = false;
            }
        };

        /* event */
        const onSearch = (val) => {
            state.search = val;
            getEvents();
        };
        const onChange = async (item) => {
            state.tags = item.queryTags;
            queryHelper.setFiltersAsQueryTag(item.queryTags);
            try {
                await getEvents();
            } catch (e) {
                console.error(e);
            }
        };
        const onClickMoreButton = () => {
            state.showMore = !state.showMore;
        };

        const init = async () => {
            await Promise.all([getEvents(), getCount()]);
        };
        init();

        watch(() => tabState.activeTab, () => {
            getEvents();
        }, { immediate: false });

        return {
            ...toRefs(state),
            tabState,
            getEvents,
            onSearch,
            onChange,
            onClickMoreButton,
            timestampFormatter,
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
                padding-top: 0.125rem;
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
    .p-data-table::v-deep {
        &.more {
            .table-container {
                max-height: 625rem;
            }
        }
        .link-text {
            @apply text-secondary;
            display: inline-block;
            width: 15rem;
            white-space: pre-wrap;
            padding: 0.5rem 0;
            &:hover {
                text-decoration: underline;
            }
        }
        .affected-resources-wrapper {
            display: flex;
            width: 10rem;
            line-height: 1.4;
            flex-wrap: wrap;
            padding-bottom: 0.5rem;
            &:first-child {
                padding-top: 0.5rem;
            }
            .label {
                @apply text-gray-600;
            }
        }
    }
    .more-button-wrapper {
        @apply text-blue-600;
        display: flex;
        height: 2rem;
        align-items: center;
        font-size: 0.75rem;
        cursor: pointer;
        &:hover {
            text-decoration: underline;
        }
        .more-button {
            margin: auto;
        }
    }
}
</style>
