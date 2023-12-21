<script lang="ts" setup>
import {
    computed, onUnmounted, reactive, watch,
} from 'vue';

import {
    PHeading, PDivider, PButton, PToolbox, PEmpty, PDataLoader,
} from '@spaceone/design-system';
import type {
    HandlerResponse, KeyDataType, KeyItem, KeyItemSet, ValueHandler, ValueMenuItem,
} from '@spaceone/design-system/types/inputs/search/query-search/type';
import type { ToolboxOptions } from '@spaceone/design-system/types/navigation/toolbox/type';

import { makeDistinctValueHandler } from '@cloudforet/core-lib/component-util/query-search';
import { QueryHelper } from '@cloudforet/core-lib/query';

import { SpaceRouter } from '@/router';

import { useDashboardStore } from '@/store/dashboard/dashboard-store';

import { primitiveToQueryString, queryStringToString, replaceUrlQuery } from '@/lib/router-query-string';

import DashboardMainBoardList from '@/services/dashboards/components/DashboardMainBoardList.vue';
import DashboardMainSelectFilter from '@/services/dashboards/components/DashboardMainSelectFilter.vue';
import { DASHBOARDS_ROUTE } from '@/services/dashboards/routes/route-constant';


const dashboardStore = useDashboardStore();
const dashboardState = dashboardStore.state;
const dashboardGetters = dashboardStore.getters;
const state = reactive({
    loading: computed(() => dashboardState.loading),
    workspaceDashboardList: computed(() => {
        if (dashboardState.scope && dashboardState.scope !== 'WORKSPACE') return [];
        let target = dashboardGetters.workspaceItems;
        if (dashboardState.scope) target = target.filter((d) => d.resource_group === dashboardState.scope);
        return target;
    }),
    projectDashboardList: computed(() => {
        if (dashboardState.scope && dashboardState.scope !== 'PROJECT') return [];
        let target = dashboardGetters.projectItems;
        if (dashboardState.scope) target = target.filter((d) => d.resource_group === dashboardState.scope);
        return target;
    }),
    privateDashboardList: computed(() => {
        if (dashboardState.scope && dashboardState.scope !== 'PRIVATE') return [];
        return dashboardGetters.privateItems;
    }),
    dashboardTotalCount: computed(() => state.workspaceDashboardList.length + state.projectDashboardList.length + state.privateDashboardList.length),
    filteredDashboardStatus: computed(() => {
        if (dashboardState.scope === 'WORKSPACE') {
            return !!(state.workspaceDashboardList.length);
        }
        if (dashboardState.scope === 'PROJECT') {
            return !!(state.projectDashboardList.length);
        }
        if (dashboardState.scope === 'PRIVATE') {
            return !!(state.privateDashboardList.length);
        }
        return !!(state.dashboardTotalCount && (state.projectDashboardList.length || state.workspaceDashboardList.length));
    }),
});

const searchQueryHelper = new QueryHelper();
const queryState = reactive({
    searchFilters: computed(() => dashboardState.searchFilters),
    urlQueryString: computed(() => ({
        scope: dashboardState.scope ? primitiveToQueryString(dashboardState.scope) : null,
        filters: searchQueryHelper.setFilters(queryState.searchFilters).rawQueryStrings,
    })),
    keyItemSets: computed<KeyItemSet[]>(() => [{
        title: 'Properties',
        items: [
            { name: 'label', label: 'Label' },
        ],
    }]),
    valueHandlerMap: computed(() => ({
        label: getDashboardValueHandler(),
    })),
    queryTags: computed(() => searchQueryHelper.setKeyItemSets(queryState.keyItemSets).setFilters(dashboardState.searchFilters).queryTags),
});

const handleCreateDashboard = () => { SpaceRouter.router.push({ name: DASHBOARDS_ROUTE.CREATE._NAME }); };
const handleQueryChange = (options: ToolboxOptions = {}) => {
    if (options.queryTags !== undefined) {
        searchQueryHelper.setKeyItemSets(queryState.keyItemSets).setFiltersAsQueryTag(options.queryTags);
        dashboardStore.setSearchFilters(searchQueryHelper.filters);
        dashboardStore.load();
    }
};

