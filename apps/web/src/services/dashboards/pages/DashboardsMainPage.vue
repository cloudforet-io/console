<script lang="ts" setup>
import {
    computed, onUnmounted, reactive, watch,
} from 'vue';
import { useRouter } from 'vue-router/composables';

import { makeDistinctValueHandler } from '@cloudforet/core-lib/component-util/query-search';
import { QueryHelper } from '@cloudforet/core-lib/query';
import {
    PHeading, PDivider, PButton, PToolbox, PEmpty, PDataLoader,
} from '@cloudforet/mirinae';
import type {
    HandlerResponse, KeyDataType, KeyItem, KeyItemSet, ValueHandler, ValueMenuItem,
} from '@cloudforet/mirinae/types/inputs/search/query-search/type';
import type { ToolboxOptions } from '@cloudforet/mirinae/types/navigation/toolbox/type';


import { SpaceRouter } from '@/router';
import type { PrivateDashboardModel } from '@/schema/dashboard/private-dashboard/model';
import type { PublicDashboardModel } from '@/schema/dashboard/public-dashboard/model';
import { ROLE_TYPE } from '@/schema/identity/role/constant';
import { store } from '@/store';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useDashboardStore } from '@/store/dashboard/dashboard-store';

import { primitiveToQueryString, queryStringToString, replaceUrlQuery } from '@/lib/router-query-string';

import { useProperRouteLocation } from '@/common/composables/proper-route-location';

import DashboardMainBoardList from '@/services/dashboards/components/DashboardMainBoardList.vue';
import { DASHBOARDS_ROUTE } from '@/services/dashboards/routes/route-constant';


const { getProperRouteLocation } = useProperRouteLocation();
const appContextStore = useAppContextStore();
const dashboardStore = useDashboardStore();
const dashboardState = dashboardStore.state;
const dashboardGetters = dashboardStore.getters;
const router = useRouter();
const storeState = reactive({
    isWorkspaceOwner: computed(() => store.getters['user/getCurrentRoleInfo']?.roleType === ROLE_TYPE.WORKSPACE_OWNER),
});
const state = reactive({
    isAdminMode: computed(() => appContextStore.getters.isAdminMode),
    loading: computed(() => dashboardState.loading),
    isWorkspaceOwner: computed(() => store.getters['user/getCurrentRoleInfo']?.roleType === ROLE_TYPE.WORKSPACE_OWNER),
    sharedDashboardList: computed<PublicDashboardModel[]>(() => {
        if (dashboardState.scope && dashboardState.scope !== 'WORKSPACE' && !state.isWorkspaceOwner) return [];
        if (!storeState.isWorkspaceOwner) return [];
        return dashboardGetters.workspaceItems.filter((d) => d.version === '2.0') || [];
    }),
    privateDashboardList: computed<PrivateDashboardModel[]>(() => {
        if (dashboardState.scope && dashboardState.scope !== 'PRIVATE') return [];
        return dashboardGetters.privateItems.filter((d) => d.version === '2.0') || [];
    }),
    deprecatedDashboardList: computed<Array<PublicDashboardModel|PrivateDashboardModel>>(() => {
        const _publicDeprecated = dashboardGetters.workspaceItems.filter((d) => d.version === '1.0');
        const _privateDeprecated = dashboardGetters.privateItems.filter((d) => d.version === '1.0');
        return [..._publicDeprecated, ..._privateDeprecated];
    }),
    dashboardTotalCount: computed<number>(() => {
        if (state.isAdminMode) return dashboardGetters.domainItems.length;
        return state.sharedDashboardList.length + state.privateDashboardList.length + state.deprecatedDashboardList.length;
    }),
    filteredDashboardStatus: computed<boolean>(() => {
        if (state.isAdminMode) {
            return !!(dashboardGetters.domainItems.length);
        }
        return !!(state.dashboardTotalCount && (state.sharedDashboardList.length || state.privateDashboardList.length || state.deprecatedDashboardList.length));
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
            { name: 'labels', label: 'Label' },
        ],
    }]),
    valueHandlerMap: computed(() => ({
        labels: getDashboardValueHandler(),
    })),
    queryTags: computed(() => searchQueryHelper.setKeyItemSets(queryState.keyItemSets).setFilters(dashboardState.searchFilters).queryTags),
});

const handleCreateDashboard = () => { router.push(getProperRouteLocation({ name: DASHBOARDS_ROUTE.CREATE._NAME })); };
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
                <p-button icon-left="ic_plus_bold"
                          @click="handleCreateDashboard"
                >
                    {{ $t('DASHBOARDS.ALL_DASHBOARDS.CREATE') }}
                </p-button>
            </template>
        </p-heading>
        <p-divider class="dashboard-divider" />
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
            <dashboard-main-board-list v-if="state.isAdminMode"
                                       class="dashboard-list"
                                       :dashboard-list="dashboardGetters.domainItems"
            />
            <template v-else>
                <dashboard-main-board-list v-if="state.sharedDashboardList.length"
                                           class="dashboard-list"
                                           :field-title="$t('DASHBOARDS.ALL_DASHBOARDS.SHARED')"
                                           :dashboard-list="state.sharedDashboardList"
                />
                <dashboard-main-board-list v-if="state.privateDashboardList.length"
                                           class="dashboard-list"
                                           :field-title="$t('DASHBOARDS.ALL_DASHBOARDS.PRIVATE')"
                                           :dashboard-list="state.privateDashboardList"
                />
                <dashboard-main-board-list v-if="state.deprecatedDashboardList.length"
                                           class="dashboard-list"
                                           :field-title="$t('DASHBOARDS.ALL_DASHBOARDS.DEPRECATED')"
                                           :dashboard-list="state.deprecatedDashboardList"
                                           is-collapsed
                />
            </template>
        </p-data-loader>
    </div>
</template>

<style lang="postcss" scoped>
.dashboards-main-page {
    @apply w-full;

    .dashboard-divider {
        margin-bottom: 1.125rem;
    }
    .dashboard-list-wrapper {
        @apply flex w-full;
        gap: 0.5rem;
        min-height: 16.875rem;

        .dashboard-list {
            @apply flex-grow w-full;
        }
    }

    @screen tablet {
        .dashboard-list-wrapper {
            display: block;
        }
    }
}
</style>
