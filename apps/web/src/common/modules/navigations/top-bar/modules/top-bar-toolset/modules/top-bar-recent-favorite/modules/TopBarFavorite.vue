<script lang="ts" setup>
import {
    computed, reactive, watch,
} from 'vue';
import type { TranslateResult } from 'vue-i18n';
import { useRouter } from 'vue-router/composables';

import {
    PButton, PDataLoader, PEmpty, PI, PIconButton,
} from '@spaceone/design-system';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { CostQuerySetListParameters } from '@/schema/cost-analysis/cost-query-set/api-verbs/list';
import type { CostQuerySetModel } from '@/schema/cost-analysis/cost-query-set/model';
import { store } from '@/store';
import { i18n } from '@/translations';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';
import { useDashboardStore } from '@/store/dashboard/dashboard-store';
import type { FavoriteItem } from '@/store/modules/favorite/type';
import { FAVORITE_TYPE } from '@/store/modules/favorite/type';
import type { CloudServiceTypeReferenceMap } from '@/store/modules/reference/cloud-service-type/type';
import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { CostDataSourceReferenceMap } from '@/store/reference/cost-data-source-reference-store';
import { useCostDataSourceReferenceStore } from '@/store/reference/cost-data-source-reference-store';
import type { ProjectGroupReferenceMap } from '@/store/reference/project-group-reference-store';
import type { ProjectReferenceMap } from '@/store/reference/project-reference-store';

import { isUserAccessibleToMenu } from '@/lib/access-control';
import {
    convertCloudServiceConfigToReferenceData,
    convertCostAnalysisConfigToReferenceData,
    convertDashboardConfigToReferenceData,
    convertMenuConfigToReferenceData,
    convertProjectConfigToReferenceData,
    convertProjectGroupConfigToReferenceData,
    getParsedKeysWithManagedCostQueryFavoriteKey,
} from '@/lib/helper/config-data-helper';
import type { MenuInfo } from '@/lib/menu/config';
import { MENU_ID } from '@/lib/menu/config';
import { MENU_INFO_MAP } from '@/lib/menu/menu-info';
import { referenceRouter } from '@/lib/reference/referenceRouter';

import ErrorHandler from '@/common/composables/error/errorHandler';
import type { SuggestionItem, SuggestionType } from '@/common/modules/navigations/gnb/modules/gnb-search/config';
import { SUGGESTION_TYPE } from '@/common/modules/navigations/gnb/modules/gnb-search/config';
import TopBarSuggestionList from '@/common/modules/navigations/top-bar/modules/TopBarSuggestionList.vue';

import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/routes/route-constant';
import { COST_EXPLORER_ROUTE } from '@/services/cost-explorer/routes/route-constant';
import { DASHBOARDS_ROUTE } from '@/services/dashboards/routes/route-constant';
import { PROJECT_ROUTE } from '@/services/project/routes/route-constant';


const FAVORITE_LIMIT = 5;

const emit = defineEmits<{(e: 'close'): void;
}>();

const allReferenceStore = useAllReferenceStore();
const dashboardStore = useDashboardStore();
const dashboardGetters = dashboardStore.getters;
const userWorkspaceStore = useUserWorkspaceStore();
const costDataSourceReferenceStore = useCostDataSourceReferenceStore();
const appContextStore = useAppContextStore();
const router = useRouter();

