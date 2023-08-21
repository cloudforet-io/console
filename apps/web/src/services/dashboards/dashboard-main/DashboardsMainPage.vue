<script lang="ts" setup>
import { makeDistinctValueHandler } from '@cloudforet/core-lib/component-util/query-search';
import type {
    KeyItemSet, ValueHandler, KeyDataType, KeyItem, ValueMenuItem,
    HandlerResponse,
} from '@cloudforet/core-lib/component-util/query-search/type';
import { QueryHelper } from '@cloudforet/core-lib/query';
import {
    PHeading, PDivider, PButton, PToolbox, PEmpty, PDataLoader,
} from '@spaceone/design-system';
import type { ToolboxOptions } from '@spaceone/design-system/types/navigation/toolbox/type';
import {
    computed, onUnmounted,
    reactive, watch,
} from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';

import { MENU_ID } from '@/lib/menu/config';
import { primitiveToQueryString, queryStringToString, replaceUrlQuery } from '@/lib/router-query-string';

import { useManagePermissionState } from '@/common/composables/page-manage-permission';

import { DASHBOARD_SCOPE } from '@/services/dashboards/config';
import DashboardMainBoardList from '@/services/dashboards/dashboard-main/modules/DashboardMainBoardList.vue';
import DashboardMainSelectFilter from '@/services/dashboards/dashboard-main/modules/DashboardMainSelectFilter.vue';
import { SCOPE_TYPE } from '@/services/dashboards/dashboard-main/type';
import { DASHBOARDS_ROUTE } from '@/services/dashboards/route-config';

const { t } = useI18n();
const router = useRouter();
const store = useStore();

const state = reactive({
    viewersStatus: computed(() => store.state.dashboard.viewers),
    scopeStatus: computed(() => store.state.dashboard.scope),
    loading: computed(() => store.state.dashboard.loading),
    workspaceDashboardList: computed(() => (state.pagePermission[MENU_ID.DASHBOARDS_WORKSPACE] ? store.getters['dashboard/getDomainItems'] : [])),
    projectDashboardList: computed(() => (state.pagePermission[MENU_ID.DASHBOARDS_PROJECT] ? store.getters['dashboard/getProjectItems'] : [])),
    dashboardTotalCount: computed(() => {
        const domainDashboardCount = state.pagePermission[MENU_ID.DASHBOARDS_WORKSPACE] ? store.getters['dashboard/getDomainDashboardCount'] : 0;
        const projectDashboardCount = state.pagePermission[MENU_ID.DASHBOARDS_PROJECT] ? store.getters['dashboard/getProjectDashboardCount'] : 0;
        return domainDashboardCount + projectDashboardCount;
    }),
    filteredDashboardStatus: computed(() => {
        if (state.scopeStatus === SCOPE_TYPE.DOMAIN) {
            return !!(state.workspaceDashboardList.length);
        }
        if (state.scopeStatus === SCOPE_TYPE.PROJECT) {
            return !!(state.projectDashboardList.length);
        }
        return !!(state.dashboardTotalCount && (state.projectDashboardList.length || state.workspaceDashboardList.length));
    }),
    projectManagePermission: useManagePermissionState(MENU_ID.DASHBOARDS_PROJECT),
    workspaceManagePermission: useManagePermissionState(MENU_ID.DASHBOARDS_WORKSPACE),
    hasOnlyViewPermission: computed(() => !(state.projectManagePermission || state.workspaceManagePermission)),
    pagePermission: computed(() => store.getters['user/pagePermissionMap']),
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
        label: combinedDashboardLabelsAutoCompleteHandler(),
    })),
    queryTags: computed(() => searchQueryHelper.setKeyItemSets(queryState.keyItemSets).setFilters(store.state.dashboard.searchFilters).queryTags),
});

const handleCreateDashboard = () => { router.push({ name: DASHBOARDS_ROUTE.CREATE._NAME }); };
const handleQueryChange = (options: ToolboxOptions = {}) => {
    if (options.queryTags !== undefined) {
        searchQueryHelper.setKeyItemSets(queryState.keyItemSets).setFiltersAsQueryTag(options.queryTags);
        store.dispatch('dashboard/setSearchFilters', searchQueryHelper.filters);
    }
};

/* init */
let urlQueryStringWatcherStop;
const init = async () => {
    const currentQuery = router.currentRoute.value.query;
    const useQueryValue = {
        viewers: queryStringToString(currentQuery.viewers) ?? 'ALL',
        scope: queryStringToString(currentQuery.scope) ?? 'ALL',
        filters: searchQueryHelper.setKeyItemSets(queryState.keyItemSets).setFiltersAsRawQueryString(currentQuery.filters ?? undefined).filters,
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

const combinedDashboardLabelsAutoCompleteHandler = (): ValueHandler | undefined => {
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

</script>

<template>
    <div class="dashboards-main-page">
        <p-heading :title="t('DASHBOARDS.ALL_DASHBOARDS.DASHBOARDS_TITLE')"
                   use-total-count
                   :total-count="state.dashboardTotalCount"
        >
            <template #extra>
                <p-button v-if="!state.hasOnlyViewPermission && (state.workspaceDashboardList || state.projectDashboardList)"
                          icon-left="ic_plus_bold"
                          @click="handleCreateDashboard"
                >
                    {{ t('DASHBOARDS.ALL_DASHBOARDS.CREATE') }}
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
                                  :disabled="state.hasOnlyViewPermission"
                                  @click="handleCreateDashboard"
                        >
                            {{ t('DASHBOARDS.ALL_DASHBOARDS.CREAT_NEW_DASHBOARD') }}
                        </p-button>
                    </template>
                    {{ t('DASHBOARDS.ALL_DASHBOARDS.HELP_TEXT_CREATE') }}
                </p-empty>
            </template>
            <dashboard-main-board-list v-if="(state.scopeStatus !== SCOPE_TYPE.PROJECT) && state.workspaceDashboardList.length"
                                       :scope-type="DASHBOARD_SCOPE.DOMAIN"
                                       class="dashboard-list"
                                       :class="{'full-mode': state.scopeStatus === SCOPE_TYPE.DOMAIN}"
                                       :field-title="t('DASHBOARDS.ALL_DASHBOARDS.ENTIRE_WORKSPACE')"
                                       :dashboard-list="state.workspaceDashboardList"
            />
            <dashboard-main-board-list v-if="state.scopeStatus !== SCOPE_TYPE.DOMAIN && state.projectDashboardList.length"
                                       :scope-type="DASHBOARD_SCOPE.PROJECT"
                                       class="dashboard-list"
                                       :class="{'full-mode': state.scopeStatus === SCOPE_TYPE.PROJECT}"
                                       :field-title="t('DASHBOARDS.ALL_DASHBOARDS.SINGLE_PROJECT')"
                                       :dashboard-list="state.projectDashboardList"
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
