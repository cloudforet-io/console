<script lang="ts" setup>
import {
    computed, reactive,
} from 'vue';
import type { TranslateResult } from 'vue-i18n';
import { useRouter } from 'vue-router/composables';

import {
    PButton, PDataLoader, PEmpty, PI, PIconButton,
} from '@spaceone/design-system';
import type { ContextMenuType, MenuItem } from '@spaceone/design-system/types/inputs/context-menu/type';

import type { CostQuerySetModel } from '@/schema/cost-analysis/cost-query-set/model';
import type { MetricExampleModel } from '@/schema/inventory/metric-example/model';
import { store } from '@/store';
import { i18n } from '@/translations';

import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';
import { useDashboardStore } from '@/store/dashboard/dashboard-store';
import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { CloudServiceTypeReferenceMap } from '@/store/reference/cloud-service-type-reference-store';
import type { CostDataSourceReferenceMap } from '@/store/reference/cost-data-source-reference-store';
import type { MetricReferenceMap } from '@/store/reference/metric-reference-store';
import type { ProjectGroupReferenceMap } from '@/store/reference/project-group-reference-store';
import type { ProjectReferenceMap } from '@/store/reference/project-reference-store';

import { isUserAccessibleToMenu } from '@/lib/access-control';
import {
    convertCloudServiceConfigToReferenceData,
    convertCostAnalysisConfigToReferenceData,
    convertDashboardConfigToReferenceData,
    convertMenuConfigToReferenceData, convertMetricConfigToReferenceData, convertMetricExampleConfigToReferenceData,
    convertProjectConfigToReferenceData,
    convertProjectGroupConfigToReferenceData,
    getParsedKeysWithManagedCostQueryFavoriteKey,
} from '@/lib/helper/config-data-helper';
import type { MenuInfo } from '@/lib/menu/config';
import { MENU_ID } from '@/lib/menu/config';
import { MENU_INFO_MAP } from '@/lib/menu/menu-info';
import { referenceRouter } from '@/lib/reference/referenceRouter';

import { useGrantScopeGuard } from '@/common/composables/grant-scope-guard';
import { useFavoriteStore } from '@/common/modules/favorites/favorite-button/store/favorite-store';
import { FAVORITE_TYPE } from '@/common/modules/favorites/favorite-button/type';
import type { FavoriteItem, FavoriteType } from '@/common/modules/favorites/favorite-button/type';
import { useGnbStore } from '@/common/modules/navigations/stores/gnb-store';
import TopBarSuggestionList from '@/common/modules/navigations/top-bar/modules/TopBarSuggestionList.vue';

import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/routes/route-constant';
import { COST_EXPLORER_ROUTE } from '@/services/cost-explorer/routes/route-constant';
import { DASHBOARDS_ROUTE } from '@/services/dashboards/routes/route-constant';
import { PROJECT_ROUTE } from '@/services/project/routes/route-constant';

const FAVORITE_LIMIT = 5;

export interface FavoriteMenuItem extends MenuItem {
    itemType?: FavoriteType;
    parents?: FavoriteMenuItem[];
    icon?: string;
    defaultIcon?: string;
    provider?: string;
    type?: ContextMenuType;
    name?: string;
    label?: string|TranslateResult;
}

const emit = defineEmits<{(e: 'close'): void;
}>();

const allReferenceStore = useAllReferenceStore();
const dashboardStore = useDashboardStore();
const dashboardGetters = dashboardStore.getters;
const userWorkspaceStore = useUserWorkspaceStore();
const favoriteStore = useFavoriteStore();
const favoriteGetters = favoriteStore.getters;
const gnbStore = useGnbStore();
const gnbStoreGetters = gnbStore.getters;
const router = useRouter();

