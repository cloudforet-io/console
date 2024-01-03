<script lang="ts" setup>
import {
    computed, onUnmounted, reactive, watch,
} from 'vue';

import {
    PHeading, PButton, PToolbox, PEmpty, PDataLoader,
} from '@spaceone/design-system';
import type {
    HandlerResponse, KeyDataType, KeyItem, KeyItemSet, ValueHandler, ValueMenuItem,
} from '@spaceone/design-system/types/inputs/search/query-search/type';
import type { ToolboxOptions } from '@spaceone/design-system/types/navigation/toolbox/type';

import { makeDistinctValueHandler } from '@cloudforet/core-lib/component-util/query-search';
import { QueryHelper } from '@cloudforet/core-lib/query';

import { SpaceRouter } from '@/router';

import { makeAdminRouteName } from '@/router/helpers/route-helper';

import { useDashboardStore } from '@/store/dashboard/dashboard-store';

import { replaceUrlQuery } from '@/lib/router-query-string';

import DashboardMainBoardList from '@/services/dashboards/components/DashboardMainBoardList.vue';
import { DASHBOARDS_ROUTE } from '@/services/dashboards/routes/route-constant';


const dashboardStore = useDashboardStore();
const dashboardState = dashboardStore.state;
const dashboardGetters = dashboardStore.getters;
const state = reactive({
    loading: computed(() => dashboardState.loading),
});

const searchQueryHelper = new QueryHelper();
const queryState = reactive({
    searchFilters: computed(() => dashboardState.searchFilters),
    urlQueryString: computed(() => ({
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

const handleCreateDashboard = () => { SpaceRouter.router.push({ name: makeAdminRouteName(DASHBOARDS_ROUTE.CREATE._NAME) }); };
const handleQueryChange = (options: ToolboxOptions = {}) => {
    if (options.queryTags !== undefined) {
        searchQueryHelper.setKeyItemSets(queryState.keyItemSets).setFiltersAsQueryTag(options.queryTags);
        dashboardStore.setSearchFilters(searchQueryHelper.filters);
    }
};

/* init */
let urlQueryStringWatcherStop;
const init = async () => {
    const currentQuery = SpaceRouter.router.currentRoute.query;
    const useQueryValue = {
        filters: searchQueryHelper.setKeyItemSets(queryState.keyItemSets).setFiltersAsRawQueryString(currentQuery.filters).filters,
    };
    dashboardStore.setSearchFilters(useQueryValue.filters);

    urlQueryStringWatcherStop = watch(() => queryState.urlQueryString, (urlQueryString) => {
        replaceUrlQuery(urlQueryString);
    });
};

const getDashboardValueHandler = (): ValueHandler | undefined => {
    const labelsValueHandler = makeDistinctValueHandler('dashboard.PublicDashboard', 'labels');
    if (!labelsValueHandler) return undefined;

    return async (inputText: string|number, keyItem: KeyItem, currentDataType?: KeyDataType, subPath?: string) => {
        const results = [] as ValueMenuItem[];
        const promises = [] as (HandlerResponse | Promise<HandlerResponse>)[];

        if (labelsValueHandler) promises.push(labelsValueHandler(inputText, keyItem, currentDataType, subPath));
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
                   :total-count="dashboardState.totalCount"
        >
            <template #extra>
                <div class="extra-button">
                    <p-button icon-left="ic_plus_bold"
                              @click="handleCreateDashboard"
                    >
                        {{ $t('DASHBOARDS.ALL_DASHBOARDS.CREATE') }}
                    </p-button>
                </div>
            </template>
        </p-heading>
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
                       :data="dashboardGetters.domainItems"
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
            <dashboard-main-board-list scope-type="DOMAIN"
                                       class="dashboard-list"
                                       :dashboard-list="dashboardGetters.domainItems"
            />
        </p-data-loader>
    </div>
</template>

<style lang="postcss" scoped>
.dashboards-main-page {
    @apply w-full;

    .extra-button {
        @apply flex justify-end;
    }

    .dashboard-list-wrapper {
        @apply flex w-full;
        gap: 0.5rem;
        min-height: 16.875rem;

        .dashboard-list {
            @apply w-full;
        }
    }

    @screen tablet {
        .dashboard-list-wrapper {
            display: block;
        }
    }
}
</style>
