<template>
    <div class="gnb-recent">
        <p-data-loader :data="items"
                       :loading="loading"
                       :class="{ loading: loading && !items.length }"
        >
            <g-n-b-suggestion-list :items="items"
                                   use-favorite
                                   @close="$emit('close')"
                                   @select="handleSelect"
            />
            <template #no-data>
                <p-empty
                    show-image
                >
                    <template #image>
                        <img alt="empty-image"
                             src="@/assets/images/illust_spaceship_3.svg"
                        >
                    </template>
                    {{ $t('COMMON.GNB.RECENT.RECENT_HELP_TEXT') }}
                </p-empty>
            </template>
        </p-data-loader>
    </div>
</template>

<script lang="ts">

import type { SetupContext } from 'vue';
import {
    computed, defineComponent, reactive, toRefs, watch,
} from 'vue';

import { PDataLoader, PEmpty } from '@spaceone/design-system';
import { sortBy } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { getCancellableFetcher } from '@cloudforet/core-lib/space-connector/cancallable-fetcher';

import { SpaceRouter } from '@/router';
import { store } from '@/store';

import type { DisplayMenu } from '@/store/modules/display/type';
import type { FavoriteItem } from '@/store/modules/favorite/type';
import type { RecentConfig, RecentItem } from '@/store/modules/recent/type';
import { RECENT_TYPE } from '@/store/modules/recent/type';
import type { CloudServiceTypeReferenceMap } from '@/store/modules/reference/cloud-service-type/type';
import type { ProjectGroupReferenceMap } from '@/store/modules/reference/project-group/type';
import type { ProjectReferenceMap } from '@/store/modules/reference/project/type';
import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { CostDataSourceReferenceMap } from '@/store/reference/cost-data-source-reference-store';

import { isUserAccessibleToMenu } from '@/lib/access-control';
import {
    convertCloudServiceConfigToReferenceData,
    convertCostAnalysisConfigToReferenceData,
    convertDashboardConfigToReferenceData,
    convertMenuConfigToReferenceData,
    convertProjectConfigToReferenceData,
    convertProjectGroupConfigToReferenceData,
} from '@/lib/helper/config-data-helper';
import type { MenuInfo } from '@/lib/menu/config';
import { MENU_ID } from '@/lib/menu/config';
import { MENU_INFO_MAP } from '@/lib/menu/menu-info';
import { referenceRouter } from '@/lib/reference/referenceRouter';

import ErrorHandler from '@/common/composables/error/errorHandler';
import type { SuggestionItem } from '@/common/modules/navigations/gnb/modules/gnb-search/config';
import { SUGGESTION_TYPE } from '@/common/modules/navigations/gnb/modules/gnb-search/config';
import GNBSuggestionList from '@/common/modules/navigations/gnb/modules/GNBSuggestionList.vue';

import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/route-config';
import type { CostQuerySetModel } from '@/services/cost-explorer/type';
import { DASHBOARD_SCOPE } from '@/services/dashboards/config';
import type { DashboardModel } from '@/services/dashboards/model';

const RECENT_LIMIT = 30;

