<template>
    <general-page-layout class="power-scheduler">
        <div class="page-navigation">
            <p-page-navigation :routes="route" />
        </div>
        <div class="page-title">
            <p-page-title :title="$t('AUTOMATION.POWER_SCHEDULER.LANDING.TITLE')" :total-count="totalCount" />
        </div>
        <p-hr class="cloud-service-divider" />
        <div class="power-scheduler-project">
            <p-search-grid-layout
                :items="items"
                :card-class="cardClass"
                :loading="loading"
                :this-page.sync="thisPage"
                :page-size.sync="pageSize"
                :total-count="totalCount"
                :query-tags="tags"
                :key-item-sets="keyItemSets"
                :value-handler-map="valueHandlerMap"
                :pagination-values="[12, 24, 36]"
                card-height="18.25rem"
                card-min-width="25rem"
                @change="onChange"
                @refresh="onChange"
            >
                <template #toolbox-bottom>
                    <page-information />
                </template>
                <template #no-data>
                    <div v-if="!loading && totalCount === 0" class="text-center empty-project">
                        <img class="empty-project-img" src="@/assets/images/illust_satellite.svg">
                        <p class="text-primary2 mb-12">
                            {{ $t('AUTOMATION.POWER_SCHEDULER.LANDING.GO_TO_PROJECT_HINT_TEXT') }}
                        </p>
                        <router-link :to="`/project`">
                            <p-icon-text-button style-type="primary" name="ic_plus_bold"
                                                class="mx-auto text-center"
                            >
                                {{ $t('AUTOMATION.POWER_SCHEDULER.LANDING.GO_TO_PROJECT_BTN_TEXT') }}
                            </p-icon-text-button>
                        </router-link>
                    </div>
                </template>
                <template #card="{item, index}">
                    <router-link :to="goToDetail(item)">
                        <div class="h-full">
                            <div class="project-description">
                                <div class="project">
                                    <div class="project-group-name">
                                        {{ item.project_group_info.name }}
                                    </div>
                                    <p id="project-name">
                                        {{ item.name }}
                                    </p>
                                </div>
                                <div class="resources">
                                    <div class="scheduled-resources">
                                        <p>
                                            {{ $t('AUTOMATION.POWER_SCHEDULER.LANDING.APPLIED_RESOURCE') }} / <span v-tooltip.bottom="{content: tooltip.resource, delay: {show: 500}}">
                                                {{ $t('AUTOMATION.POWER_SCHEDULER.LANDING.APPLICABLE_RESOURCE') }}</span>
                                        </p>

                                        <span class="current-schedule-resources">{{ item.scheduledResources.managed_count }}</span>
                                        <span class="max-schedule-resources">/ {{ item.scheduledResources.total_count }}</span>
                                        <p-progress-bar
                                            :percentage="item.percentage"
                                            :style="'width: 160px'"
                                            class="pt-2"
                                        />
                                    </div>
                                    <div class="saving">
                                        <p class="saving-this-month">
                                            <span v-tooltip.bottom="{content: tooltip.cost, delay: {show: 500}}">
                                                {{ $t('AUTOMATION.POWER_SCHEDULER.LANDING.ESTIMATED_SAVING') }}
                                            </span>
                                        </p>
                                        <p class="approximate">
                                            {{ $t('AUTOMATION.POWER_SCHEDULER.LANDING.ABOUT') }}
                                        </p>
                                        <span class="costs"><span>$ </span><span class="approx-costs">{{ item.savingCost }}</span></span>
                                    </div>
                                </div>
                            </div>
                            <p-hr />
                            <div class="schedule" :class="{'no-schedule': item.scheduler.length === 0}">
                                <div class="scheduler-list-wrapper">
                                    <p v-if="item.scheduler.length > 0" class="mb-4">
                                        <span class="schedule-title">{{ $t('AUTOMATION.POWER_SCHEDULER.LANDING.SCHEDULE') }}
                                            <span v-if="item.scheduler.length < 4" class="schedule-title-num">({{ item.scheduler.length }})</span>
                                            <span v-else class="schedule-title-num">(+3)</span>
                                        </span>
                                    </p>
                                    <div v-if="item.scheduler.length > 0">
                                        <p v-for="(schedule, idx) in item.scheduler.slice(0, 3)" :key="idx">
                                            <router-link :to="goToDetail(item, schedule.schedule_id)" class="scheduler-list">
                                                <p-i v-if="schedule.desired_state === 'ON'" name="ic_power-on" height="0.75rem"
                                                     width="0.75rem" class="flex-shrink-0"
                                                />
                                                <p-i v-else name="ic_power-off" height="0.75rem"
                                                     width="0.75rem" class="flex-shrink-0"
                                                />
                                                <span class="scheduler-name" :class="{ 'schedule-on': schedule.desired_state === 'ON' }"> {{ schedule.name }}</span>
                                            </router-link>
                                        </p>
                                    </div>
                                    <div v-else>
                                        <div class="schedule-add-btn">
                                            <p-i name="ic_plus"
                                                 class="add-btn-icon"
                                                 width="0.875rem" height="0.875rem"
                                            />
                                        </div>
                                        <span class="schedule-add-text">
                                            {{ $t('AUTOMATION.POWER_SCHEDULER.LANDING.NEED_SCHEDULER_HINT_TEXT') }}
                                        </span>
                                    </div>
                                </div>
                                <div v-if="item.scheduler.length > 0" class="schedule-matrix">
                                    <div class="pl-1">
                                        <span v-for="(day, index) in weekday" :key="index">
                                            <p class="weekday">{{ day }}</p>
                                        </span>
                                    </div>
                                    <schedule-heatmap :schedule="item.scheduler.slice(0, 3)" />
                                </div>
                            </div>
                        </div>
                    </router-link>
                </template>
            </p-search-grid-layout>
        </div>
    </general-page-layout>
