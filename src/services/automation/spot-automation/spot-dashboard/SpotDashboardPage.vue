<template>
    <section class="dashboard-page-wrapper">
        <nav class="page-info">
            <p-breadcrumbs :routes="routeState.route" />
            <p-page-title :title="$t('AUTOMATION.SPOT_AUTOMATION.DASHBOARD.PAGE_TITLE')" />
        </nav>
        <section class="dashboard-wrapper">
            <div class="spot-group-info widget-layout">
                <div class="summary-wrapper">
                    <div class="summary-row">
                        <span class="title">{{ $t('AUTOMATION.SPOT_AUTOMATION.DASHBOARD.USED_SPOT_GROUP') }}</span>
                        <span class="count">{{ spotGroupCount }}</span>
                    </div>
                    <div class="summary-row">
                        <span class="title">{{ $t('AUTOMATION.SPOT_AUTOMATION.DASHBOARD.ALL_INSTANCE') }}</span>
                        <span class="sub-title">{{ $t('AUTOMATION.SPOT_AUTOMATION.DASHBOARD.ALL_INSTANCE_DESC') }}</span>
                        <span class="count">{{ totalInstanceCount }}</span>
                    </div>
                    <div class="summary-row">
                        <span class="title">{{ $t('AUTOMATION.SPOT_AUTOMATION.DASHBOARD.SPOT_INSTANCE') }}</span>
                        <span class="count">{{ spotInstanceCount }}</span>
                    </div>
                </div>
                <div class="chart-section">
                    <spot-group-ratio-chart :spot-groups="spotGroups" />
                </div>
            </div>
            <instance-billing-chart class="widget-layout" />
            <div class="cost-info widget-layout">
                <spot-group-billing-summary
                    :saving-percentage="savingPercentage"
                    :saving-cost="savingCost"
                    :saving-result="savingResult"
                    :six-months-ago="true"
                />
            </div>
        </section>
        <p-divider class="dashboard-divider" />
        <section class="project-wrapper">
            <p class="project-instance-info">
                {{ $t('AUTOMATION.SPOT_AUTOMATION.DASHBOARD.SPOT_GROUP_BY_PROJECT') }} <span class="total-count">({{ totalCount }})</span>
            </p>
            <p-toolbox filters-visible
                       search-type="query"
                       :page-size.sync="pageSize"
                       :page-size-options="[12, 24, 36]"
                       :total-count="totalCount"
                       :query-tags="tags"
                       :key-item-sets="keyItemSets"
                       :value-handler-map="valueHandlerMap"
                       @change="onChange"
                       @refresh="onChange"
            />
            <p class="cost-instance-info">
                {{ $t('AUTOMATION.SPOT_AUTOMATION.LIST.COST_INSTANCE_DATE_1') }}<strong> {{ $t('AUTOMATION.SPOT_AUTOMATION.LIST.COST_INSTANCE_DATE_2') }}</strong>
            </p>
            <p-data-loader class="flex-grow" :data="items" :loading="dataLoading">
                <li class="project-card-list">
                    <article v-for="(item, i) in items" :key="i" class="project-item">
                        <router-link :to="{ name: AUTOMATION_ROUTE.SPOT_AUTOMATION.SPOT_GROUP._NAME }" class="item-wrapper">
                            <p class="project-group-name">
                                {{ item.project_group_info.name }}
                            </p>
                            <div class="project-name-wrapper">
                                <span class="project-name">
                                    {{ item.name }}
                                </span>
                                <div class="divider" />
                                <span class="spot-group-text">
                                    {{ $t('AUTOMATION.SPOT_AUTOMATION.MAIN.SPOT_GROUP') }}
                                    <strong>{{ item.spotGroupCount }}</strong>
                                </span>
                            </div>
                            <div v-if="item.spotGroupCount > 0" class="cost-chart-wrapper">
                                <div class="chart-wrapper">
                                    <span class="instance">{{ $t('AUTOMATION.SPOT_AUTOMATION.DASHBOARD.CARD.INSTANCE') }} <span class="instance-num">{{ item.instanceCount }}</span></span>
                                    <on-demand-and-spot-chart chart-type="long"
                                                              :spot="item.spotCount"
                                                              :ondemand="item.onDemandCount"
                                                              class="on-demand-chart"
                                    />
                                </div>
                                <div class="flex flex-col">
                                    <span class="cost-title">
                                        {{ $t('AUTOMATION.SPOT_AUTOMATION.DASHBOARD.SAVING_COST') }}
                                    </span>
                                    <span class="cost">
                                        <span class="text-sm">$</span>{{ item.savingCost }}
                                    </span>
                                </div>
                            </div>
                            <div v-else>
                                <p-anchor class="go-add" :show-icon="false"
                                          :to="{
                                              name: AUTOMATION_ROUTE.SPOT_AUTOMATION.SPOT_GROUP.ADD._NAME,
                                              params: {
                                                  projectId: item.project_id
                                              }
                                          }"
                                          target="_self"
                                >
                                    <template #left-extra>
                                        <p-i name="ic_plus_thin" height="1em" width="1em"
                                             color="inherit"
                                        />
                                    </template>
                                    {{ $t('AUTOMATION.SPOT_AUTOMATION.DASHBOARD.CARD.ADD_SPOT_GROUP') }}
                                </p-anchor>
                            </div>
                        </router-link>
                    </article>
                </li>
                <template #no-data>
                    <section class="no-project">
                        <img src="@/assets/images/illust_star.svg">
                        <span class="no-project-text">{{ $t('AUTOMATION.SPOT_AUTOMATION.DASHBOARD.NO_PROJECT') }}</span>
                        <router-link :to="{ name: PROJECT_ROUTE._NAME }">
                            <p-icon-text-button
                                style-type="primary1"
                                name="ic_plus_bold"
                                class="no-project-btn"
                            >
                                {{ $t('PROJECT.LANDING.CREATE_PROJECT') }}
                            </p-icon-text-button>
                        </router-link>
                    </section>
                </template>
            </p-data-loader>
        </section>
    </section>
