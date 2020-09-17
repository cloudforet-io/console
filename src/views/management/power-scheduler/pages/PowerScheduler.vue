<template>
    <general-page-layout>
        <div class="page-navigation">
            <p-page-navigation :routes="route" />
        </div>
        <p-page-title :title="'Power Scheduler'" use-total-count :total-count="totalCount"
                      class="page-title"
        />
        <p-hr class="cloud-service-divider" />
        <div class="power-scheduler">
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
                card-height="18.25rem"
                card-min-width="25rem"
                @change="onChange"
                @refresh="onChange"
            >
                <template #toolbox-bottom>
                    <page-information />
                </template>
                <template #card="{item, index}">
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
                                <span class="current-schedule-resources">{{ scheduledResources[index].managed_count }}</span>
                                <span class="max-schedule-resources">/ {{ scheduledResources[index].total_count }}</span>
                                <p-progress-bar
                                    :percentage="percentage[index].value"
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
                                <span class="costs"><span class="approx-costs">{{ approximateCosts }}</span> <span>$</span></span>
                            </div>
                        </div>
                    </div>
                    <p-hr />
                    <div class="schedule">
                        <div>
                            <p class="mb-4">
                                <span class="schedule-title">SCHEDULE
                                    <span v-if="scheduler[index].length < 4" class="schedule-title-num">({{ scheduler[index].length }})</span>
                                    <span v-else>(3+)</span>
                                </span>
                            </p>
                            <div v-if="scheduler[index].length > 0">
                                <div v-for="(schedule, idx) in scheduler[index]" :key="idx">
                                    <p-i name="ic_clock-history" height="0.75rem" width="0.75rem" /> <span class="scheduler-name"> {{ schedule.name }}</span><br>
                                </div>
                            </div>
                            <div v-else>
                                <p-i name="ic_plus"
                                     width=".75rem" height=".75rem"
                                     class="schedule-add-btn"
                                /> <span class="schedule-add-text">Create Scheduler</span>
                            </div>
                        </div>
                        <div v-if="scheduler[index].length > 0">
                            <span v-for="(day, index) in weekday" :key="index" class="weekday">
                                {{ day }}
                            </span>
                            <div class="schedule-matrix mt-4">
                                <schedule-heatmap :schedule="scheduler[index]" />
                            </div>
                        </div>
                    </div>
                </template>
            </p-search-grid-layout>
        </div>
    </general-page-layout>
</template>

<script lang="ts">
import {
    ComponentRenderProxy, computed, getCurrentInstance, reactive, toRefs,
} from '@vue/composition-api';
import router from '@/routes';

/* Components */
import GeneralPageLayout from '@/views/containers/page-layout/GeneralPageLayout.vue';
import PSearchGridLayout from '@/components/organisms/layouts/search-grid-layout/PSearchGridLayout.vue';
import PPageNavigation from '@/components/molecules/page-navigation/PPageNavigation.vue';
import PPageTitle from '@/components/organisms/title/page-title/PPageTitle.vue';
import PProgressBar from '@/components/molecules/progress-bar/PProgressBar.vue';
import PHr from '@/components/atoms/hr/PHr.vue';
import PI from '@/components/atoms/icons/PI.vue';

/* Page Modules */
import PageInformation from '@/views/management/power-scheduler/modules/PageInformation.vue';
import ScheduleHeatmap from '@/views/management/power-scheduler/modules/ScheduleHeatmap.vue';

/* Utils */
import { QueryHelper, SpaceConnector } from '@/lib/space-connector';
import { getFiltersFromQueryTags } from '@/lib/api/query-search';
import { getPageStart } from '@/lib/component-utils/pagination';

/* Types */
import { KeyItem } from '@/components/organisms/search/query-search/type';
import { queryStringToQueryTags, queryTagsToQueryString, replaceQuery } from '@/lib/router-query-string';
import { makeReferenceValueHandler } from '@/lib/component-utils/query-search';

