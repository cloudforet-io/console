<template>
    <general-page-layout class="power-scheduler">
        <div class="page-navigation">
            <p-page-navigation :routes="route" />
        </div>
        <div class="page-title">
            <p-page-title :title="'Power Scheduler'" :total-count="totalCount">
                <template #extra>
                    <p class="h-1"></p>
                    <span id="current-date">업데이트 {{ currentDate }} (Local Time) </span>
                </template>
            </p-page-title>
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
                :key-items="keyItems"
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
                <template #card="{item, index}">
                    <router-link :to="goToDetail(item)">
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
                                    <p>Scheduled Resources</p>
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
                                        Saving of This Month
                                    </p>
                                    <p class="approximate">
                                        approx.
                                    </p>
                                    <span class="costs"><span>$ </span><span class="approx-costs">{{ approximateCosts }}</span></span>
                                </div>
                            </div>
                        </div>
                        <p-hr />
                        <div class="schedule">
                            <div>
                                <p class="mb-4">
                                    <span class="schedule-title">SCHEDULE
                                        <span v-if="item.scheduler.length < 4" class="schedule-title-num">({{ item.scheduler.length }})</span>
                                        <span v-else>(3+)</span>
                                    </span>
                                </p>
                                <div v-if="item.scheduler.length > 0">
                                    <p v-for="(schedule, idx) in item.scheduler.slice(0, 3)" :key="idx">
                                        <p-i name="ic_clock-history" height="0.75rem" width="0.75rem" /> <span class="scheduler-name"> {{ schedule.name }}</span>
                                    </p>
                                </div>
                                <div v-else>
                                    <p-i name="ic_plus"
                                         width=".75rem" height=".75rem"
                                         class="schedule-add-btn"
                                    /> <span class="schedule-add-text">Create Scheduler</span>
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
                    </router-link>
                </template>
            </p-search-grid-layout>
        </div>
    </general-page-layout>
</template>

<script lang="ts">
import {
    ComponentRenderProxy, computed, getCurrentInstance, reactive, toRefs,
} from '@vue/composition-api';

/* Components */
import GeneralPageLayout from '@/views/containers/page-layout/GeneralPageLayout.vue';
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
import { QueryHelper, SpaceConnector } from '@/lib/space-connector';
import { getFiltersFromQueryTags } from '@/lib/component-utils/query-search-tags';
import { getPageStart } from '@/lib/component-utils/pagination';
import dayjs from 'dayjs';
import { getTimezone } from '@/lib/util';

/* Types */
import { KeyItem } from '@/components/organisms/search/query-search/type';
import { queryStringToQueryTags, queryTagsToQueryString, replaceQuery } from '@/lib/router-query-string';
import { makeReferenceValueHandler } from '@/lib/component-utils/query-search';
import { Location } from 'vue-router';

interface Scheduler {
    name: string;
    rule: object;
    // eslint-disable-next-line camelcase
    schedule_id: string;
}
export default {
    name: 'PowerScheduler',
    components: {
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

        /**
         * Handlers for query search
         * */
        const handlers = {
            keyItems: [
                {
                    name: 'project_id',
                    label: 'Project',
                },
            ],
            valueHandlerMap: {
                // eslint-disable-next-line camelcase
                project_id: makeReferenceValueHandler('identity.Project'),
                // eslint-disable-next-line camelcase
            },
        };

        /** State : state for page (grid layout, query search, etc.)
         * */
        const state = reactive({
            items: [] as any,
            cardClass: () => ['card-item', 'power-scheduler-list'],
            loading: false,
            keyItems: handlers.keyItems as KeyItem[],
            valueHandlerMap: handlers.valueHandlerMap,
            tags: queryStringToQueryTags(vm.$route.query.filters, handlers.keyItems),
            thisPage: 1,
            pageSize: 12,
            totalCount: 0,
            approximateCosts: 0,
            scheduler: [] as unknown as Scheduler,
            weekday: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
            currentDate: dayjs().tz(getTimezone()).format('YYYY-MM-DD'),
        });

        /**
         * Page Navigation
         * */
        const routeState = reactive({
            route: [{ name: 'Automation', path: '/automation' }, { name: 'Power Scheduler', path: '/automation/power-scheduler' }],
        });

        /**
         * Search Query, Page parameter for API
         * */
        const getParams = () => {
            const { andFilters, orFilters, keywords } = getFiltersFromQueryTags(state.tags);
            const query = new QueryHelper()
                .setPageStart(getPageStart(state.thisPage, state.pageSize))
                .setPageLimit(state.pageSize)
                .setKeyword(...keywords)
                .setFilter(...andFilters)
                .setFilterOr(...orFilters);

            return {
                query: query.data,
            };
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
                        // eslint-disable-next-line camelcase
                        managed_count: 0,
                        // eslint-disable-next-line camelcase
                        total_count: 0,
                    },
                    scheduler: {
                        // eslint-disable-next-line camelcase
                        schedule_id: '',
                        name: '',
                        rule: [],
                    },
                }));
                await Promise.all([getScheduledResources(), getScheduleList()]);
                state.totalCount = res.total_count || 0;
                state.loading = false;
            } catch (e) {
                console.error(e);
            }
        };

        /**
         * Query String
         * */
        const changeQueryString = async (options) => {
            await replaceQuery('filters', queryTagsToQueryString(options.queryTags));
        };

        /**
         * Apply changed options in grid layout
         * */
        const onChange = async (options?: any) => {
            if (options) {
                state.tags = options.queryTags;
                state.pageSize = options.pageSize;
                state.thisPage = options.thisPage;
                await changeQueryString(options);
            }
            await listProjects();
        };


        /**
        *  Card Click Event
        * */
        const goToDetail = (item) => {
            const res: Location = {
                name: 'powerSchedulerDetail',
                params: {
                    projectId: item.project_id,
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
        }

        #current-date {
            font-size: 0.75rem;
            margin-left: 0.5rem;
        }

        >>> .power-scheduler-list {
            @apply border border-gray-200 rounded overflow-visible;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.06);

            &:hover {
                @apply border-gray-200 bg-blue-100;
                cursor: pointer;
            }
        }

        .project-description {
            @apply mx-6 mt-6 mb-6;

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
                }

                .approximate {
                    @apply text-gray-400 text-xs;
                }

                .costs {
                    @apply float-right;

                    .approx-costs {
                        @apply text-primary font-bold;
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

            .scheduler-name {
                @apply ml-1;
                font-size: 0.75rem;
            }

            .weekday {
                @apply text-gray-400 inline-block;
                font-size: 0.625rem;
                width: 1rem;
                height: 1rem;
                text-align: center;
            }

            .schedule-add-btn {
                @apply text-gray-900 w-6 h-6 bg-blue-100 rounded-full inline-block z-10;

                &:hover {
                    @apply bg-blue-300;
                }
            }

            .schedule-add-text {
                @apply text-gray-900;
                margin-left: 0.5rem;
                font-size: 0.75rem;
                line-height: 1.5;
            }
        }
    }
</style>
