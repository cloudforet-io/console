<template>
    <div class="project-personal-health-dashboard">
        <template v-show="awsProvider">
            <div class="title">
                <span :style="{ color: awsProvider ? awsProvider.color : '' }">AWS </span>
                <span>{{ $t('COMMON.WIDGETS.PERSONAL_HEALTH_DASHBOARD.TITLE') }}</span>
            </div>

            <div class="summary-wrapper" :style="{ color: awsProvider ? awsProvider.color : '' }">
                <div v-for="(data, index) in summaryData" :key="index"
                     class="summary" :class="{active: tabState.activeTab === data.name}"
                     @click="tabState.activeTab = data.name"
                >
                    <p-anchor :href="summaryLinkFormatter(data.name).href"
                              :show-icon="false" class="count" highlight
                    >
                        {{ data.count | summaryCount }}
                    </p-anchor>
                    <span class="label">{{ data.label }}</span>
                    <span class="date">{{ data.date }}</span>
                </div>
            </div>

            <widget-layout>
                <p-search-table :loading="loading"
                                :fields="fields"
                                :items="data"
                                :this-page.sync="thisPage"
                                :page-size.sync="pageSize"
                                :sort-by.sync="sortBy"
                                :sort-desc.sync="sortDesc"
                                :search-text.sync="search"
                                :placeholder="$t('COMMON.WIDGETS.PERSONAL_HEALTH_DASHBOARD.PLACEHOLDER')"
                                :excel-visible="false"
                                :page-size-visible="false"
                                :selectable="false"
                                class="search-table"
                                @change="onChange"
                >
                    <template #col-event-format="{ value }">
                        <router-link :to="value.to">
                            <p-anchor highlight>
                                {{ value.name }}
                            </p-anchor>
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
                                    <router-link :to="referenceRouter(resource.entity_value, { resource_type: 'inventory.CloudService' })">
                                        <p-anchor highlight>
                                            <span class="link-text">{{ resource.entity_value }}</span>
                                        </p-anchor>
                                    </router-link>
                                </template>
                            </div>
                        </div>
                        <div v-else />
                    </template>
                    <template #no-data-format>
                        {{ $t('COMMON.WIDGETS.PERSONAL_HEALTH_DASHBOARD.NO_DATA') }}
                    </template>
                </p-search-table>
            </widget-layout>
        </template>
    </div>
</template>

<script lang="ts">
/* eslint-disable camelcase */
import dayjs from 'dayjs';

import {
    ComponentRenderProxy, computed, getCurrentInstance, reactive, toRefs, watch,
} from '@vue/composition-api';

import {
    PAnchor, PI, PSearchTable,
} from '@spaceone/design-system';

import WidgetLayout from '@/views/common/components/layouts/WidgetLayout.vue';

import { SpaceConnector } from '@/lib/space-connector';
import { ApiQueryHelper } from '@/lib/space-connector/helper';
import { referenceRouter } from '@/lib/reference/referenceRouter';
import { getPageStart } from '@/lib/component-utils/pagination';
import { QueryHelper } from '@/lib/query';
import { QueryStoreFilter } from '@/lib/query/type';
import { store } from '@/store';
import numeral from 'numeral';


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
    filters: {
        summaryCount(val) {
            return val < 100000 ? numeral(val).format('0,0') : numeral(val).format('0a');
        },
    },
    components: {
        PI,
        PAnchor,
        PSearchTable,
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
            awsProvider: computed(() => store.state.resource.provider.items.aws),
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
                    .setSort(state.sortBy, state.sortDesc)
                    .setPage(getPageStart(state.thisPage, state.pageSize), state.pageSize)
                    .setFilters([{ v: state.search }]);
                const res = await SpaceConnector.client.statistics.topic.phdEvents(
                    {
                        project_id: props.projectId,
                        event_type_category: tabState.activeTab,
                        query: getEventsApiQuery.data,
                        period: EVENT_PERIOD,
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
        const onChange = () => {
            vm.$nextTick(async () => {
                await getEvents();
            });
        };

        watch(() => tabState.activeTab, () => {
            getEvents();
        }, { immediate: false });

        /* init */
        (async () => {
            await Promise.all([getEvents(), getCount()]);
        })();

        return {
            ...toRefs(state),
            tabState,
            regionFormatter,
            summaryLinkFormatter,
            getEvents,
            onChange,
            referenceRouter,
            EVENT_CATEGORY,
        };
    },
};
</script>

<style lang="postcss" scoped>
.project-personal-health-dashboard {
    .title {
        font-size: 1.5rem;
        line-height: 1.4;
        padding-top: 0.5rem;
        margin-bottom: 0.75rem;
    }
    .widget-layout {
        @apply block border border-gray-200;
        border-radius: 2px;
        padding: 0;
    }
}
.summary-wrapper {
    @apply flex;
    margin-bottom: -1px;
    .summary {
        @apply flex-grow border border-gray-200 bg-white;
        margin-right: 0.375rem;
        max-width: 15.25rem;
        cursor: pointer;
        padding: 0.625rem 1rem;
        border-radius: 0.375rem 0.375rem 0 0;
        &:last-child {
            @apply m-0;
        }
        &.active {
            box-shadow: inset 0 3px currentColor;
            border-bottom-color: theme('colors.white');
        }
        .count {
            font-size: 1.125rem;
            padding-right: 0.375rem;
        }
        .label {
            @apply text-gray-900;
            font-size: 0.875rem;
            font-weight: bold;
        }
        .date {
            @apply text-gray-500;
            display: block;
            font-size: 0.75rem;
            line-height: 1.2;
            padding-top: 0.25rem;
        }
    }
}

.search-table {
    @apply bg-white;
    height: 18.75rem;
    border-width: 0;
    .link-text {
        @apply truncate;
        display: inline-block;
        width: 9rem;
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

.link-text {
    @apply text-secondary;
    &:hover {
        text-decoration: underline;
    }
    .p-i-icon {
        margin-bottom: 0.125rem;
    }
}
</style>
