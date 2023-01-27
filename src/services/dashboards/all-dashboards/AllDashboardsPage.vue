<template>
    <div class="all-dashboards-page">
        <p-page-title :title="$t('DASHBOARDS.ALL_DASHBOARDS.DASHBOARDS_TITLE')"
                      use-total-count
                      :total-count="dashboardTotalCount"
        >
            <template #extra>
                <p-button v-if="!hasOnlyViewPermission && (workspaceDashboardList || projectDashboardList)"
                          icon-left="ic_plus"
                          @click="handleCreateDashboard"
                >
                    {{ $t('DASHBOARDS.ALL_DASHBOARDS.CREATE') }}
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
        <p-data-loader :loading="loading"
                       :data="filteredDashboardStatus"
                       class="dashboard-list-wrapper"
        >
            <template #no-data>
                <div class="empty-case">
                    <img class="empty-image"
                         src="@/assets/images/illust_jellyocto-with-a-telescope.svg"
                    >
                    <p-empty class="empty-text">
                        {{ $t('DASHBOARDS.ALL_DASHBOARDS.HELP_TEXT_CREATE') }}
                    </p-empty>
                    <p-button icon-left="ic_plus"
                              @click="handleCreateDashboard"
                    >
                        {{ $t('DASHBOARDS.ALL_DASHBOARDS.CREAT_NEW_DASHBOARD') }}
                    </p-button>
                </div>
            </template>
            <dashboard-board-list v-if="(scopeStatus !== SCOPE_TYPE.PROJECT) && workspaceDashboardList.length"
                                  :scope-type="DASHBOARD_SCOPE.DOMAIN"
                                  class="dashboard-list"
                                  :class="{'full-mode': scopeStatus === SCOPE_TYPE.DOMAIN}"
                                  :field-title="$t('DASHBOARDS.ALL_DASHBOARDS.ENTIRE_WORKSPACE')"
                                  :dashboard-list="workspaceDashboardList"
            />
            <dashboard-board-list v-if="scopeStatus !== SCOPE_TYPE.DOMAIN && projectDashboardList.length"
                                  :scope-type="DASHBOARD_SCOPE.PROJECT"
                                  class="dashboard-list"
                                  :class="{'full-mode': scopeStatus === SCOPE_TYPE.PROJECT}"
                                  :field-title="$t('DASHBOARDS.ALL_DASHBOARDS.SINGLE_PROJECT')"
                                  :dashboard-list="projectDashboardList"
            />
        </p-data-loader>
    </div>
</template>

<script lang="ts">
import {
    computed, onUnmounted,
    reactive, toRefs, watch,
} from 'vue';


import {
    PPageTitle, PDivider, PButton, PToolbox, PEmpty, PDataLoader,
} from '@spaceone/design-system';
import type { ToolboxOptions } from '@spaceone/design-system/types/navigation/toolbox/type';

import { makeDistinctValueHandler } from '@cloudforet/core-lib/component-util/query-search';
import type {
    KeyItemSet, ValueHandler, KeyDataType, KeyItem, ValueMenuItem,
} from '@cloudforet/core-lib/component-util/query-search/type';
import { QueryHelper } from '@cloudforet/core-lib/query';

import type { HandlerResponse } from '@/component-util/query-search/type';
import { SpaceRouter } from '@/router';
import { store } from '@/store';

import { MENU_ID } from '@/lib/menu/config';
import { primitiveToQueryString, queryStringToString, replaceUrlQuery } from '@/lib/router-query-string';

import { useManagePermissionState } from '@/common/composables/page-manage-permission';

import AllDashboardsSelectFilter from '@/services/dashboards/all-dashboards/modules/AllDashboardsSelectFilter.vue';
import DashboardBoardList from '@/services/dashboards/all-dashboards/modules/DashboardBoardList.vue';
import { SCOPE_TYPE } from '@/services/dashboards/all-dashboards/type';
import { DASHBOARD_SCOPE } from '@/services/dashboards/config';
import { DASHBOARDS_ROUTE } from '@/services/dashboards/route-config';