const storeState = reactive({
    currentWorkspaceId: computed<string|undefined>(() => userWorkspaceStore.getters.currentWorkspaceId),
    costDataSource: computed<CostDataSourceReferenceMap>(() => allReferenceStore.getters.costDataSource),
    cloudServiceTypes: computed<CloudServiceTypeReferenceMap>(() => store.getters['reference/cloudServiceTypeItems']),
    projects: computed<ProjectReferenceMap>(() => allReferenceStore.getters.project),
    projectGroups: computed<ProjectGroupReferenceMap>(() => allReferenceStore.getters.projectGroup),
});
const state = reactive({
    loading: true,
    showAll: false,
    showAllType: undefined as undefined|SuggestionType,
    items: computed<SuggestionItem[]>(() => {
        const results: SuggestionItem[] = [];
        if (state.favoriteMenuItems.length) {
            results.push({
                name: 'title', label: i18n.t('COMMON.GNB.FAVORITES.MENU'), type: 'header', itemType: SUGGESTION_TYPE.MENU,
            });
            results.push(...state.favoriteMenuItems.slice(0, FAVORITE_LIMIT));
        }
        if (state.favoriteDashboardItems.length) {
            if (results.length !== 0) results.push({ type: 'divider' });
            results.push({
                name: 'title', label: i18n.t('MENU.DASHBOARDS'), type: 'header', itemType: SUGGESTION_TYPE.DASHBOARD,
            });
            results.push(...state.favoriteDashboardItems.slice(0, FAVORITE_LIMIT));
        }
        if (state.favoriteProjects.length) {
            if (results.length !== 0) results.push({ type: 'divider' });
            results.push({
                name: 'title', label: i18n.t('MENU.PROJECT'), type: 'header', itemType: SUGGESTION_TYPE.PROJECT,
            });
            results.push(...state.favoriteProjects.slice(0, FAVORITE_LIMIT));
        }
        if (state.favoriteCloudServiceItems.length) {
            if (results.length !== 0) results.push({ type: 'divider' });
            results.push({
                name: 'title', label: i18n.t('MENU.ASSET_INVENTORY_CLOUD_SERVICE'), type: 'header', itemType: SUGGESTION_TYPE.CLOUD_SERVICE,
            });
            results.push(...state.favoriteCloudServiceItems.slice(0, FAVORITE_LIMIT));
        }
        if (state.favoriteCostAnalysisItems.length) {
            if (results.length !== 0) results.push({ type: 'divider' });
            results.push({
                name: 'title', label: i18n.t('MENU.COST_EXPLORER_COST_ANALYSIS'), type: 'header', itemType: SUGGESTION_TYPE.COST_ANALYSIS,
            });
            results.push(...state.favoriteCostAnalysisItems.slice(0, FAVORITE_LIMIT));
        }
        return results;
    }),
    allItems: computed<SuggestionItem[]>(() => {
        let items: FavoriteItem[] = [];
        let label: TranslateResult = '';
        if (state.showAllType === SUGGESTION_TYPE.MENU) {
            items = state.favoriteMenuItems;
            label = i18n.t('COMMON.GNB.FAVORITES.ALL_MENU');
        }
        if (state.showAllType === SUGGESTION_TYPE.DASHBOARD) {
            items = state.favoriteDashboardItems;
            label = i18n.t('COMMON.GNB.FAVORITES.ALL_DASHBOARDS');
        }
        if (state.showAllType === SUGGESTION_TYPE.PROJECT) {
            items = state.favoriteProjects;
            label = i18n.t('COMMON.GNB.FAVORITES.ALL_PROJECTS');
        }
        if (state.showAllType === SUGGESTION_TYPE.CLOUD_SERVICE) {
            items = state.favoriteCloudServiceItems;
            label = i18n.t('COMMON.GNB.FAVORITES.ALL_CLOUD_SERVICES');
        }
        if (state.showAllType === SUGGESTION_TYPE.COST_ANALYSIS) {
            items = state.favoriteCostAnalysisItems;
            label = i18n.t('COMMON.GNB.FAVORITES.ALL_COST_ANALYSIS');
        }
        return [
            {
                name: 'title', type: 'header', label, itemType: state.showAllType,
            },
            ...items,
        ];
    }),
    //
    costQuerySets: [] as CostQuerySetModel[],
    //
    favoriteItemsMapFilterByWorkspaceId: computed(() => ({
        [FAVORITE_TYPE.MENU]: (store.state.favorite.menuItems ?? []).filter((item) => item.workspaceId === storeState.currentWorkspaceId),
        [FAVORITE_TYPE.PROJECT]: (store.state.favorite.projectItems ?? []).filter((item) => item.workspaceId === storeState.currentWorkspaceId),
        [FAVORITE_TYPE.PROJECT_GROUP]: (store.state.favorite.projectGroupItems ?? []).filter((item) => item.workspaceId === storeState.currentWorkspaceId),
        [FAVORITE_TYPE.CLOUD_SERVICE]: (store.state.favorite.cloudServiceItems ?? []).filter((item) => item.workspaceId === storeState.currentWorkspaceId),
        [FAVORITE_TYPE.DASHBOARD]: (store.state.favorite.dashboardItems ?? []).filter((item) => item.workspaceId === storeState.currentWorkspaceId),
        [FAVORITE_TYPE.COST_ANALYSIS]: (store.state.favorite.costAnalysisItems ?? []).filter((item) => item.workspaceId === storeState.currentWorkspaceId),
    })),
    favoriteMenuItems: computed<FavoriteItem[]>(() => convertMenuConfigToReferenceData(
        state.favoriteItemsMapFilterByWorkspaceId[FAVORITE_TYPE.MENU],
        store.getters['display/allMenuList'],
    )),
    favoriteCostAnalysisItems: computed<FavoriteItem[]>(() => {
        const isUserAccessible = isUserAccessibleToMenu(MENU_ID.COST_ANALYSIS, store.getters['user/pageAccessPermissionList']);
        return isUserAccessible
            ? convertCostAnalysisConfigToReferenceData(
                state.favoriteItemsMapFilterByWorkspaceId[FAVORITE_TYPE.COST_ANALYSIS],
                state.costQuerySets,
                storeState.costDataSource,
            )
            : [];
    }),
    favoriteDashboardItems: computed<FavoriteItem[]>(() => {
        const isUserAccessibleToDashboards = isUserAccessibleToMenu(MENU_ID.DASHBOARDS, store.getters['user/pageAccessPermissionList']);
        if (!isUserAccessibleToDashboards) return [];
        return convertDashboardConfigToReferenceData(
            state.favoriteItemsMapFilterByWorkspaceId[FAVORITE_TYPE.DASHBOARD],
            dashboardGetters.allItems,
        );
    }),
    favoriteCloudServiceItems: computed<FavoriteItem[]>(() => {
        const isUserAccessible = isUserAccessibleToMenu(MENU_ID.CLOUD_SERVICE, store.getters['user/pageAccessPermissionList']);
        return isUserAccessible ? convertCloudServiceConfigToReferenceData(
            state.favoriteItemsMapFilterByWorkspaceId[FAVORITE_TYPE.CLOUD_SERVICE],
            storeState.cloudServiceTypes,
        ) : [];
    }),
    favoriteProjects: computed<FavoriteItem[]>(() => {
        const isUserAccessible = isUserAccessibleToMenu(MENU_ID.PROJECT, store.getters['user/pageAccessPermissionList']);
        if (!isUserAccessible) return [];
        const favoriteProjectItems = convertProjectConfigToReferenceData(state.favoriteItemsMapFilterByWorkspaceId[FAVORITE_TYPE.PROJECT], storeState.projects);
        const favoriteProjectGroupItems = convertProjectGroupConfigToReferenceData(state.favoriteItemsMapFilterByWorkspaceId[FAVORITE_TYPE.PROJECT_GROUP], storeState.projectGroups);
        return [...favoriteProjectGroupItems, ...favoriteProjectItems];
    }),
});

