<script lang="ts" setup>
import {
    computed, reactive,
} from 'vue';
import type { TranslateResult } from 'vue-i18n';
import { useRouter } from 'vue-router/composables';

import { isEmpty } from 'lodash';

import {
    PButton, PDataLoader, PEmpty, PI, PIconButton,
} from '@cloudforet/mirinae';
import type { ContextMenuType, MenuItem } from '@cloudforet/mirinae/types/controls/context-menu/type';

import { i18n } from '@/translations';

import { useReferenceRouter } from '@/router/composables/use-reference-router';

import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';
import { useAuthorizationStore } from '@/store/authorization/authorization-store';

import {
    getParsedKeysWithManagedCostQueryFavoriteKey,
} from '@/lib/helper/config-data-helper';
import type { MenuId, MenuInfo } from '@/lib/menu/config';
import { MENU_ID } from '@/lib/menu/config';
import { MENU_INFO_MAP } from '@/lib/menu/menu-info';

import { useMetricExampleFavoriteMap } from '@/common/modules/navigations/top-bar/modules/top-bar-toolset/modules/top-bar-favorite/composables/use-metric-example-favorite-map';
import TopBarSuggestionList from '@/common/modules/navigations/top-bar/modules/TopBarSuggestionList.vue';
import { useFavoriteDeleteMutation } from '@/common/modules/user-config/favorite/core/use-favorite-delete-mutation';
import { useFavoriteList } from '@/common/modules/user-config/favorite/core/use-favorite-list';
import { FAVORITE_TYPE } from '@/common/modules/user-config/favorite/favorite-button/type';
import type { FavoriteItem, FavoriteType } from '@/common/modules/user-config/favorite/favorite-button/type';
import type { ReferenceData } from '@/common/modules/user-config/shared/use-convert-referenced-config-data';
import { useConvertReferencedConfigData } from '@/common/modules/user-config/shared/use-convert-referenced-config-data';

import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/routes/route-constant';
import { COST_EXPLORER_ROUTE } from '@/services/cost-explorer/routes/route-constant';
import { DASHBOARDS_ROUTE } from '@/services/dashboards/routes/route-constant';
import { PROJECT_ROUTE_V2 } from '@/services/project/v2/routes/route-constant';

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

const userWorkspaceStore = useUserWorkspaceStore();
const authorizationStore = useAuthorizationStore();
const { getReferenceLocation } = useReferenceRouter();


/* Favorite */
const { loading: isLoadingFavoriteList, ...favoriteConfigData } = useFavoriteList();
const { loading: isLoadingConvertedConfigData, ...convertedConfigMap } = useConvertReferencedConfigData({
    allConfigList: favoriteConfigData.favoriteMenuList,
    projectConfigList: favoriteConfigData.projectItems,
    projectGroupConfigList: favoriteConfigData.projectGroupItems,
    metricConfigList: favoriteConfigData.metricItems,
    metricExampleConfigList: favoriteConfigData.metricExampleItems,
    serviceConfigList: favoriteConfigData.serviceItems,
    dashboardConfigList: favoriteConfigData.dashboardItems,
    costQuerySetConfigList: favoriteConfigData.costAnalysisItems,
    cloudServiceConfigList: favoriteConfigData.cloudServiceTypeItems,
});
const { mutateAsync: deleteFavorite, isPending: isDeletingFavorite } = useFavoriteDeleteMutation();
const { map: metricExampleMap } = useMetricExampleFavoriteMap();


const router = useRouter();