</template>

<script lang="ts">
/* eslint-disable camelcase */
import {
    ComponentRenderProxy, computed, getCurrentInstance, reactive, toRefs,
} from '@vue/composition-api';

/* Components */
import GeneralPageLayout from '@/views/common/components/page-layout/GeneralPageLayout.vue';
import PSearchGridLayout from '@/components/organisms/layouts/search-grid-layout/PSearchGridLayout.vue';
import PPageNavigation from '@/components/molecules/page-navigation/PPageNavigation.vue';
import PPageTitle from '@/components/organisms/title/page-title/PPageTitle.vue';
import PProgressBar from '@/components/molecules/progress-bar/PProgressBar.vue';
import PHr from '@/components/atoms/hr/PHr.vue';
import PI from '@/components/atoms/icons/PI.vue';

/* Page Modules */
import PageInformation from '@/views/automation/power-scheduler/modules/PageInformation.vue';
import ScheduleHeatmap from '@/views/automation/power-scheduler/modules/ScheduleHeatmap.vue';

/* Utils */
import { ApiQueryHelper, SpaceConnector } from '@/lib/space-connector';
import { getPageStart } from '@/lib/component-utils/pagination';
import dayjs from 'dayjs';
import { getTimezone } from '@/lib/util';

/* Types */
import { KeyItemSet } from '@/components/organisms/search/query-search/type';
import { replaceUrlQuery } from '@/lib/router-query-string';
import { makeReferenceValueHandler } from '@/lib/component-utils/query-search';
import { Location } from 'vue-router';
import PIconTextButton from '@/components/molecules/buttons/icon-text-button/PIconTextButton.vue';
import { QueryHelper } from '@/lib/query';

