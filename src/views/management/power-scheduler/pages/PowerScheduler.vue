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
                card-height="16.8rem"
                @change="onChange"
                @refresh="onChange"
            >
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
                    </div>
                    <p-hr />
                </template>
            </p-search-grid-layout>
        </div>
    </general-page-layout>
</template>

<script lang="ts">
import PSearchGridLayout from '@/components/organisms/layouts/search-grid-layout/PSearchGridLayout.vue';
import GeneralPageLayout from '@/views/containers/page-layout/GeneralPageLayout.vue';
import PPageNavigation from '@/components/molecules/page-navigation/PPageNavigation.vue';
import PHr from '@/components/atoms/hr/PHr.vue';
import PPageTitle from '@/components/organisms/title/page-title/PPageTitle.vue';
import {
    ComponentRenderProxy, getCurrentInstance, reactive, toRefs,
} from '@vue/composition-api';
import { QueryHelper, SpaceConnector } from '@/lib/space-connector';
import { KeyItem } from '@/components/organisms/search/query-search/type';
import { makeQuerySearchHandlersWithSearchSchema } from '@/lib/component-utils/query-search';
import router from '@/routes';
import { QueryTag } from '@/components/organisms/search/query-search-tags/PQuerySearchTags.toolset';
import { getFiltersFromQueryTags, parseTag } from '@/lib/api/query-search';
import { getPageStart } from '@/lib/component-utils/pagination';

type UrlQueryString = string | (string | null)[] | null | undefined;

export default {
    name: 'PowerScheduler',
    components: {
        PPageTitle, PHr, PPageNavigation, GeneralPageLayout, PSearchGridLayout,
    },
    setup(props, context) {
        const vm = getCurrentInstance() as ComponentRenderProxy;

        /**
         * Handlers for query search
         * */
        const handlers = makeQuerySearchHandlersWithSearchSchema(
            {
                title: 'Properties',
                items: [
                    { key: 'cloud_service_type', name: 'Cloud Service Type' },
                    { key: 'cloud_service_group', name: 'Cloud Service Group' },
                    { key: 'project_id', name: 'Project', reference: 'identity.Project' },
                    { key: 'collection_info.service_accounts', name: 'Service Account', reference: 'identity.ServiceAccount' },
                    { key: 'collection_info.secrets', name: 'Secret', reference: 'secret.Secret' },
                ],
            },
            'inventory.CloudService',
        );

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
            const { and, or } = getFiltersFromQueryTags(state.tags);
            const query = new QueryHelper();
            query
                .setPageStart(getPageStart(state.thisPage, state.pageSize))
                .setPageLimit(state.pageSize)
                .setKeyword(...or)
                .setFilter(...and);

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
            state.tags = urlQueryStringToSearchTags(vm.$route.query.f);
        };
        const changeQueryString = async (options) => {
            const urlQueryString = searchTagsToUrlQueryString(options.queryTags);
            const newQuery = {
                f: urlQueryString,
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
        @apply mx-4 mt-6;

        .project {
            @apply mb-4;

            .project-group-name {
                @apply text-gray-500 text-xs;
            }

            #project-name {
                @apply text-lg font-bold truncate pb-6 overflow-hidden;
            }
        }
    }
</style>