</template>

<script lang="ts">
/* eslint-disable camelcase */
import {
    PDivider, PBreadcrumbs, PPageTitle, PToolbox, PDataLoader, PI, PAnchor, PIconTextButton,
} from '@spaceone/design-system';
import InstanceBillingChart from '@/services/automation/spot-automation/modules/InstanceBillingChart.vue';
import SpotGroupRatioChart from '@/services/automation/spot-automation/modules/SpotGroupRatioChart.vue';
import OnDemandAndSpotChart from '@/services/automation/spot-automation/components/OnDemandAndSpotChart.vue';
import SpotGroupBillingSummary from '@/services/automation/spot-automation/modules/SpotGroupBillingSummary.vue';

import {
    ComponentRenderProxy, computed, getCurrentInstance, reactive, toRefs,
} from '@vue/composition-api';

import { QueryHelper } from '@spaceone/console-core-lib/query';
import { replaceUrlQuery } from '@/lib/router-query-string';
import { getPageStart, getThisPage } from '@spaceone/console-core-lib/component-util/pagination';
import { ApiQueryHelper } from '@spaceone/console-core-lib/space-connector/helper';
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { Tags, TimeStamp } from '@/models';
import { AUTOMATION_ROUTE } from '@/services/automation/routes';
import { PROJECT_ROUTE } from '@/services/project/routes';
import { makeDistinctValueHandler, makeReferenceValueHandler } from '@spaceone/console-core-lib/component-util/query-search';

const handlers = {
    keyItemSets: [{
        title: 'Properties',
        items: [
            {
                name: 'name',
                label: 'Name',
            },
            {
                name: 'project_id',
                label: 'Project',
            },
        ],
    }],
    valueHandlerMap: {
        name: makeDistinctValueHandler('spot_automation.SpotGroup', 'name'),
        project_id: makeReferenceValueHandler('identity.Project'),
    },
};

interface ProjectGroupData {
    created_at?: TimeStamp;
    created_by?: string;
    name: string;
    parent_project_group_info?: object;
    project_group_id: string;
    tags?: Tags;
}

interface ProjectListData {
    created_at: TimeStamp;
    created_by?: string;
    name: string;
    project_group_info?: ProjectGroupData;
    project_id: string;
    tags: Tags;
    spotCount: number;
    onDemandCount: number;
    instanceCount: number;
}

interface SavingCostResponse {
    normal_cost: number;
    saving_result: number;
    saving_cost: number;
}