const storeState = reactive({
    currentWorkspaceId: computed<string|undefined>(() => userWorkspaceStore.getters.currentWorkspaceId),
    costDataSource: computed<CostDataSourceReferenceMap>(() => allReferenceStore.getters.costDataSource),
    cloudServiceTypes: computed<CloudServiceTypeReferenceMap>(() => allReferenceStore.getters.cloudServiceType),
    metrics: computed<MetricReferenceMap>(() => allReferenceStore.getters.metric),
    metricExamples: computed<MetricExampleModel[]>(() => gnbStoreGetters.metricExamples),
    projects: computed<ProjectReferenceMap>(() => allReferenceStore.getters.project),
    projectGroups: computed<ProjectGroupReferenceMap>(() => allReferenceStore.getters.projectGroup),
    costQuerySets: computed<CostQuerySetModel[]>(() => gnbStoreGetters.costQuerySets),
});
const state = reactive({
    loading: true,
    showAll: false,
    showAllType: undefined as undefined|FavoriteType,
    items: computed<FavoriteMenuItem[]>(() => {
        const results: FavoriteMenuItem[] = [];
        if (state.favoriteMenuItems.length) {
            results.push({
                name: 'title', label: i18n.t('COMMON.GNB.FAVORITES.MENU'), type: 'header', itemType: FAVORITE_TYPE.MENU,
            });
            results.push(...state.favoriteMenuItems.slice(0, FAVORITE_LIMIT));
        }
        if (state.favoriteDashboardItems.length) {
            if (results.length !== 0) results.push({ type: 'divider' });
            results.push({
                name: 'title', label: i18n.t('MENU.DASHBOARDS'), type: 'header', itemType: FAVORITE_TYPE.DASHBOARD,
            });
            results.push(...state.favoriteDashboardItems.slice(0, FAVORITE_LIMIT));
        }
        if (state.favoriteProjects.length) {
            if (results.length !== 0) results.push({ type: 'divider' });
            results.push({
                name: 'title', label: i18n.t('MENU.PROJECT'), type: 'header', itemType: FAVORITE_TYPE.PROJECT,
            });
            results.push(...state.favoriteProjects.slice(0, FAVORITE_LIMIT));
        }
        if (state.favoriteCloudServiceItems.length) {
            if (results.length !== 0) results.push({ type: 'divider' });
            results.push({
                name: 'title', label: i18n.t('MENU.ASSET_INVENTORY_CLOUD_SERVICE'), type: 'header', itemType: FAVORITE_TYPE.CLOUD_SERVICE,
            });
            results.push(...state.favoriteCloudServiceItems.slice(0, FAVORITE_LIMIT));
        }
        if (state.favoriteMetricItems.length) {
            if (results.length !== 0) results.push({ type: 'divider' });
            results.push({
                name: 'title', label: i18n.t('MENU.ASSET_INVENTORY_METRIC_EXPLORER'), type: 'header', itemType: FAVORITE_TYPE.METRIC,
            });
            results.push(...state.favoriteMetricItems.slice(0, FAVORITE_LIMIT));
        }
        if (state.favoriteSecurityItems.length) {
            if (results.length !== 0) results.push({ type: 'divider' });
            results.push({
                name: 'title', label: i18n.t('MENU.ASSET_INVENTORY_SECURITY'), type: 'header', itemType: FAVORITE_TYPE.SECURITY,
            });
            results.push(...state.favoriteSecurityItems.slice(0, FAVORITE_LIMIT));
        }
        if (state.favoriteCostAnalysisItems.length) {
            if (results.length !== 0) results.push({ type: 'divider' });
            results.push({
                name: 'title', label: i18n.t('MENU.COST_EXPLORER_COST_ANALYSIS'), type: 'header', itemType: FAVORITE_TYPE.COST_ANALYSIS,
            });
            results.push(...state.favoriteCostAnalysisItems.slice(0, FAVORITE_LIMIT));
        }
        return results;
    }),
    allItems: computed<FavoriteMenuItem[]>(() => {
        let items: FavoriteMenuItem[] = [];
        let label: TranslateResult = '';
        if (state.showAllType === FAVORITE_TYPE.MENU) {
            items = state.favoriteMenuItems;
            label = i18n.t('COMMON.GNB.FAVORITES.ALL_MENU');
        }
        if (state.showAllType === FAVORITE_TYPE.DASHBOARD) {
            items = state.favoriteDashboardItems;
            label = i18n.t('COMMON.GNB.FAVORITES.ALL_DASHBOARD');
        }
        if (state.showAllType === FAVORITE_TYPE.PROJECT) {
            items = state.favoriteProjects;
            label = i18n.t('COMMON.GNB.FAVORITES.ALL_PROJECTS');
        }
        if (state.showAllType === FAVORITE_TYPE.CLOUD_SERVICE) {
            items = state.favoriteCloudServiceItems;
            label = i18n.t('COMMON.GNB.FAVORITES.ALL_CLOUD_SERVICES');
        }
        if (state.showAllType === FAVORITE_TYPE.COST_ANALYSIS) {
            items = state.favoriteCostAnalysisItems;
            label = i18n.t('COMMON.GNB.FAVORITES.ALL_COST_ANALYSIS');
        }
        if (state.showAllType === FAVORITE_TYPE.SECURITY) {
            items = state.favoriteSecurityItems;
            label = i18n.t('COMMON.GNB.FAVORITES.ALL_SECURITY');
        }
        return [
            {
                name: 'title', type: 'header', label, itemType: state.showAllType,
            },
            ...items,
        ];
    }),
    //
    favoriteMenuItems: computed<FavoriteItem[]>(() => convertMenuConfigToReferenceData(
        favoriteGetters.menuItems ?? [],
        store.getters['display/allMenuList'],
    )),
    favoriteCostAnalysisItems: computed<FavoriteItem[]>(() => {
        const isUserAccessible = isUserAccessibleToMenu(MENU_ID.COST_ANALYSIS, store.getters['user/pageAccessPermissionList']);
        return isUserAccessible
            ? convertCostAnalysisConfigToReferenceData(
                favoriteGetters.costAnalysisItems ?? [],
                storeState.costQuerySets,
                storeState.costDataSource,
            )
            : [];
    }),
    favoriteDashboardItems: computed<FavoriteItem[]>(() => {
        const isUserAccessibleToDashboards = isUserAccessibleToMenu(MENU_ID.DASHBOARDS, store.getters['user/pageAccessPermissionList']);
        if (!isUserAccessibleToDashboards) return [];
        return convertDashboardConfigToReferenceData(
            favoriteGetters.dashboardItems ?? [],
            [...dashboardGetters.workspaceItems, ...dashboardGetters.privateItems],
        );
    }),
    favoriteCloudServiceItems: computed<FavoriteItem[]>(() => {
        const isUserAccessible = isUserAccessibleToMenu(MENU_ID.CLOUD_SERVICE, store.getters['user/pageAccessPermissionList']);
        return isUserAccessible ? convertCloudServiceConfigToReferenceData(
            favoriteGetters.cloudServiceItems ?? [],
            storeState.cloudServiceTypes,
        ) : [];
    }),
    favoriteMetricItems: computed<FavoriteItem[]>(() => {
        const isUserAccessible = isUserAccessibleToMenu(MENU_ID.METRIC_EXPLORER, store.getters['user/pageAccessPermissionList']);
        if (!isUserAccessible) return [];
        const favoriteMetricItems = convertMetricConfigToReferenceData(favoriteGetters.metricItems ?? [], storeState.metrics);
        const favoriteMetricExampleItems = convertMetricExampleConfigToReferenceData(favoriteGetters.metricExampleItems ?? [], storeState.metricExamples);
        return [
            ...favoriteMetricItems,
            ...favoriteMetricExampleItems,
        ];
    }),
    favoriteProjects: computed<FavoriteItem[]>(() => {
        const isUserAccessible = isUserAccessibleToMenu(MENU_ID.PROJECT, store.getters['user/pageAccessPermissionList']);
        if (!isUserAccessible) return [];
        const favoriteProjectItems = convertProjectConfigToReferenceData(favoriteGetters.projectItems ?? [], storeState.projects);
        const favoriteProjectGroupItems = convertProjectGroupConfigToReferenceData(favoriteGetters.projectGroupItems ?? [], storeState.projectGroups);
        return [...favoriteProjectGroupItems, ...favoriteProjectItems];
    }),
    favoriteSecurityItems: computed<FavoriteItem[]>(() => {
        const isUserAccessible = isUserAccessibleToMenu(MENU_ID.SECURITY, store.getters['user/pageAccessPermissionList']);
        return isUserAccessible ? convertCloudServiceConfigToReferenceData(
            favoriteGetters.securityItems ?? [],
            storeState.cloudServiceTypes,
        ) : [];
    }),
});