interface Scheduler {
    name: string;
    rule: object;
    schedule_id: string;
    desired_state: string;
}
export default {
    name: 'PowerScheduler',
    components: {
        PIconTextButton,
        ScheduleHeatmap,
        PI,
        PageInformation,
        PProgressBar,
        PPageTitle,
        PHr,
        PPageNavigation,
        GeneralPageLayout,
        PSearchGridLayout,
    },
    setup(props, context) {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const queryStore = new QueryHelper().setFiltersAsRawQueryString(vm.$route.query.filters);

        /**
         * Handlers for query search
         * */
        const handlers = {
            keyItemSets: [
                {
                    title: 'Filters',
                    items: [{
                        name: 'project_id',
                        label: 'Project',
                    }],
                },
            ],
            valueHandlerMap: {
                project_id: makeReferenceValueHandler('identity.Project'),
            },
        };

        /** State : state for page (grid layout, query search, etc.)
         * */
        const state = reactive({
            items: [] as any,
            cardClass: () => ['card-item', 'power-scheduler-list'],
            loading: false,
            keyItemSets: handlers.keyItemSets as KeyItemSet[],
            valueHandlerMap: handlers.valueHandlerMap,
            tags: queryStore.setKeyItemSets(handlers.keyItemSets).queryTags,
            thisPage: 1,
            pageSize: 12,
            totalCount: 0,
            scheduler: [] as unknown as Scheduler,
            weekday: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
            currentDate: dayjs().tz(getTimezone()).format('YYYY-MM-DD'),
            tooltip: computed(() => ({
                resource: `${vm.$t('AUTOMATION.POWER_SCHEDULER.LANDING.TOOLTIP_RESOURCE')} <br>
                                [ALL] Server <br>
                                [AWS] RDS <br>
                                [AWS] Auto Scaling Group`,
                cost: `${vm.$t('AUTOMATION.POWER_SCHEDULER.LANDING.TOOLTIP_COST_1')} <br>${vm.$t('AUTOMATION.POWER_SCHEDULER.LANDING.TOOLTIP_COST_2')}`,
            })),
        });

        /**
         * Page Navigation
         * */
        const routeState = reactive({
            route: computed(() => ([
                { name: vm.$t('MENU.AUTOMATION.AUTOMATION'), path: '/automation' },
                { name: vm.$t('MENU.AUTOMATION.POWER_SCHEDULER'), path: '/automation/power-scheduler' },
            ])),
        });

        /**
         * Search Query, Page parameter for API
         * */
        const apiQuery = new ApiQueryHelper();
        const getParams = () => {
            const { filter, keyword } = queryStore.apiQuery;
            apiQuery.setPageStart(getPageStart(state.thisPage, state.pageSize))
                .setPageLimit(state.pageSize)
                .setKeyword(keyword)
                .setApiFilter(...filter);

            return {
                query: apiQuery.data,
            };
        };

        const getSavingCost = async () => {
            try {
                const res = await SpaceConnector.client.statistics.topic.powerSchedulerSavingCost({ projects: state.items.map(d => d.project_id) }, {
                    MOCK_MODE: true,
                });
                for (let i = 0; i < Object.keys(state.items).length; i++) {
                    state.items[i].savingCost = (res.projects[state.items[i].project_id].saving_cost).toLocaleString();
                }
            } catch (e) {
                console.error(e);
            }
        };

        const getScheduledResources = async () => {
            try {
                const res = await SpaceConnector.client.statistics.topic.powerSchedulerResources({ projects: state.items.map(d => d.project_id) });
                for (let i = 0; i < Object.keys(state.items).length; i++) {
                    state.items[i].scheduledResources = res.projects[state.items[i].project_id];
                    state.items[i].percentage = (computed(() => (state.items[i].scheduledResources.managed_count / state.items[i].scheduledResources.total_count) * 100)).value;
                }
            } catch (e) {
                console.error(e);
            }
        };

        const getScheduleList = async () => {
            try {
                const res = await SpaceConnector.client.statistics.topic.powerSchedulerSchedules({ projects: state.items.map(d => d.project_id) });
                for (let i = 0; i < Object.keys(state.items).length; i++) {
                    state.items[i].scheduler = res.projects[state.items[i].project_id];
                }
            } catch (e) {
                console.error(e);
            }
        };

        const listProjects = async () => {
            state.loading = true;
            try {
                const res = await SpaceConnector.client.identity.project.list(getParams());
                state.items = res.results.map(d => ({
                    ...d,
                    scheduledResources: {
                        managed_count: 0,
                        total_count: 0,
                    },
                    scheduler: {
                        schedule_id: '',
                        name: '',
                        rule: [],
                    },
                }));
                await Promise.all([getScheduledResources(), getScheduleList(), getSavingCost()]);
                state.totalCount = res.total_count || 0;
                state.loading = false;
            } catch (e) {
                console.error(e);
            }
        };

        /**
         * Query String
         * */
        const changeQueryString = (options) => {
            queryStore.setFiltersAsQueryTag(options.queryTags);
            replaceUrlQuery('filters', queryStore.rawQueryStrings);
        };

        /**
         * Apply changed options in grid layout
         * */
        const onChange = async (options?: any) => {
            if (options) {
                state.tags = options.queryTags;
                state.pageSize = options.pageSize;
                state.thisPage = options.thisPage;
                changeQueryString(options);
            }
            await listProjects();
        };


        /**
        *  Card Click Event
        * */
        const goToDetail = (item, scheduleId) => {
            const res: Location = {
                name: 'powerScheduler',
                params: {
                    projectId: item.project_id,
                    scheduleId,
                },
            };
            return res;
        };

        /**
         * Init logic
         * */
        const init = () => {
            listProjects();
        };

        init();

        return {
            ...toRefs(state),
            ...toRefs(routeState),
            listProjects,
            onChange,
            goToDetail,
        };
    },
};
</script>