export default {
    name: 'SpotDashboardPage',
    components: {
        SpotGroupBillingSummary,
        SpotGroupRatioChart,
        InstanceBillingChart,
        OnDemandAndSpotChart,
        PI,
        PDivider,
        PBreadcrumbs,
        PPageTitle,
        PToolbox,
        PDataLoader,
        PAnchor,
        PIconTextButton,
    },
    setup() {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const queryHelper = new QueryHelper().setFiltersAsRawQueryString(vm.$route.query.filters);

        const state = reactive({
            spotGroups: [] as string[],
            spotGroupCount: computed(() => state.spotGroups.length),
            totalInstanceCount: 128,
            spotInstanceCount: 112,
            items: undefined as unknown as ProjectListData[],
            dataLoading: true,
            keyItemSets: handlers.keyItemSets,
            valueHandlerMap: handlers.valueHandlerMap,
            tags: queryHelper.setKeyItemSets(handlers.keyItemSets).queryTags,
            thisPage: 1,
            pageSize: 12,
            totalCount: 0,
            savingCost: 0,
            savingResult: 650,
            savingPercentage: 0,
        });

        const routeState = reactive({
            route: computed(() => [
                { name: vm.$t('MENU.AUTOMATION.AUTOMATION'), path: '/automation' },
                { name: vm.$t('MENU.AUTOMATION.SPOT_AUTOMATION') },
            ]),
        });

        /* util */
        const numberFormatter = (num) => {
            if (Math.abs(num) < 10000) {
                return Math.round(num * 100) / 100;
            }
            const options = { notation: 'compact', signDisplay: 'auto', maximumFractionDigits: 1 };
            return Intl.NumberFormat('en', options).format(num);
        };
        const commaFormatter = (num) => {
            if (num) return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            return num;
        };

        /* api */
        const listSpotGroups = async () => {
            try {
                const res = await SpaceConnector.client.spotAutomation.spotGroup.list({
                    query: {
                        only: ['spot_group_id'],
                    },
                });
                state.spotGroups = res.results.map(d => d.spot_group_id);
            } catch (e) {
                console.error(e);
            }
        };

        const apiQuery = new ApiQueryHelper();
        const getParams = () => {
            apiQuery.setPageStart(getPageStart(state.thisPage, state.pageSize))
                .setPageLimit(state.pageSize)
                .setFilters(queryHelper.filters);

            return {
                query: apiQuery.data,
            };
        };

        const getSpotGroupByProject = async (projectIds) => {
            try {
                const res = await SpaceConnector.client.statistics.topic.spotAutomationSpotGroupCount({
                    projects: projectIds,
                });
                Object.keys(state.items).forEach((i) => {
                    state.items[i].spotGroupCount = res.projects[state.items[i].project_id];
                });
            } catch (e) {
                console.error(e);
            }
        };
        const getInstanceByProject = async (projectIds) => {
            try {
                const res = await SpaceConnector.client.statistics.topic.spotAutomationInstanceCount({
                    projects: projectIds,
                });
                Object.keys(state.items).forEach((i) => {
                    state.items[i].instanceCount = res.projects[state.items[i].project_id].total;
                    state.items[i].spotCount = res.projects[state.items[i].project_id].spot;
                    state.items[i].onDemandCount = res.projects[state.items[i].project_id].ondemand;
                });
            } catch (e) {
                console.error(e);
            }
        };

        const getSavingCostResultByProject = async (projectIds) => {
            try {
                const res = await SpaceConnector.client.statistics.topic.spotAutomationSavingCost({
                    projects: projectIds,
                });
                Object.keys(state.items).forEach((i) => {
                    state.items[i].savingCost = (res.projects[state.items[i].project_id].saving_result).toLocaleString();
                });
            } catch (e) {
                console.error(e);
            }
        };

        const listProjects = async () => {
            state.dataLoading = true;
            try {
                const res = await SpaceConnector.client.identity.project.list(getParams());
                state.items = res.results;
                state.totalCount = res.total_count || 0;

                const projects = state.items?.map(item => item.project_id);
                await Promise.all([getSpotGroupByProject(projects), getInstanceByProject(projects), getSavingCostResultByProject(projects)]);
                state.dataLoading = false;
            } catch (e) {
                state.items = [];
                state.totalCount = 0;
                console.error(e);
            }
        };

        /* event */
        const changeQueryString = async (options) => {
            queryHelper.setFiltersAsQueryTag(options.queryTags);
            await replaceUrlQuery('filters', queryHelper.rawQueryStrings);
        };
        const onChange = async (options: any) => {
            if (options.queryTags !== undefined) {
                state.tags = options.queryTags;
                await changeQueryString(options);
            }
            if (options.pageLimit !== undefined) {
                state.pageSize = options.pageLimit;
            }
            if (options.pageStart !== undefined) {
                state.thisPage = getThisPage(options.pageStart, state.pageSize);
            }
            await listProjects();
        };

        (async () => {
            await Promise.all([
                listSpotGroups(),
                listProjects(),
                vm.$store.dispatch('resource/spotGroup/load'),
            ]);
        })();

        return {
            ...toRefs(state),
            routeState,
            onChange,
            numberFormatter,
            commaFormatter,
            AUTOMATION_ROUTE,
            PROJECT_ROUTE,
        };
    },
};
</script>