export default {
    name: 'AllDashboardsPage',
    components: {
        PDataLoader,
        PEmpty,
        PToolbox,
        DashboardBoardList,
        AllDashboardsSelectFilter,
        PButton,
        PPageTitle,
        PDivider,
    },
    setup() {
        const state = reactive({
            viewersStatus: computed(() => store.state.dashboard.viewers),
            scopeStatus: computed(() => store.state.dashboard.scope),
            loading: computed(() => store.state.dashboard.loading),
            workspaceDashboardList: computed(() => store.getters['dashboard/getDomainItems']),
            projectDashboardList: computed(() => store.getters['dashboard/getProjectItems']),
            dashboardTotalCount: computed(() => store.getters['dashboard/getDashboardCount']),
            filteredDashboardStatus: computed(() => {
                if (state.scopeStatus === SCOPE_TYPE.DOMAIN) {
                    return !!(state.workspaceDashboardList.length);
                }
                if (state.scopeStatus === SCOPE_TYPE.PROJECT) {
                    return !!(state.projectDashboardList.length);
                }
                return !!(state.dashboardTotalCount && (state.projectDashboardList.length || state.workspaceDashboardList.length));
            }),
            hasOnlyViewPermission: computed(() => {
                const projectManagePermission = useManagePermissionState(MENU_ID.DASHBOARDS_PROJECT).value;
                const workspaceManagePermission = useManagePermissionState(MENU_ID.DASHBOARDS_WORKSPACE).value;
                return !(projectManagePermission || workspaceManagePermission);
            }),
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
                label: combinedDashbaordLabelsAutoCompleteHandler(),
            })),
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
            store.dispatch('dashboard/setSelectedViewers', useQueryValue.viewers);
            store.dispatch('dashboard/setSelectedScope', useQueryValue.scope);
            store.dispatch('dashboard/setSearchFilters', searchQueryHelper.filters);

            /* TODO: implementation */
            urlQueryStringWatcherStop = watch(() => queryState.urlQueryString, (urlQueryString) => {
                replaceUrlQuery(urlQueryString);
            });
        };

        const combinedDashbaordLabelsAutoCompleteHandler = (): ValueHandler | undefined => {
            const projectLabelsValueHandler = makeDistinctValueHandler('dashboard.ProjectDashboard', 'labels');
            const domainLabelsValueHandler = makeDistinctValueHandler('dashboard.DomainDashboard', 'labels');
            if (!projectLabelsValueHandler && !domainLabelsValueHandler) return undefined;

            return async (inputText: string, keyItem: KeyItem, currentDataType?: KeyDataType, subPath?: string) => {
                const results = [] as ValueMenuItem[];
                const promises = [] as (HandlerResponse | Promise<HandlerResponse>)[];

                if (projectLabelsValueHandler) promises.push(projectLabelsValueHandler(inputText, keyItem, currentDataType, subPath));
                if (domainLabelsValueHandler) promises.push(domainLabelsValueHandler(inputText, keyItem, currentDataType, subPath));
                const responses = await Promise.allSettled(promises);

                // combine both of results and sort
                responses.forEach((res) => {
                    if (res.status === 'fulfilled') {
                        res.value.results.forEach((item) => {
                            if (results.some((d) => d.name === item.name)) return;
                            results.push(item);
                        });
                    }
                });
                results.sort((a, b) => (a.label > b.label ? 1 : -1));

                return {
                    results,
                    totalCount: results.length ?? 0,
                };
            };
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
            DASHBOARD_SCOPE,
        };
    },
};
</script>

<style lang="postcss" scoped>
.all-dashboards-page {
    @apply w-full;

    .dashboard-list-wrapper {
        @apply flex w-full;
        gap: 0.5rem;
        min-height: 16.875rem;

        .dashboard-list {
            @apply flex-grow;

            &.full-mode {
                @apply w-full;
            }
        }
    }

    @screen tablet {
        .dashboard-list-wrapper {
            display: block;
        }
    }

    .empty-case {
        @apply flex flex-col items-center;
        padding-top: 1.5rem;
        .empty-text {
            margin: 1rem 0 1.5rem;
            text-align: center;
        }
    }
}
</style>
