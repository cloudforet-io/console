<template>
    <div class="all-dashboards-page">
        <p-page-title :title="'Dashboards'"
                      use-total-count
        >
            <template #extra>
                <p-button icon-left="ic_plus"
                          @click="handleCreateDashboard"
                >
                    <!--song lang-->
                    Create
                </p-button>
            </template>
        </p-page-title>
        <p-divider class="dashboards-divider" />
        <all-dashboards-select-filter />
        <p-toolbox filters-visible
                   search-type="query"
                   :pagination-visible="false"
                   :page-size-changeable="false"
                   :refreshable="false"
                   :key-item-sets="queryState.keyItemSets"
                   :value-handler-map="queryState.valueHandlerMap"
                   :query-tags="queryState.queryTags"
                   @change="handleQueryChange"
                   @refresh="handleQueryChange()"
        />
        <div class="dashboard-list-wrapper">
            <!--song-lang-->
            <dashboard-board-list v-if="scopeStatus !== SCOPE_TYPE.PROJECT"
                                  :scope-type="SCOPE_TYPE.DOMAIN"
                                  class="dashboard-list"
                                  :field-title="'Entire Workspace'"
                                  :dashboard-list="workspaceDashboardList"
            />
            <!--song-lang-->
            <dashboard-board-list v-if="scopeStatus !== SCOPE_TYPE.DOMAIN"
                                  :scope-type="SCOPE_TYPE.PROJECT"
                                  class="dashboard-list"
                                  :field-title="'Single Project'"
                                  :dashboard-list="projectDashboardList"
            />
        </div>
    </div>
</template>

<script lang="ts">
import {
    computed, onUnmounted,
    reactive, toRefs, watch,
} from 'vue';

import {
    PPageTitle, PDivider, PButton, PToolbox,
} from '@spaceone/design-system';
import type { ToolboxOptions } from '@spaceone/design-system/dist/src/navigation/toolbox/type';

import type { KeyItemSet, ValueHandlerMap } from '@cloudforet/core-lib/component-util/query-search/type';
import { QueryHelper } from '@cloudforet/core-lib/query';

import { SpaceRouter } from '@/router';
import { store } from '@/store';

import { primitiveToQueryString, queryStringToString, replaceUrlQuery } from '@/lib/router-query-string';

import AllDashboardsSelectFilter from '@/services/dashboards/all-dashboards/modules/AllDashboardsSelectFilter.vue';
import DashboardBoardList from '@/services/dashboards/all-dashboards/modules/DashboardBoardList.vue';
import { SCOPE_TYPE } from '@/services/dashboards/all-dashboards/type';
import { DASHBOARDS_ROUTE } from '@/services/dashboards/route-config';

export default {
    name: 'AllDashboardsPage',
    components: {
        PToolbox,
        DashboardBoardList,
        AllDashboardsSelectFilter,
        PButton,
        PPageTitle,
        PDivider,
    },
    setup() {
        const state = reactive({
            keyword: '',
            queryForSearch: {},
            viewersStatus: computed(() => store.state.dashboard.viewers),
            scopeStatus: computed(() => store.state.dashboard.scope),
            workspaceDashboardList: computed(() => store.state.dashboard.domainItems),
            projectDashboardList: computed(() => store.state.dashboard.projectItems),
        });

        const searchQueryHelper = new QueryHelper();
        const queryState = reactive({
            searchFilters: computed(() => store.state.dashboard.searchFilters),
            urlQueryString: computed(() => ({
                viewers: store.state.dashboard.viewers === 'ALL' ? null : primitiveToQueryString(store.state.dashboard.viewers),
                scope: store.state.dashboard.scope === 'ALL' ? null : primitiveToQueryString(store.state.dashboard.scope),
                filters: searchQueryHelper.setFilters(queryState.searchFilters).rawQueryStrings,
            })),
            keyItemSets: computed<KeyItemSet[]>(() => [{
                title: 'Properties',
                items: [
                    { name: 'label', label: 'Label' },
                ],
            }]),
            valueHandlerMap: computed(() => ({
                /* TODO: Apply ADD_ONS API */
                // label: makeReferenceValueHandler('dashboard.ProjectDashboard'),
            } as ValueHandlerMap)),
            queryTags: computed(() => searchQueryHelper.setKeyItemSets(queryState.keyItemSets).setFilters(store.state.dashboard.searchFilters).queryTags),
        });

        const handleCreateDashboard = () => { SpaceRouter.router.push({ name: DASHBOARDS_ROUTE.CREATE._NAME }); };
        const handleQueryChange = (options: ToolboxOptions = {}) => {
            if (options.queryTags !== undefined) {
                searchQueryHelper.setKeyItemSets(queryState.keyItemSets).setFiltersAsQueryTag(options.queryTags);
                store.dispatch('dashboard/setSearchFilters', searchQueryHelper.filters);
            }
        };


        /* init */
        let urlQueryStringWatcherStop;
        const init = async () => {
            const currentQuery = SpaceRouter.router.currentRoute.query;
            const useQueryValue = {
                viewers: queryStringToString(currentQuery.viewers) ?? 'ALL',
                scope: queryStringToString(currentQuery.scope) ?? 'ALL',
                filters: searchQueryHelper.setKeyItemSets(queryState.keyItemSets).setFiltersAsRawQueryString(currentQuery.filters).filters,
            };

            /* TODO: init states from url query */
            // store.dispatch('dashboard/loadDomainDashboard');
            store.dispatch('dashboard/setSelectedViewers', useQueryValue.viewers);
            store.dispatch('dashboard/setSelectedScope', useQueryValue.scope);
            store.dispatch('dashboard/setSearchFilters', searchQueryHelper.filters);

            /* TODO: implementation */
            urlQueryStringWatcherStop = watch(() => queryState.urlQueryString, (urlQueryString) => {
                replaceUrlQuery(urlQueryString);
            });
        };

        (async () => {
            await init();
        })();

        onUnmounted(() => {
            // urlQueryString watcher is referencing dashboardStore which is destroyed on unmounted. so urlQueryString watcher must be destroyed on unmounted too.
            if (urlQueryStringWatcherStop) urlQueryStringWatcherStop();
        });

        return {
            ...toRefs(state),
            handleCreateDashboard,
            handleQueryChange,
            queryState,
            SCOPE_TYPE,
        };
    },
};
</script>

<style lang="postcss" scoped>
.all-dashboards-page {
    .dashboard-list-wrapper {
        @apply flex;
        padding-top: 0.5rem;
        gap: 0.5rem;

        .dashboard-list {
            flex-grow: 1;
        }
    }

    @screen tablet {
        .dashboard-list-wrapper {
            display: block;
        }
    }
}
</style>