/* Util */
const getItemLength = (type: FavoriteType): number => {
    if (type === FAVORITE_TYPE.MENU) return state.favoriteMenuItems.length;
    if (type === FAVORITE_TYPE.DASHBOARD) return state.favoriteDashboardItems.length;
    if (type === FAVORITE_TYPE.PROJECT) return state.favoriteProjects.length;
    if (type === FAVORITE_TYPE.CLOUD_SERVICE) return state.favoriteCloudServiceItems.length;
    if (type === FAVORITE_TYPE.METRIC) return state.favoriteMetricItems.length;
    if (type === FAVORITE_TYPE.COST_ANALYSIS) return state.favoriteCostAnalysisItems.length;
    if (type === FAVORITE_TYPE.SECURITY) return state.favoriteSecurityItems.length;
    return 0;
};

/* Event */
const handleClickMenuButton = (type: FavoriteType) => {
    // Dashboard and Cost Analysis are added after (Planning).
    if (type === FAVORITE_TYPE.PROJECT) {
        router.replace({
            name: PROJECT_ROUTE._NAME,
        });
    } else if (type === FAVORITE_TYPE.CLOUD_SERVICE) {
        router.replace({
            name: ASSET_INVENTORY_ROUTE.CLOUD_SERVICE._NAME,
        });
    }
    emit('close');
};
const handleClickShowAll = (type: FavoriteType) => {
    state.showAll = true;
    state.showAllType = type;
};
const handleGoBack = () => {
    state.showAll = false;
    state.showAllType = undefined;
};
const handleSelect = (item: FavoriteMenuItem) => {
    const itemName = item.name as string;
    if (item.itemType === FAVORITE_TYPE.MENU) {
        const menuInfo: MenuInfo = MENU_INFO_MAP[itemName];
        if (menuInfo && router.currentRoute.name !== itemName) {
            router.push({ name: menuInfo.routeName }).catch(() => {});
        }
    } else if (item.itemType === FAVORITE_TYPE.DASHBOARD) {
        router.push({
            name: DASHBOARDS_ROUTE.DETAIL._NAME,
            params: {
                dashboardId: itemName,
            },
        }).catch(() => {});
    } else if (item.itemType === FAVORITE_TYPE.PROJECT) {
        router.push(referenceRouter(itemName, { resource_type: 'identity.Project' })).catch(() => {});
    } else if (item.itemType === FAVORITE_TYPE.PROJECT_GROUP) {
        router.push(referenceRouter(itemName, { resource_type: 'identity.ProjectGroup' })).catch(() => {});
    } else if (item.itemType === FAVORITE_TYPE.CLOUD_SERVICE) {
        const itemInfo: string[] = itemName.split('.');
        router.push({
            name: ASSET_INVENTORY_ROUTE.CLOUD_SERVICE.DETAIL._NAME,
            params: {
                provider: itemInfo[0],
                group: itemInfo[1],
                name: itemInfo[2],
            },
        }).catch(() => {});
    } else if (item.itemType === FAVORITE_TYPE.METRIC) {
        router.push({
            name: ASSET_INVENTORY_ROUTE.METRIC_EXPLORER.DETAIL._NAME,
            params: {
                metricId: item.name || '',
            },
        }).catch(() => {});
    } else if (item.itemType === FAVORITE_TYPE.METRIC_EXAMPLE) {
        const metricId = storeState.metricExamples.find((example) => example.example_id === item.name)?.metric_id;
        if (!metricId) return;
        router.push({
            name: ASSET_INVENTORY_ROUTE.METRIC_EXPLORER.DETAIL.EXAMPLE._NAME,
            params: {
                metricId,
                metricExampleId: item.name || '',
            },
        }).catch(() => {});
    } else if (item.itemType === FAVORITE_TYPE.COST_ANALYSIS) {
        const dataSourceId = state.favoriteCostAnalysisItems.find((d) => d.name === itemName)?.dataSourceId;
        const parsedKeys = getParsedKeysWithManagedCostQueryFavoriteKey(itemName);
        router.push({
            name: COST_EXPLORER_ROUTE.COST_ANALYSIS.QUERY_SET._NAME,
            params: {
                dataSourceId,
                costQuerySetId: parsedKeys ? parsedKeys[1] : itemName,
            },
        }).catch(() => {});
    } else if (item.itemType === FAVORITE_TYPE.SECURITY) {
        const itemInfo: string[] = itemName.split('.');
        router.push({
            name: ASSET_INVENTORY_ROUTE.SECURITY.DETAIL._NAME,
            params: {
                provider: itemInfo[0],
                group: itemInfo[1],
                name: itemInfo[2],
            },
        }).catch(() => {});
    }
    emit('close');
};
const handleDeleteItem = (item: FavoriteItem) => {
    favoriteStore.deleteFavorite({
        itemType: item.itemType,
        workspaceId: storeState.currentWorkspaceId || '',
        itemId: item.itemId,
    });
};

