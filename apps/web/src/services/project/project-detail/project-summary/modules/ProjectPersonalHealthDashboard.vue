<template>
    <div class="project-personal-health-dashboard">
        <template v-if="awsProvider">
            <div class="title">
                <span :style="{ color: awsProvider ? awsProvider.color : '' }">AWS </span>
                <span>{{ $t('COMMON.WIDGETS.PERSONAL_HEALTH_DASHBOARD.TITLE') }}</span>
            </div>

            <div class="summary-wrapper"
                 :style="{ color: awsProvider ? awsProvider.color : '' }"
            >
                <div v-for="(data, index) in summaryData"
                     :key="index"
                     class="summary"
                     :class="{active: tabState.activeTab === data.name}"
                     @click="tabState.activeTab = data.name"
                >
                    <p-anchor :href="summaryLinkFormatter(data.name).href"
                              hide-icon
                              class="count"
                              highlight
                    >
                        {{ data.count | summaryCount }}
                    </p-anchor>
                    <span class="label">{{ data.label }}</span>
                    <span class="date">{{ data.date }}</span>
                </div>
            </div>

            <widget-layout>
                <p-toolbox-table :loading="loading"
                                 :fields="fields"
                                 :items="data"
                                 :sort-by.sync="sortBy"
                                 :sort-desc.sync="sortDesc"
                                 :search-text.sync="search"
                                 :placeholder="$t('COMMON.WIDGETS.PERSONAL_HEALTH_DASHBOARD.PLACEHOLDER')"
                                 :page-size-changeable="false"
                                 sortable
                                 class="search-table"
                                 @change="onChange"
                >
                    <template #col-event-format="{ value }">
                        <p-anchor :to="value.to"
                                  highlight
                        >
                            {{ value.name }}
                        </p-anchor>
                    </template>
                    <template #col-region_code-format="{ value }">
                        <span>{{ regionFormatter(value) }}</span>
                    </template>
                    <template #col-start_time-format="{ value }">
                        <span>{{ value }}</span>
                    </template>
                    <template #col-affected_resources-format="{ value }">
                        <div v-if="value.length > 0">
                            <div v-for="(resource, index) in value"
                                 :key="index"
                                 class="affected-resources-wrapper"
                            >
                                <template v-if="resource.entity_type === 'account'">
                                    <span class="label">{{ $t('COMMON.WIDGETS.PERSONAL_HEALTH_DASHBOARD.ACCOUNT_ID') }} : </span>
                                    <span class="value">{{ resource.aws_account_id }}</span>
                                </template>
                                <template v-else>
                                    <p-anchor :to="referenceRouter(resource.entity_value, { resource_type: 'inventory.CloudService' })"
                                              highlight
                                    >
                                        {{ resource.entity_value }}
                                    </p-anchor>
                                </template>
                            </div>
                        </div>
                        <div v-else />
                    </template>
                    <template #no-data-format>
                        {{ $t('COMMON.WIDGETS.PERSONAL_HEALTH_DASHBOARD.NO_DATA') }}
                    </template>
                </p-toolbox-table>
            </widget-layout>
        </template>
    </div>
</template>

<script lang="ts">
import {
    computed, getCurrentInstance, reactive, toRefs, watch,
} from 'vue';
import type { Vue } from 'vue/types/vue';

import {
    PAnchor, PToolboxTable,
} from '@spaceone/design-system';
import dayjs from 'dayjs';
import numeral from 'numeral';

import { QueryHelper } from '@cloudforet/core-lib/query';
import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import { store } from '@/store';

import type { CloudServiceTypeReferenceMap } from '@/store/modules/reference/cloud-service-type/type';
import type { ProviderReferenceMap } from '@/store/modules/reference/provider/type';
import type { RegionReferenceMap } from '@/store/modules/reference/region/type';

import { referenceRouter } from '@/lib/reference/referenceRouter';

import WidgetLayout from '@/common/components/layouts/WidgetLayout.vue';
import ErrorHandler from '@/common/composables/error/errorHandler';

import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/route-config';

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
        PAnchor,
        PToolboxTable,
        WidgetLayout,
    },
    props: {
        projectId: {
            type: String,
            default: undefined,
        },
    },
    setup(props) {
        const vm = getCurrentInstance()?.proxy as Vue;
        const getEventsApiQuery = new ApiQueryHelper();
        const queryHelper = new QueryHelper();

        const state = reactive({
            loading: false,
            regions: computed<RegionReferenceMap>(() => store.getters['reference/regionItems']),
            timezone: computed(() => store.state.user.timezone),
            cloudServiceTypes: computed<CloudServiceTypeReferenceMap>(() => store.getters['reference/cloudServiceTypeItems']),
            providers: computed<ProviderReferenceMap>(() => store.getters['reference/providerItems']),
            pageStart: 1,
            pageLimit: 5,
            totalCount: 0,
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
            awsProvider: computed(() => state.providers.aws),
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
        const regionFormatter = (val) => state.regions[val]?.name || val;
        const summaryLinkFormatter = (category) => {
            const filters: ConsoleFilter[] = [];
            const status = ['open'];
            if (category === EVENT_CATEGORY.scheduledChange) status.push('upcoming');
            filters.push({ k: 'data.event_type_category', o: '=', v: category });
            filters.push({ k: 'data.status_code', o: '=', v: status });

            return {
                name: ASSET_INVENTORY_ROUTE.CLOUD_SERVICE.DETAIL._NAME,
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
                ErrorHandler.handleError(e);
            }
        };
        const getEvents = async () => {
            try {
                state.loading = true;
                getEventsApiQuery
                    .setSort(state.sortBy, state.sortDesc)
                    .setPage(state.pageStart, state.pageLimit)
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
                ErrorHandler.handleError(e);
                state.data = [];
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
            await Promise.allSettled([
                getEvents(), getCount(),
                store.dispatch('reference/region/load'),
                store.dispatch('reference/cloudServiceType/load'),
                store.dispatch('reference/provider/load'),
            ]);
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
        @apply block border border-gray-200 rounded-md;
        padding: 0;
    }
}
.summary-wrapper {
    @apply flex;
    margin-bottom: -1px;
    .summary {
        @apply flex-grow border border-gray-200 bg-white rounded-tr-lg rounded-tl-lg;
        margin-right: 0.375rem;
        max-width: 15.25rem;
        cursor: pointer;
        padding: 0.625rem 1rem;
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
</style>