/* Util */
const getItemLength = (type: SuggestionType): number => {
    if (type === SUGGESTION_TYPE.MENU) return state.favoriteMenuItems.length;
    if (type === SUGGESTION_TYPE.DASHBOARD) return state.favoriteDashboardItems.length;
    if (type === SUGGESTION_TYPE.PROJECT) return state.favoriteProjects.length;
    if (type === SUGGESTION_TYPE.CLOUD_SERVICE) return state.favoriteCloudServiceItems.length;
    if (type === SUGGESTION_TYPE.COST_ANALYSIS) return state.favoriteCostAnalysisItems.length;
    return 0;
};

/* Event */
const handleClickMenuButton = (type: SuggestionType) => {
    // Dashboard and Cost Analysis are added after (Planning).
    if (type === SUGGESTION_TYPE.PROJECT) {
        router.replace({
            name: PROJECT_ROUTE._NAME,
        });
    } else if (type === SUGGESTION_TYPE.CLOUD_SERVICE) {
        router.replace({
            name: ASSET_INVENTORY_ROUTE.CLOUD_SERVICE._NAME,
        });
    }
    emit('close');
};
const handleClickShowAll = (type: SuggestionType) => {
    state.showAll = true;
    state.showAllType = type;
};
const handleGoBack = () => {
    state.showAll = false;
    state.showAllType = undefined;
};
const handleSelect = (item: SuggestionItem) => {
    const itemName = item.name as string;
    if (item.itemType === SUGGESTION_TYPE.MENU) {
        const menuInfo: MenuInfo = MENU_INFO_MAP[itemName];
        if (menuInfo && router.currentRoute.name !== itemName) {
            router.push({ name: menuInfo.routeName }).catch(() => {});
        }
    } else if (item.itemType === SUGGESTION_TYPE.DASHBOARD) {
        router.push({
            name: DASHBOARDS_ROUTE.DETAIL._NAME,
            params: {
                dashboardId: itemName,
            },
        }).catch(() => {});
    } else if (item.itemType === SUGGESTION_TYPE.PROJECT) {
        router.push(referenceRouter(itemName, { resource_type: 'identity.Project' })).catch(() => {});
    } else if (item.itemType === SUGGESTION_TYPE.PROJECT_GROUP) {
        router.push(referenceRouter(itemName, { resource_type: 'identity.ProjectGroup' })).catch(() => {});
    } else if (item.itemType === SUGGESTION_TYPE.CLOUD_SERVICE) {
        const itemInfo: string[] = itemName.split('.');
        router.push({
            name: ASSET_INVENTORY_ROUTE.CLOUD_SERVICE.DETAIL._NAME,
            params: {
                provider: itemInfo[0],
                group: itemInfo[1],
                name: itemInfo[2],
            },
        }).catch(() => {});
    } else if (item.itemType === SUGGESTION_TYPE.COST_ANALYSIS) {
        const dataSourceId = state.favoriteCostAnalysisItems.find((d) => d.name === itemName)?.dataSourceId;
        const parsedKeys = getParsedKeysWithManagedCostQueryFavoriteKey(itemName);
        router.push({
            name: COST_EXPLORER_ROUTE.COST_ANALYSIS.QUERY_SET._NAME,
            params: {
                dataSourceId,
                costQuerySetId: parsedKeys ? parsedKeys[1] : itemName,
            },
        }).catch(() => {});
    }
    emit('close');
};