<style lang="postcss" scoped>
.power-scheduler {
    .power-scheduler-project {
        margin-top: 1.5rem;
        .empty-project {
            @apply w-full h-full;
            .empty-project-img {
                @apply w-48 mx-auto pt-19 mb-8;
            }
        }
    }

    #current-date {
        font-size: 0.75rem;
        margin-left: 0.5rem;
    }

    >>> .power-scheduler-list {
        @apply border border-gray-200 rounded;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.06);

        &:hover {
            @apply border-gray-200 bg-blue-100;
            cursor: pointer;
        }
    }

    >>> .loading-spinner {
        width: 100%;
    }

    .project-description {
        @apply px-6 pt-6 pb-6;

        .project {
            .project-group-name {
                @apply text-gray-500 text-xs;
            }

            #project-name {
                @apply text-lg font-bold truncate pb-6 overflow-hidden;
            }
        }
    }

    .resources {
        @apply flex justify-between;

        .scheduled-resources {
            p {
                @apply mb-1 text-xs;
            }

            .current-schedule-resources {
                @apply font-bold text-primary text-xs;
            }

            .max-schedule-resources {
                @apply text-gray-400 text-xs;
            }
        }

        .saving {
            .saving-this-month {
                @apply mb-1 text-xs;
                margin-right: 4.75rem;
            }

            .approximate {
                @apply text-gray-400 text-xs;
            }

            .costs {
                @apply float-right;

                .approx-costs {
                    @apply text-primary font-bold;
                    font-size: 1.25rem;
                }
            }
        }
    }

    .schedule {
        @apply ml-6 mr-5 mt-6 mb-6 flex justify-between;

        .schedule-title {
            @apply font-bold text-gray-400 text-xs;

            .schedule-title-num {
                @apply font-normal;
            }
        }

        .scheduler-list-wrapper {
            max-width: 70%;
            .scheduler-list {
                @apply flex mb-2 w-full overflow-x-hidden;

                .p-i {
                    flex-shrink: 0;
                }

                .scheduler-name {
                    @apply ml-1 truncate;
                    flex-grow: 1;
                    font-size: 0.75rem;
                    line-height: 1.2;

                    &.schedule-on {
                        @apply text-green-500;
                    }
                }
            }
        }

        .schedule-matrix {
            white-space: nowrap;
        }

        .weekday {
            @apply text-gray-400 inline-block;
            font-size: 0.625rem;
            width: 1rem;
            height: 1rem;
            text-align: center;
        }

        .schedule-add-btn {
            @apply border border-gray-900 rounded-full inline-block z-10;
            width: 1.25rem;
            height: 1.25rem;
            .add-btn-icon {
                @apply text-gray-900;
                margin-left: 0.125rem;
                margin-bottom: 0.0625rem;
            }
        }

        .schedule-add-text {
            @apply text-gray-900;
            margin-left: 0.5rem;
            font-size: 0.875rem;
            line-height: 1.5;
        }
        &.no-schedule {
            @apply ml-6 mr-5 mb-6 flex justify-center;
            margin-top: 3.625rem;
        }
    }
}
</style>