/* Init */
const init = async () => {
    state.loading = true;
    await Promise.allSettled([
        favoriteStore.fetchFavorite(),
        gnbStore.fetchMetricExample(),
        gnbStore.fetchCostQuerySet(),
        dashboardStore.load(),
        // TODO: If GNBDashboardMenu is deprecated, you need to add a request to receive a dashboard list here.
    ]);
    state.loading = false;
};
const { callApiWithGrantGuard } = useGrantScopeGuard(['WORKSPACE'], init);
callApiWithGrantGuard();

</script>

<template>
    <div class="top-bar-favorite-context-menu">
        <p-data-loader :data="state.items"
                       :loading="state.loading"
                       :class="{ loading: state.loading }"
        >
            <top-bar-suggestion-list :items="state.showAll ? state.allItems : state.items"
                                     use-favorite
                                     @close="$emit('close')"
                                     @select="handleSelect"
                                     @delete="handleDeleteItem"
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
.top-bar-favorite-context-menu {
    /* custom design-system component - p-data-loader */
    :deep(.p-data-loader) {
        &.loading {
            height: 15rem;
        }
        .data-loader-container {
            max-height: calc(100vh - $top-bar-height - 1.5rem);
            overflow-y: auto;
            padding: 1rem 0.5rem;
        }
    }

    /* custom gnb-suggestion-list */
    :deep(.top-bar-suggestion-list) {
        padding: 0;
        .context-header {
            @apply flex justify-between items-center;
            height: 1.25rem;
            margin: 0;
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
        .context-divider {
            margin-top: 0.75rem;
            margin-bottom: 0.75rem;
        }
        .all-items-header {
            display: flex;
            align-items: center;
            font-size: 0.875rem;
            font-weight: 700;
            padding-bottom: 0.5rem;
        }
        .suggestion-item {
            justify-content: unset;
            .texts {
                flex: unset;
                width: auto;
                .text-item {
                    width: auto;
                }
            }
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