<style lang="postcss" scoped>
.dashboard-page-wrapper {
    @apply bg-secondary2;
    padding-top: 2rem;
    display: flex;
    flex-direction: column;
    height: 100%;

    @screen 3xl {
        @apply bg-white;
    }
}
.page-info {
    padding-left: 1.5rem;
}
.cost-instance-info {
    @apply text-gray-900;
    font-size: 0.75rem;
    line-height: 150%;
    margin-bottom: 0.5rem;
}
.dashboard-wrapper {
    @apply grid grid-cols-12 gap-4;
    padding-left: 1.5rem;
    padding-right: 1.5rem;

    @screen lg {
        grid-template-rows: auto;
        grid-template-columns: minmax(14.25rem, 3fr) minmax(auto, 6fr) minmax(14.25rem, 3fr);
        grid-template-areas: "spot-group chart cost";
    }

    .widget-layout {
        @apply bg-white border border-gray-200;
        padding: 1rem;
    }

    .spot-group-info {
        @apply col-span-12 row-start-1;

        @screen md {
            @apply col-span-6 row-start-1;
        }

        @screen lg {
            grid-area: spot-group;
        }

        .summary-wrapper {
            margin-bottom: 1rem;
            .summary-row {
                font-size: 0.875rem;
                line-height: 1.5;
                margin-bottom: 0.5rem;
                &:last-child {
                    margin-bottom: 0;
                }
                .title {
                    @apply text-gray-600;
                    font-size: 0.875rem;
                    margin: 0;
                }
                .sub-title {
                    @apply text-gray-400;
                    font-size: 0.75rem;
                    margin-left: 0.125rem;
                }
                .count {
                    font-weight: bold;
                    margin-left: 0.5rem;
                }
            }
        }
    }

    .instance-billing-chart {
        @apply col-span-12 row-start-3;

        @screen md {
            @apply col-span-12 row-start-2;
        }

        @screen lg {
            @apply row-start-1;
            grid-area: chart;
        }
    }

    .cost-info {
        @apply col-span-12 row-start-2;

        @screen md {
            @apply col-span-6 row-start-1;
        }

        @screen lg {
            @apply row-start-1;
            grid-area: cost;
        }
    }
}

.dashboard-divider {
    @apply w-full;
    margin-top: 2rem;
}

.project-wrapper {
    @apply bg-white;
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: 2rem 1.5rem;
    .project-instance-info {
        @apply text-gray-900;
        font-size: 1.5rem;
        line-height: 135%;
        margin-bottom: 1.5rem;
        .total-count {
            @apply text-gray-500;
            font-size: 1.125rem;
            line-height: 135%;
        }
    }
}
.project-name-wrapper {
    .project-name {
        @apply text-gray-900 font-bold;
        margin-top: 0.25rem;
        font-size: 1.125rem;
        line-height: 155%;
    }
    .divider {
        @apply inline-block text-gray-200;
        height: 1rem;
        border-left-width: 1px;
        margin-left: 0.2rem;
        margin-right: 0.2rem;
        vertical-align: middle;
    }

    .spot-group-text {
        font-size: 0.75rem;
    }
}
.project-card-list {
    @apply grid w-full;
    grid-template-columns: repeat(auto-fill, minmax(24.4rem, 1fr));
    gap: 1rem;
    overflow-y: hidden;
}

.project-item {
    @apply bg-white border border-gray-200;
    height: 12.25rem;
    filter: drop-shadow(0 2px 4px rgba(theme('colors.black'), 0.06));
    border-radius: 0.25rem;
    padding: 2rem 4rem 2rem 1.5rem;
}

.project-group-name {
    @apply text-gray-500;
    font-size: 0.75rem;
    line-height: 130%;
}

.cost-chart-wrapper {
    @apply flex;
    padding-top: 1.5rem;
    width: 100%;
    .cost-title {
        @apply text-gray-600;
        font-size: 0.75rem;
        line-height: 170%;
    }
    .cost {
        @apply text-indigo-400;
        font-size: 1.25rem;
        line-height: 100%;
        margin-top: 0.5rem;
    }
}

.chart-wrapper {
    width: 50%;
    display: flex;
    flex-direction: column;
    .instance {
        @apply text-gray-600;
        font-size: 0.75rem;
        line-height: 150%;

        .instance-num {
            @apply text-gray-900 font-bold;
        }
    }

    .on-demand-chart {
        margin-top: 0.625rem;
    }
}
.go-add {
    @apply text-secondary;
    font-size: 0.75rem;
    margin-top: 2rem;
}

.no-project {
  display: flex;
  flex-direction: column;
  .no-project-text {
    @apply text-primary2;
    font-size: 1rem;
    line-height: 160%;
    margin-top: 0.5rem;
    margin-bottom: 1rem;
  }
  .no-project-btn {
    @apply rounded;
    height: 2rem;
    width: 8.187rem;
    align-self: center;
    padding: 1rem;
  }
}

</style>
