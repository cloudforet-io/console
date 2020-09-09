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
                <template #card="{item}">
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
                                <span class="current-schedule-resources">{{ currentScheduleResources }}</span>
                                <span class="max-schedule-resources">/ {{ maxScheduleResources }}</span>
                                <p-progress-bar
                                    :percentage="percentage"
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
                                <span class="schedule-title">SCHEDULE  <span class="schedule-title-num">(2)</span></span>
                            </p>
                            <div>
                                <p-i name="ic_clock-history" height="0.75rem" width="0.75rem" /> <span class="scheduler-name">Korea_DEVScheduler</span><br>
                                <p-i name="ic_clock-history" height="0.75rem" width="0.75rem" /> <span class="scheduler-name">Korea_DEVScheduler</span><br>
                            </div>
                        </div>
                        <div>
                            <span v-for="(day, index) in weekday" :key="index" class="weekday">
                                {{ day }}
                            </span>
                            <div class="schedule-matrix mt-4">
                                <schedule-heatmap />
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
import { makeQuerySearchPropsWithSearchSchema } from '@/lib/component-utils/dynamic-layout';
import { getFiltersFromQueryTags, parseTag } from '@/lib/api/query-search';
import { getPageStart } from '@/lib/component-utils/pagination';

/* Types */
import { KeyItem } from '@/components/organisms/search/query-search/type';
import { QueryTag } from '@/components/organisms/search/query-search-tags/type';

type UrlQueryString = string | (string | null)[] | null | undefined;
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
        const handlers = makeQuerySearchPropsWithSearchSchema(
            {
                title: 'Properties',
                items: [
                    { key: 'project_id', name: 'Project', reference: 'identity.Project' },
                ],
            },
            'identity.Project',
        );

        /** State : state for page (grid layout, query search, etc.)
         *  scheduleState: state for scheduled resources (number, progress, money, scheduler..)
         * */
        const state = reactive({
            items: [],
            cardClass: () => ['card-item', 'power-scheduler-list'],
            loading: false,
            keyItems: handlers.keyItems as KeyItem[],
            valueHandlerMap: handlers.valueHandlerMap,
            tags: [],
            thisPage: 1,
            pageSize: 24,
            totalCount: 0,
        });

        const scheduleState = reactive({
            currentScheduleResources: Math.floor(Math.random() * 50),
            maxScheduleResources: 50,
            approximateCosts: Math.floor(Math.random() * 5000),
            scheduler: [] as unknown as Scheduler,
            weekday: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
        });

        const percentage = computed(() => (scheduleState.currentScheduleResources / scheduleState.maxScheduleResources) * 100);


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
        const listProjects = async () => {
            state.loading = true;
            try {
                const res = await SpaceConnector.client.identity.project.list(getParams());
                state.items = res.results;
                state.totalCount = res.total_count || 0;
                state.loading = false;
            } catch (e) {
                console.error(e);
            }
        };

        /**
         * Query String
         * */
        const searchTagsToUrlQueryString = (tags: QueryTag[]): UrlQueryString => {
            if (Array.isArray(tags)) {
                return tags.map((tag) => {
                    let item;
                    if (tag.key) item = `${tag.key.name}:${tag.operator}${tag.value?.name}`;
                    else item = `${tag.value?.name}`;
                    return item;
                });
            }
            return null;
        };
        const urlQueryStringToSearchTags = (urlQueryString: UrlQueryString): QueryTag[] => {
            if (!urlQueryString) return [];
            if (Array.isArray(urlQueryString)) {
                return urlQueryString.reduce((res, qs) => {
                    if (qs) res.push(parseTag(qs));
                    return res;
                }, [] as QueryTag[]);
            }
            return [parseTag(urlQueryString as string)];
        };
        const setSearchTags = () => {
            // @ts-ignore
            state.tags = urlQueryStringToSearchTags(vm.$route.query.filters);
        };
        const changeQueryString = async (options) => {
            const urlQueryString = searchTagsToUrlQueryString(options.queryTags);
            const newQuery = {
                filters: urlQueryString,
            };
            // eslint-disable-next-line no-empty-function
            await vm.$router.replace({ query: { ...router.currentRoute.query, ...newQuery } }).catch(() => {
            });
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
            setSearchTags();
            listProjects();
        };

        init();

        return {
            ...toRefs(state),
            ...toRefs(routeState),
            ...toRefs(scheduleState),
            percentage,
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
    }
</style>