interface Scheduler {
    name: string;
    heatMap: unknown;
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
                {
                    name: 'schedule_id',
                    label: 'Schedule',
                },
            ],
            valueHandlerMap: {
                project_id: makeReferenceValueHandler('identity.Project'),
                schedule_id: makeReferenceValueHandler('power_scheduler.Schedule'),
            },
        };

        /** State : state for page (grid layout, query search, etc.)
         *  scheduleState: state for scheduled resources (number, progress, money, scheduler..)
         * */
        const state = reactive({
            items: [] as any,
            cardClass: () => ['card-item', 'power-scheduler-list'],
            loading: false,
            keyItems: handlers.keyItems as KeyItem[],
            valueHandlerMap: handlers.valueHandlerMap,
            tags: queryStringToQueryTags(vm.$route.query.filters, handlers.keyItems),
            thisPage: 1,
            pageSize: 24,
            totalCount: 0,
            projectIdList: [] as string[],
        });

        const scheduleState = reactive({
            scheduledResources: [] as any,
            approximateCosts: 0,
            percentage: [] as any,
            scheduler: [] as unknown as Scheduler,
            weekday: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
        });

        /**
         * Page Navigation
         * */
        const routeState = reactive({
            route: [{ name: 'Management', path: '/management' }, { name: 'Power Scheduler', path: '/management/power-scheduler' }],
        });

        /**
         * Search Query, Page parameter for API
         * */
        const getParams = () => {
            const { andFilters, orFilters, keywords } = getFiltersFromQueryTags(state.tags);
            const query = new QueryHelper();
            query
                .setPageStart(getPageStart(state.thisPage, state.pageSize))
                .setPageLimit(state.pageSize)
                .setKeyword(...keywords)
                .setFilter(...andFilters)
                .setFilterOr(...orFilters);

            return {
                query: query.data,
            };
        };

        const getProjects = async (items) => {
            try {
                await state.projectIdList.push(items.map(d => d.project_id));
            } catch (e) {
                console.error(e);
            }
            return state.projectIdList;
        };

        const getScheduledResources = async () => {
            try {
                const res = await SpaceConnector.client.statistics.topic.powerSchedulerResources({ projects: state.projectIdList[0] },
                    {
                        headers: {
                            'Mock-Mode': 'true',
                        },
                    });
                for (let i = 0; i < state.items.length; i++) {
                    scheduleState.scheduledResources[i] = res.projects[state.items[i].project_id];
                    scheduleState.percentage[i] = computed(() => (scheduleState.scheduledResources[i].managed_count / scheduleState.scheduledResources[i].total_count) * 100);
                }
            } catch (e) {
                console.error(e);
            }
        };

        const getScheduleList = async () => {
            try {
                const res = await SpaceConnector.client.statistics.topic.powerSchedulerSchedules({ projects: state.projectIdList[0] },
                    {
                        headers: {
                            'Mock-Mode': 'true',
                        },
                    });
                for (let i = 0; i < state.items.length; i++) {
                    scheduleState.scheduler[i] = res.projects[state.items[i].project_id];
                }
            } catch (e) {
                console.error(e);
            }
        };

        const listProjects = async () => {
            state.loading = true;
            try {
                const res = await SpaceConnector.client.identity.project.list(getParams());
                state.items = res.results;
                state.totalCount = res.total_count || 0;
                await getProjects(res.results);
                await Promise.all([getScheduledResources(), getScheduleList()]);
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
         * Init logic
         * */
        const init = () => {
            listProjects();
        };

        init();

        return {
            ...toRefs(state),
            ...toRefs(routeState),
            ...toRefs(scheduleState),
            listProjects,
            onChange,
        };
    },
};
</script>

<style lang="postcss" scoped>
    .power-scheduler {
        margin-top: 1.5rem;
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
        @apply mx-6 mt-6 mb-6 flex justify-between;
        .schedule-title {
            @apply font-bold text-gray-400 text-xs;
            .schedule-title-num {
                @apply font-normal;
            }
        }
        .scheduler-name {
            @apply ml-1 text-xs;
        }
        .weekday {
            @apply text-gray-400 text-xs;
            margin-right: 0.5625rem;
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
</style>
