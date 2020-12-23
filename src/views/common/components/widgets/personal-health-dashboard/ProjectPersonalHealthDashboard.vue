<template>
    <div class="project-personal-health-dashboard">
        <div class="title">
            <span :style="{ 'color': providers.aws ? providers.aws.color : '' }">AWS </span>
            <span>{{ $t('COMMON.WIDGETS.PERSONAL_HEALTH_DASHBOARD.TITLE') }}</span>
        </div>
        <widget-layout>
            <div class="top-part">
                <div class="summary-wrapper grid grid-cols-12">
                    <div v-for="(data, index) in summaryData" :key="index"
                         class="summary col-span-4"
                    >
                        <router-link :to="summaryLinkFormatter(data.name)" class="count link-text">
                            <span>{{ data.count }}</span>
                        </router-link>
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
                          @delete="onSearch"
                />
                <p-text-pagination
                    :this-page.sync="thisPage"
                    :all-page="allPage"
                    @pageChange="changePage"
                />
                <p-icon-button name="ic_refresh" @click="onRefresh" />
            </div>
            <p-data-table :loading="loading"
                          :fields="fields"
                          :selectable="false"
                          :items="data"
                          :sortable="true"
                          :sort-by.sync="sortBy"
                          :sort-desc.sync="sortDesc"
                          @change="onChange"
                          @changeSort="onChange"
            >
                <template #col-event-format="{ value }">
                    <router-link :to="value.to" class="link-text">
                        <span>{{ value.name }}</span>
                    </router-link>
                </template>
                <template #col-region_code-format="{ value }">
                    <span>{{ regionFormatter(value) }}</span>
                </template>
                <template #col-start_time-format="{ value }">
                    <span>{{ value }}</span>
                </template>
                <template #col-affected_resources-format="{ value }">
                    <div v-if="value.length > 0">
                        <div v-for="(resource, index) in value" :key="index" class="affected-resources-wrapper">
                            <template v-if="resource.entity_type === 'account'">
                                <span class="label">{{ $t('COMMON.WIDGETS.PERSONAL_HEALTH_DASHBOARD.ACCOUNT_ID') }} : </span>
                                <span class="value">{{ resource.aws_account_id }}</span>
                            </template>
                            <template v-else>
                                <router-link class="link-text"
                                             :to="referenceRouter(resource.entity_value, { resource_type: 'inventory.CloudService' })"
                                >
                                    <span>{{ resource.entity_value }}</span>
                                    <p-i name="ic_external-link" height="1em" width="1em" />
                                </router-link>
                            </template>
                        </div>
                    </div>
                    <div v-else />
                </template>
            </p-data-table>
            <p-empty v-if="!loading && data.length === 0" class="py-8">
                <span>{{ $t('COMMON.WIDGETS.PERSONAL_HEALTH_DASHBOARD.NO_DATA') }}</span>
            </p-empty>
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
import PTextPagination from '@/components/organisms/paginations/text-pagination/PTextPagination.vue';
import PDataTable from '@/components/organisms/tables/data-table/PDataTable.vue';
import PTab from '@/components/organisms/tabs/tab/PTab.vue';
import PSearch from '@/components/molecules/search/PSearch.vue';
import PIconButton from '@/components/molecules/buttons/icon-button/PIconButton.vue';
import PEmpty from '@/components/atoms/empty/PEmpty.vue';
import PI from '@/components/atoms/icons/PI.vue';

import { SpaceConnector } from '@/lib/space-connector';
import { ApiQueryHelper } from '@/lib/space-connector/helper';
import { referenceRouter } from '@/lib/reference/referenceRouter';
import { getPageStart } from '@/lib/component-utils/pagination';
import { QueryHelper } from '@/lib/query';
import { QueryStoreFilter } from '@/lib/query/type';
import { store } from '@/store';


enum EVENT_CATEGORY {
    accountNotification = 'accountNotification',
    scheduledChange = 'scheduledChange',
    issue = 'issue'
}
const CLOUD_SERVICE_GROUP = 'PersonalHealthDashboard';
const CLOUD_SERVICE_NAME = 'Event';
const EVENT_PERIOD = 7;