const storeState = reactive({
    currentWorkspaceId: computed<string|undefined>(() => userWorkspaceStore.getters.currentWorkspaceId),
    pageAccessPermissionList: computed<MenuId[]>(() => authorizationStore.getters.pageAccessPermissionList),
});
const state = reactive({
    loading: computed(() => isLoadingFavoriteList.value || isLoadingConvertedConfigData.value),
    showAll: false,
    showAllType: undefined as undefined|FavoriteType,
    accessProject: computed<boolean>(() => !isEmpty(authorizationStore.getters.pageAccessPermissionMap[MENU_ID.PROJECT])),
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
        if (state.favoriteMetricItems.length) {
            if (results.length !== 0) results.push({ type: 'divider' });
            results.push({
                name: 'title', label: i18n.t('MENU.ASSET_INVENTORY_METRIC_EXPLORER'), type: 'header', itemType: FAVORITE_TYPE.METRIC,
            });
            results.push(...state.favoriteMetricItems.slice(0, FAVORITE_LIMIT));
        }
        if (state.favoriteCostAnalysisItems.length) {
            if (results.length !== 0) results.push({ type: 'divider' });
            results.push({
                name: 'title', label: i18n.t('MENU.COST_EXPLORER_COST_ANALYSIS'), type: 'header', itemType: FAVORITE_TYPE.COST_ANALYSIS,
            });
            results.push(...state.favoriteCostAnalysisItems.slice(0, FAVORITE_LIMIT));
        }
        if (state.favoriteServiceItems.length) {
            if (results.length !== 0) results.push({ type: 'divider' });
            results.push({
                name: 'title', label: i18n.t('MENU.ALERT_MANAGER_SERVICE'), type: 'header', itemType: FAVORITE_TYPE.SERVICE,
            });
            results.push(...state.favoriteServiceItems.slice(0, FAVORITE_LIMIT));
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
        if (state.showAllType === FAVORITE_TYPE.METRIC) {
            items = state.favoriteMetricItems;
            label = i18n.t('COMMON.GNB.FAVORITES.ALL_METRIC');
        }
        if (state.showAllType === FAVORITE_TYPE.COST_ANALYSIS) {
            items = state.favoriteCostAnalysisItems;
            label = i18n.t('COMMON.GNB.FAVORITES.ALL_COST_ANALYSIS');
        }
        if (state.showAllType === FAVORITE_TYPE.SERVICE) {
            items = state.favoriteServiceItems;
            label = i18n.t('COMMON.GNB.FAVORITES.ALL_SERVICE');
        }
        return [
            {
                name: 'title', type: 'header', label, itemType: state.showAllType,
            },
            ...items,
        ];
    }),
    //
    favoriteMenuItems: computed<ReferenceData[]>(() => convertedConfigMap.convertedMenu.value),
    favoriteCostAnalysisItems: computed<ReferenceData[]>(() => {
        const isUserAccessible = isUserAccessibleToMenu(MENU_ID.COST_ANALYSIS, storeState.pageAccessPermissionList);
        if (!isUserAccessible) return [];
        return convertedConfigMap.convertedCostQuerySet.value;
    }),
    favoriteDashboardItems: computed<ReferenceData[]>(() => {
        const isUserAccessibleToDashboards = isUserAccessibleToMenu(MENU_ID.DASHBOARDS, storeState.pageAccessPermissionList);
        if (!isUserAccessibleToDashboards) return [];
        return convertedConfigMap.convertedDashboard.value;
    }),
    favoriteMetricItems: computed<ReferenceData[]>(() => {
        const isUserAccessible = isUserAccessibleToMenu(MENU_ID.METRIC_EXPLORER, storeState.pageAccessPermissionList);
        if (!isUserAccessible) return [];
        return [
            ...convertedConfigMap.convertedMetric.value,
            ...convertedConfigMap.convertedMetricExample.value,
        ];
    }),
    favoriteProjects: computed<ReferenceData[]>(() => {
        const isUserAccessible = isUserAccessibleToMenu(MENU_ID.PROJECT, storeState.pageAccessPermissionList);
        if (!isUserAccessible) return [];
        return [
            ...convertedConfigMap.convertedProjectGroup.value,
            ...convertedConfigMap.convertedProject.value,
        ];
    }),
    favoriteServiceItems: computed<ReferenceData[]>(() => {
        const isUserAccessible = isUserAccessibleToMenu(MENU_ID.SERVICE, storeState.pageAccessPermissionList);
        if (!isUserAccessible) return [];
        return convertedConfigMap.convertedService.value;
    }),
});

/* Util */
const getItemLength = (type: FavoriteType): number => {
    if (type === FAVORITE_TYPE.MENU) return state.favoriteMenuItems.length;
    if (type === FAVORITE_TYPE.DASHBOARD) return state.favoriteDashboardItems.length;
    if (type === FAVORITE_TYPE.PROJECT) return state.favoriteProjects.length;
    if (type === FAVORITE_TYPE.METRIC) return state.favoriteMetricItems.length;
    if (type === FAVORITE_TYPE.COST_ANALYSIS) return state.favoriteCostAnalysisItems.length;
    return 0;
};
const isUserAccessibleToMenu = (menuId: MenuId, pageAccessList: MenuId[]): boolean => pageAccessList.some((id) => id === menuId);


/* Event */
const handleClickMenuButton = (type: FavoriteType) => {
    // Dashboard and Cost Analysis are added after (Planning).
    if (type === FAVORITE_TYPE.PROJECT) {
        router.replace({
            name: PROJECT_ROUTE_V2._NAME,
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
        router.push(getReferenceLocation(itemName, { resource_type: 'identity.Project' })).catch(() => {});
    } else if (item.itemType === FAVORITE_TYPE.PROJECT_GROUP) {
        router.push(getReferenceLocation(itemName, { resource_type: 'identity.ProjectGroup' })).catch(() => {});
    } else if (item.itemType === FAVORITE_TYPE.METRIC) {
        router.push({
            name: ASSET_INVENTORY_ROUTE.METRIC_EXPLORER.DETAIL._NAME,
            params: {
                metricId: item.name || '',
            },
        }).catch(() => {});
    } else if (item.itemType === FAVORITE_TYPE.METRIC_EXAMPLE) {
        const exampleId = item.name || '';
        const relatedMetric = metricExampleMap.value.get(exampleId);
        if (!relatedMetric) return;
        router.push({
            name: ASSET_INVENTORY_ROUTE.METRIC_EXPLORER.DETAIL.EXAMPLE._NAME,
            params: {
                metricId: relatedMetric.metric_id,
                metricExampleId: exampleId,
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
    }
    emit('close');
};
const handleDeleteItem = (item: FavoriteItem) => {
    if (isDeletingFavorite.value) return;
    deleteFavorite({
        itemType: item.itemType,
        workspaceId: storeState.currentWorkspaceId || '',
        itemId: item.itemId,
    });
};

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
                        <p-button v-if="state.accessProject"
                                  style-type="tertiary"
                                  size="md"
                                  @click="handleClickMenuButton(FAVORITE_TYPE.PROJECT)"
                        >
                            {{ $t('COMMON.GNB.FAVORITES.GO_TO_PROJECT') }}
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