export default defineComponent({
    name: 'GNBRecent',
    components: {
        GNBSuggestionList,
        PDataLoader,
        PEmpty,
    },
    props: {
        visible: {
            type: Boolean,
            default: false,
        },
    },
    setup(props, { emit }: SetupContext) {
        const allReferenceStore = useAllReferenceStore();

        const storeState = reactive({
            menuItems: computed<DisplayMenu[]>(() => store.getters['display/allMenuList']),
            projects: computed<ProjectReferenceMap>(() => store.getters['reference/projectItems']),
            projectGroups: computed<ProjectGroupReferenceMap>(() => store.getters['reference/projectGroupItems']),
            cloudServiceTypes: computed<CloudServiceTypeReferenceMap>(() => store.getters['reference/cloudServiceTypeItems']),
            domainDashboardItems: computed<DashboardModel[]>(() => {
                const isUserAccessibleToDomainDashboards = isUserAccessibleToMenu(MENU_ID.DASHBOARDS_WORKSPACE, store.getters['user/pagePermissionList']);
                return isUserAccessibleToDomainDashboards ? store.getters['dashboard/getDomainItems'] : [];
            }),
            projectDashboardItems: computed<DashboardModel[]>(() => {
                const isUserAccessibleToProjectDashboards = isUserAccessibleToMenu(MENU_ID.DASHBOARDS_PROJECT, store.getters['user/pagePermissionList']);
                return isUserAccessibleToProjectDashboards ? store.getters['dashboard/getProjectItems'] : [];
            }),
            dataSourceMap: computed<CostDataSourceReferenceMap>(() => allReferenceStore.getters.allReferenceTypeInfo.costDataSource.referenceMap),
            recents: computed<RecentConfig[]>(() => store.state.recent.allItems),
        });
        const state = reactive({
            loading: true,
            items: computed<SuggestionItem[]>(() => sortBy(
                state.recentMenuItems
                    .concat(state.recentDashboardItems)
                    .concat(state.recentProjectItems)
                    .concat(state.recentProjectGroupItems)
                    .concat(state.recentCloudServiceItems)
                    .concat(state.recentCostAnalysisItems),
                (recent) => recent.updatedAt,
            ).reverse()),
            recentMenuItems: computed<RecentItem[]>(() => convertMenuConfigToReferenceData(
                storeState.recents.filter((d) => d.itemType === RECENT_TYPE.MENU),
                storeState.menuItems,
            )),
            recentCloudServiceItems: computed<RecentItem[]>(() => {
                const isUserAccessible = isUserAccessibleToMenu(MENU_ID.ASSET_INVENTORY_CLOUD_SERVICE, store.getters['user/pagePermissionList']);
                return isUserAccessible ? convertCloudServiceConfigToReferenceData(
                    storeState.recents.filter((d) => d.itemType === RECENT_TYPE.CLOUD_SERVICE),
                    storeState.cloudServiceTypes,
                ) : [];
            }),
            recentProjectItems: computed<RecentItem[]>(() => {
                const isUserAccessible = isUserAccessibleToMenu(MENU_ID.PROJECT, store.getters['user/pagePermissionList']);
                return isUserAccessible ? convertProjectConfigToReferenceData(
                    storeState.recents.filter((d) => d.itemType === RECENT_TYPE.PROJECT),
                    storeState.projects,
                ) : [];
            }),
            recentProjectGroupItems: computed<RecentItem[]>(() => {
                const isUserAccessible = isUserAccessibleToMenu(MENU_ID.PROJECT, store.getters['user/pagePermissionList']);
                return isUserAccessible ? convertProjectGroupConfigToReferenceData(
                    storeState.recents.filter((d) => d.itemType === RECENT_TYPE.PROJECT_GROUP),
                    storeState.projectGroups,
                ) : [];
            }),
            recentDashboardItems: computed<FavoriteItem[]>(() => {
                const isUserAccessibleToDashboards = isUserAccessibleToMenu(MENU_ID.DASHBOARDS, store.getters['user/pagePermissionList']);
                if (!isUserAccessibleToDashboards) return [];
                const domainDashboardReferenceData = convertDashboardConfigToReferenceData(
                    storeState.recents.filter((d) => d.itemType === RECENT_TYPE.DASHBOARD && d.itemId.startsWith(DASHBOARD_SCOPE.DOMAIN)),
                    storeState.domainDashboardItems,
                    DASHBOARD_SCOPE.DOMAIN,
                );
                const projectDashboardReferenceData = convertDashboardConfigToReferenceData(
                    storeState.recents.filter((d) => d.itemType === RECENT_TYPE.DASHBOARD && d.itemId.startsWith(DASHBOARD_SCOPE.PROJECT)),
                    storeState.projectDashboardItems,
                    DASHBOARD_SCOPE.PROJECT,
                );
                return [...domainDashboardReferenceData, ...projectDashboardReferenceData];
            }),
            recentCostAnalysisItems: computed<RecentItem[]>(() => {
                const isUserAccessible = isUserAccessibleToMenu(MENU_ID.COST_EXPLORER_COST_ANALYSIS, store.getters['user/pagePermissionList']);
                return isUserAccessible
                    ? convertCostAnalysisConfigToReferenceData(
                        storeState.recents.filter((d) => d.itemType === RECENT_TYPE.COST_ANALYSIS),
                        state.costQuerySets,
                        storeState.dataSourceMap,
                    )
                    : [];
            }),

            costQuerySets: [] as CostQuerySetModel[],
        });

        const handleSelect = (item: SuggestionItem) => {
            const itemName = item.name as string;
            if (item.itemType === SUGGESTION_TYPE.MENU) {
                const menuInfo: MenuInfo = MENU_INFO_MAP[itemName];
                if (menuInfo && SpaceRouter.router.currentRoute.name !== itemName) {
                    SpaceRouter.router.push({ name: itemName }).catch(() => {});
                }
            } else if (item.itemType === SUGGESTION_TYPE.PROJECT) {
                SpaceRouter.router.push(referenceRouter(itemName, { resource_type: 'identity.Project' })).catch(() => {});
            } else if (item.itemType === SUGGESTION_TYPE.PROJECT_GROUP) {
                SpaceRouter.router.push(referenceRouter(itemName, { resource_type: 'identity.ProjectGroup' })).catch(() => {});
            } else if (item.itemType === SUGGESTION_TYPE.CLOUD_SERVICE) {
                const itemInfo: string[] = itemName.split('.');
                SpaceRouter.router.push({
                    name: ASSET_INVENTORY_ROUTE.CLOUD_SERVICE.DETAIL._NAME,
                    params: {
                        provider: itemInfo[0],
                        group: itemInfo[1],
                        name: itemInfo[2],
                    },
                }).catch(() => {});
            }
            emit('close');
        };

        const costQuerySetFetcher = getCancellableFetcher(SpaceConnector.clientV2.costAnalysis.costQuerySet.list);

        const getAllCostQuerySetList = async () => {
            try {
                const { status, response } = await costQuerySetFetcher({
                    query: {
                        filter: [{ k: 'user_id', v: store.state.user.userId, o: 'eq' }],
                        only: ['cost_query_set_id', 'data_source_id', 'name'],
                    },
                });
                if (status === 'succeed' && response?.results) {
                    state.costQuerySets = response.results;
                }
            } catch (e) {
                ErrorHandler.handleError(e);
                state.costQuerySets = [];
            }
        };

        /* Watcher */
        watch(() => props.visible, async (visible) => {
            if (visible) {
                state.loading = true;
                await store.dispatch('recent/load', { limit: RECENT_LIMIT });
                await getAllCostQuerySetList();
                state.loading = false;
            }
        });

        return {
            ...toRefs(state),
            handleSelect,
        };
    },
});
</script>
<style lang="postcss" scoped>
.gnb-recent {
    /* custom design-system component - p-data-loader */
    :deep(.p-data-loader) {
        &.loading {
            height: 13rem;
        }
        .data-loader-container {
            max-height: calc(100vh - $gnb-height - 3.75rem);
            overflow-y: auto;
            padding: 1rem 0;
        }
    }
}

/* custom design-system component - p-empty */
:deep(.p-empty) {
    text-align: center;
    padding: 3rem 3.25rem;
}
</style>