export default {
    name: 'ProjectPersonalHealthDashboard',
    components: {
        PI,
        PTextPagination,
        PEmpty,
        PIconButton,
        PSearch,
        PTab,
        PDataTable,
        WidgetLayout,
    },
    props: {
        providers: {
            type: Object,
            default: () => ({}),
        },
        projectId: {
            type: String,
            default: undefined,
        },
    },
    setup(props) {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const getEventsApiQuery = new ApiQueryHelper();
        const queryHelper = new QueryHelper();

        const state = reactive({
            loading: false,
            regions: computed(() => store.state.resource.region.items),
            timezone: computed(() => store.state.user.timezone),
            cloudServiceTypes: computed(() => store.state.resource.cloudServiceType.items),
            thisPage: 1,
            pageSize: 5,
            totalCount: 0,
            allPage: computed(() => Math.ceil(state.totalCount / state.pageSize) || 1),
            data: [],
            summaryData: computed(() => ([
                {
                    name: EVENT_CATEGORY.issue,
                    label: vm.$t('COMMON.WIDGETS.PERSONAL_HEALTH_DASHBOARD.SUMMARY_ISSUE'),
                    count: state.countData.issue,
                    date: vm.$t('COMMON.WIDGETS.PERSONAL_HEALTH_DASHBOARD.PAST_7_DAYS'),
                },
                {
                    name: EVENT_CATEGORY.scheduledChange,
                    label: vm.$t('COMMON.WIDGETS.PERSONAL_HEALTH_DASHBOARD.SUMMARY_SCHEDULED_CHANGE'),
                    count: state.countData.scheduledChange,
                    date: vm.$t('COMMON.WIDGETS.PERSONAL_HEALTH_DASHBOARD.UPCOMING_AND_PAST_7_DAYS'),
                },
                {
                    name: EVENT_CATEGORY.accountNotification,
                    label: vm.$t('COMMON.WIDGETS.PERSONAL_HEALTH_DASHBOARD.SUMMARY_NOTIFICATION'),
                    count: state.countData.accountNotification,
                    date: vm.$t('COMMON.WIDGETS.PERSONAL_HEALTH_DASHBOARD.PAST_7_DAYS'),
                },
            ])),
            fields: computed(() => [
                { name: 'event', label: vm.$t('COMMON.WIDGETS.PERSONAL_HEALTH_DASHBOARD.FIELD_EVENT'), sortable: false },
                { name: 'region_code', label: vm.$t('COMMON.WIDGETS.PERSONAL_HEALTH_DASHBOARD.FIELD_REGION') },
                { name: 'start_time', label: vm.$t('COMMON.WIDGETS.PERSONAL_HEALTH_DASHBOARD.FIELD_START_TIME') },
                { name: 'last_update_time', label: vm.$t('COMMON.WIDGETS.PERSONAL_HEALTH_DASHBOARD.FIELD_LAST_UPDATE_TIME') },
                { name: 'affected_resources', label: vm.$t('COMMON.WIDGETS.PERSONAL_HEALTH_DASHBOARD.FIELD_AFFECTED_RESOURCES'), sortable: false },
            ]),
            countData: {},
            search: '',
            sortBy: 'last_update_time',
            sortDesc: true,
        });
        const tabState = reactive({
            tabs: computed(() => [
                {
                    name: EVENT_CATEGORY.issue,
                    label: vm.$t('COMMON.WIDGETS.PERSONAL_HEALTH_DASHBOARD.SUMMARY_ISSUE'),
                    type: 'item',
                }, {
                    name: EVENT_CATEGORY.scheduledChange,
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

        /* util */
        const regionFormatter = val => state.regions[val]?.name || val;
        const summaryLinkFormatter = (category) => {
            const filters: QueryStoreFilter[] = [];
            const status = ['open'];
            if (category === EVENT_CATEGORY.scheduledChange) status.push('upcoming');
            filters.push({ k: 'data.event_type_category', o: '=', v: category });
            filters.push({ k: 'data.status_code', o: '=', v: status });

            return {
                name: 'cloudServicePage',
                query: {
                    filters: queryHelper.setFilters(filters).rawQueryStrings,
                },
                params: {
                    provider: 'aws',
                    group: CLOUD_SERVICE_GROUP,
                    name: CLOUD_SERVICE_NAME,
                },
            };
        };

        /* api */
        const getCount = async () => {
            try {
                state.countData = await SpaceConnector.client.statistics.topic.phdCountByType({
                    project_id: props.projectId,
                    period: EVENT_PERIOD,
                });
            } catch (e) {
                console.error(e);
            }
        };
        const getEvents = async () => {
            try {
                state.loading = true;
                getEventsApiQuery
                    .setSort(state.sortBy, state.sortDesc, 'name')
                    .setPage(getPageStart(state.thisPage, state.pageSize), state.pageSize)
                    .setFilters([{ v: state.search }]);
                const res = await SpaceConnector.client.statistics.topic.phdEvents(
                    {
                        project_id: props.projectId,
                        event_type_category: tabState.activeTab,
                        query: getEventsApiQuery.data,
                    },
                );

                state.totalCount = res.total_count;
                state.data = res.results.map((d) => {
                    const startTime = dayjs.tz(dayjs(d.start_time).utc(), state.timezone).format('YYYY-MM-DD HH:mm:ss');
                    const lastUpdateTime = dayjs.tz(dayjs(d.last_update_time).utc(), state.timezone).format('YYYY-MM-DD HH:mm:ss');
                    return {
                        event: {
                            name: d.event_title,
                            to: referenceRouter(d.resource_id, { resource_type: 'inventory.CloudService' }),
                        },
                        region_code: d.region_code,
                        start_time: startTime,
                        last_update_time: lastUpdateTime,
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
        const onSearch = async (val) => {
            await (state.search = val);
            await getEvents();
        };
        const onChange = () => {
            getEvents();
        };
        const onRefresh = () => {
            state.thisPage = 1;
            state.search = '';
            getEvents();
        };
        const changePage = (page) => {
            state.thisPage = page;
            getEvents();
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
            regionFormatter,
            summaryLinkFormatter,
            getEvents,
            onSearch,
            onChange,
            onRefresh,
            changePage,
            referenceRouter,
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
                font-size: 1.125rem;
                padding-right: 0.375rem;
            }
            .label {
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
        .text-pagination {
            padding: 0 1.25rem;
        }
        .p-icon-button {
            margin-left: 1rem;
        }
    }
    .p-data-table::v-deep {
        .table-container {
            max-height: 19.5rem;
        }
        .link-text {
            display: inline-block;
            width: 15rem;
            white-space: pre-wrap;
            padding: 0.5rem 0;
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
}
.link-text {
    @apply text-secondary;
    &:hover {
        text-decoration: underline;
    }
    .p-i-icon {
        margin-bottom: 0.125rem;
    }
}
.p-empty {
    height: 6.875rem;
}
</style>