const listCostQuerySetByDataSourceId = async (dataSourceId: string): Promise<CostQuerySetModel[]> => {
    try {
        const res = await SpaceConnector.clientV2.costAnalysis.costQuerySet.list<CostQuerySetListParameters, ListResponse<CostQuerySetModel>>({
            data_source_id: dataSourceId,
            query: {
                filter: [
                    { k: 'user_id', v: store.state.user.userId, o: 'eq' },
                    { k: 'workspace_id', v: storeState.currentWorkspaceId, o: 'eq' },
                ],
                only: ['cost_query_set_id', 'data_source_id', 'name'],
            },
        });
        return res.results ?? [];
    } catch (e) {
        ErrorHandler.handleError(e);
        return [];
    }
};
const fetchCostQuerySet = async () => {
    const costQuerySetPromiseResults = await Promise.allSettled(
        Object.keys(storeState.costDataSource).map((dataSourceId) => listCostQuerySetByDataSourceId(dataSourceId)),
    );
    const costQuerySets: CostQuerySetModel[] = [];
    costQuerySetPromiseResults.forEach((res) => {
        if (res.status === 'fulfilled' && res.value.length) {
            res.value.forEach((item) => {
                costQuerySets.push(item);
            });
        }
    });
    state.costQuerySets = costQuerySets;
};

/* Init */
(async () => {
    state.loading = true;
    await Promise.allSettled([
        store.dispatch('favorite/load', FAVORITE_TYPE.MENU),
        store.dispatch('favorite/load', FAVORITE_TYPE.PROJECT),
        store.dispatch('favorite/load', FAVORITE_TYPE.PROJECT_GROUP),
        store.dispatch('favorite/load', FAVORITE_TYPE.CLOUD_SERVICE),
        store.dispatch('favorite/load', FAVORITE_TYPE.DASHBOARD),
        store.dispatch('favorite/load', FAVORITE_TYPE.COST_ANALYSIS),
        dashboardStore.load(),
        // TODO: If GNBDashboardMenu is deprecated, you need to add a request to receive a dashboard list here.
    ]);
    state.loading = false;
})();