/* init */
let urlQueryStringWatcherStop;
const init = async () => {
    const currentQuery = SpaceRouter.router.currentRoute.query;
    const useQueryValue = {
        scope: queryStringToString(currentQuery.scope),
        filters: searchQueryHelper.setKeyItemSets(queryState.keyItemSets).setFiltersAsRawQueryString(currentQuery.filters).filters,
    };

    dashboardStore.setScope(useQueryValue.scope);
    dashboardStore.setSearchFilters(useQueryValue.filters);

    urlQueryStringWatcherStop = watch(() => queryState.urlQueryString, (urlQueryString) => {
        replaceUrlQuery(urlQueryString);
    });
};

const getDashboardValueHandler = (): ValueHandler | undefined => {
    const publicLabelsValueHandler = makeDistinctValueHandler('dashboard.PublicDashboard', 'labels');
    const privateLabelsValueHandler = makeDistinctValueHandler('dashboard.PrivateDashboard', 'labels');
    if (!publicLabelsValueHandler && !privateLabelsValueHandler) return undefined;

    return async (inputText: string|number, keyItem: KeyItem, currentDataType?: KeyDataType, subPath?: string) => {
        const results = [] as ValueMenuItem[];
        const promises = [] as (HandlerResponse | Promise<HandlerResponse>)[];

        if (publicLabelsValueHandler) promises.push(publicLabelsValueHandler(inputText, keyItem, currentDataType, subPath));
        if (privateLabelsValueHandler) promises.push(privateLabelsValueHandler(inputText, keyItem, currentDataType, subPath));
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
</script>

<template>
    <div class="dashboards-main-page">
        <p-heading :title="$t('DASHBOARDS.ALL_DASHBOARDS.DASHBOARDS_TITLE')"
                   use-total-count
                   :total-count="state.dashboardTotalCount"
        >
            <template #extra>
                <p-button v-if="state.workspaceDashboardList || state.projectDashboardList"
                          icon-left="ic_plus_bold"
                          @click="handleCreateDashboard"
                >
                    {{ $t('DASHBOARDS.ALL_DASHBOARDS.CREATE') }}
                </p-button>
            </template>
        </p-heading>
        <p-divider class="dashboards-divider" />
        <dashboard-main-select-filter />
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
        <p-data-loader :loading="state.loading"
                       :data="state.filteredDashboardStatus"
                       class="dashboard-list-wrapper"
        >
            <template #no-data>
                <p-empty
                    show-image
                    show-button
                >
                    <template #image>
                        <img alt="empty-default-image"
                             src="@/assets/images/illust_jellyocto-with-a-telescope.svg"
                        >
                    </template>
                    <template #button>
                        <p-button icon-left="ic_plus_bold"
                                  @click="handleCreateDashboard"
                        >
                            {{ $t('DASHBOARDS.ALL_DASHBOARDS.CREAT_NEW_DASHBOARD') }}
                        </p-button>
                    </template>
                    {{ $t('DASHBOARDS.ALL_DASHBOARDS.HELP_TEXT_CREATE') }}
                </p-empty>
            </template>
            <dashboard-main-board-list v-if="state.workspaceDashboardList.length"
                                       scope-type="WORKSPACE"
                                       class="dashboard-list"
                                       :class="{'full-mode': dashboardState.scope === 'WORKSPACE'}"
                                       :field-title="$t('DASHBOARDS.ALL_DASHBOARDS.WORKSPACE')"
                                       :dashboard-list="state.workspaceDashboardList"
            />
            <dashboard-main-board-list v-if="state.projectDashboardList.length"
                                       scope-type="PROJECT"
                                       class="dashboard-list"
                                       :class="{'full-mode': dashboardState.scope === 'PROJECT'}"
                                       :field-title="$t('DASHBOARDS.ALL_DASHBOARDS.SINGLE_PROJECT')"
                                       :dashboard-list="state.projectDashboardList"
            />
            <dashboard-main-board-list v-if="state.privateDashboardList.length"
                                       scope-type="PRIVATE"
                                       class="dashboard-list"
                                       :class="{'full-mode': dashboardState.scope === 'PRIVATE'}"
                                       :field-title="$t('DASHBOARDS.ALL_DASHBOARDS.PRIVATE')"
                                       :dashboard-list="state.privateDashboardList"
            />
        </p-data-loader>
    </div>
</template>

<style lang="postcss" scoped>
.dashboards-main-page {
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
}
</style>