watch([
    () => costDataSourceReferenceStore.getters.hasLoaded,
    () => appContextStore.getters.globalGrantLoading,
    () => store.getters['user/getCurrentGrantInfo'],
], ([hasLoaded, loading, grantInfo]) => {
    if (hasLoaded && !loading && grantInfo === 'WORKSPACE') fetchCostQuerySet();
}, { immediate: true });
</script>

<template>
    <div class="top-bar-favorite">
        <p-data-loader :data="state.items"
                       :loading="state.loading"
                       :class="{ loading: state.loading }"
        >
            <top-bar-suggestion-list :items="state.showAll ? state.allItems : state.items"
                                     use-favorite
                                     @close="$emit('close')"
                                     @select="handleSelect"
            >
                <template #header-title="{ item }">
                    <template v-if="!state.showAll">
                        <div class="context-header">
                            {{ item.label }}
                            <div v-if="getItemLength(item.itemType) > FAVORITE_LIMIT"
                                 class="show-all-button"
                                 @click="handleClickShowAll(item.itemType)"
                            >
                                <span class="text">{{ $t('COMMON.GNB.FAVORITES.SHOW_ALL') }}</span>
                                <p-i name="ic_chevron-right"
                                     width="1rem"
                                     height="1rem"
                                     color="inherit"
                                />
                            </div>
                        </div>
                    </template>
                    <template v-else>
                        <div class="all-items-header">
                            <p-icon-button name="ic_arrow-left"
                                           size="sm"
                                           @click="handleGoBack"
                            />
                            <span class="title-text">{{ item.label }}</span>
                        </div>
                    </template>
                </template>
            </top-bar-suggestion-list>
            <template #no-data>
                <p-empty
                    show-image
                    show-button
                >
                    <template #image>
                        <img alt="empty-image"
                             src="@/assets/images/illust_star.svg"
                        >
                    </template>
                    <template #button>
                        <p-button style-type="tertiary"
                                  size="md"
                                  @click="handleClickMenuButton(FAVORITE_TYPE.PROJECT)"
                        >
                            {{ $t('COMMON.GNB.FAVORITES.GO_TO_PROJECT') }}
                        </p-button>
                        <p-button style-type="tertiary"
                                  size="md"
                                  @click="handleClickMenuButton(FAVORITE_TYPE.CLOUD_SERVICE)"
                        >
                            {{ $t('COMMON.GNB.FAVORITES.GO_TO_CLOUD_SERVICE') }}
                        </p-button>
                    </template>
                    {{ $t('COMMON.GNB.FAVORITES.FAVORITES_HELP_TEXT') }}
                </p-empty>
            </template>
        </p-data-loader>
    </div>
</template>

<style lang="postcss" scoped>
.top-bar-favorite {
    /* custom design-system component - p-data-loader */
    :deep(.p-data-loader) {
        &.loading {
            height: 15rem;
        }
        .data-loader-container {
            max-height: calc(100vh - $top-bar-height - 3.75rem);
            overflow-y: auto;
            padding: 1rem 0;
        }
    }

    /* custom gnb-suggestion-list */
    :deep(.top-bar-search-suggestion-list) {
        .context-header {
            display: flex;
            justify-content: space-between;
            .show-all-button {
                @apply text-blue-700;
                font-size: 0.75rem;
                cursor: pointer;
                .text {
                    font-weight: normal;
                }
                &:hover {
                    .text {
                        text-decoration: underline;
                    }
                }
            }
        }
        .all-items-header {
            display: flex;
            align-items: center;
            font-size: 0.875rem;
            font-weight: 700;
            padding-bottom: 0.5rem;
        }
    }
}

/* custom design-system component - p-empty */
:deep(.p-empty) {
    text-align: center;
    padding: 3rem 3.25rem;
    .button-wrapper {
        display: flex;
        gap: 0.5rem;
        justify-content: center;
    }
}
</style>
