<template>
    <div class="gnb-favorite">
        <p-data-loader :data="items"
                       :loading="loading"
                       :class="{ loading: loading }"
        >
            <g-n-b-suggestion-list :items="showAll ? allItems : items"
                                   use-favorite
                                   @close="$emit('close')"
                                   @select="handleSelect"
            >
                <template #header-title="{ item }">
                    <template v-if="!showAll">
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
            </g-n-b-suggestion-list>
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

<script lang="ts">
import type { SetupContext } from 'vue';
import { computed, reactive, toRefs } from 'vue';
import type { TranslateResult } from 'vue-i18n';

import {
    PButton, PDataLoader, PEmpty, PI, PIconButton,
} from '@spaceone/design-system';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { getCancellableFetcher } from '@cloudforet/core-lib/space-connector/cancallable-fetcher';

import { SpaceRouter } from '@/router';
import type { DashboardModel } from '@/schema/dashboard/dashboard/model';
import { store } from '@/store';
import { i18n } from '@/translations';

import { useDashboardStore } from '@/store/dashboard/dashboard-store';
import type { FavoriteItem } from '@/store/modules/favorite/type';
import { FAVORITE_TYPE } from '@/store/modules/favorite/type';
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
    getParsedKeysWithManagedCostQueryFavoriteKey,
} from '@/lib/helper/config-data-helper';
import type { MenuInfo } from '@/lib/menu/config';
import { MENU_ID } from '@/lib/menu/config';
import { MENU_INFO_MAP } from '@/lib/menu/menu-info';
import { referenceRouter } from '@/lib/reference/referenceRouter';

import ErrorHandler from '@/common/composables/error/errorHandler';
import type { SuggestionItem, SuggestionType } from '@/common/modules/navigations/gnb/modules/gnb-search/config';
import { SUGGESTION_TYPE } from '@/common/modules/navigations/gnb/modules/gnb-search/config';
import GNBSuggestionList from '@/common/modules/navigations/gnb/modules/GNBSuggestionList.vue';

import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/routes/route-constant';
import { COST_EXPLORER_ROUTE } from '@/services/cost-explorer/routes/route-constant';
import type { CostQuerySetModel } from '@/services/cost-explorer/types/cost-explorer-query-type';
import { DASHBOARDS_ROUTE } from '@/services/dashboards/routes/route-constant';
import { PROJECT_ROUTE } from '@/services/project/routes/route-constant';


const FAVORITE_LIMIT = 5;

export default {
    name: 'GNBFavorite',
    components: {
        GNBSuggestionList,
        PDataLoader,
        PButton,
        PI,
        PIconButton,
        PEmpty,
    },
    props: {},
    setup(props, { emit }: SetupContext) {
        const allReferenceStore = useAllReferenceStore();
        const dashboardStore = useDashboardStore();
        const dashboardGetters = dashboardStore.getters;

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
            cloudServiceTypes: computed<CloudServiceTypeReferenceMap>(() => store.getters['reference/cloudServiceTypeItems']),
            projects: computed<ProjectReferenceMap>(() => store.getters['reference/projectItems']),
            projectGroups: computed<ProjectGroupReferenceMap>(() => store.getters['reference/projectGroupItems']),
            costQuerySets: [] as CostQuerySetModel[],
            workspaceDashboardItems: computed<DashboardModel[]>(() => {
                const isUserAccessibleToWorkspaceDashboards = isUserAccessibleToMenu(MENU_ID.WORKSPACE_DASHBOARDS, store.getters['user/pagePermissionList']);
                return isUserAccessibleToWorkspaceDashboards ? dashboardGetters.workspaceItems : [];
            }),
            projectDashboardItems: computed<DashboardModel[]>(() => {
                const isUserAccessibleToProjectDashboards = isUserAccessibleToMenu(MENU_ID.PROJECT_DASHBOARDS, store.getters['user/pagePermissionList']);
                return isUserAccessibleToProjectDashboards ? dashboardGetters.projectItems : [];
            }),
            //
            favoriteMenuItems: computed<FavoriteItem[]>(() => convertMenuConfigToReferenceData(
                store.state.favorite.menuItems,
                store.getters['display/allMenuList'],
            )),
            favoriteCostAnalysisItems: computed<FavoriteItem[]>(() => {
                const isUserAccessible = isUserAccessibleToMenu(MENU_ID.COST_ANALYSIS, store.getters['user/pagePermissionList']);
                return isUserAccessible ? convertCostAnalysisConfigToReferenceData(store.state.favorite.costAnalysisItems, state.costQuerySets, state.dataSourceMap) : [];
            }),
            favoriteDashboardItems: computed<FavoriteItem[]>(() => {
                const isUserAccessibleToDashboards = isUserAccessibleToMenu(MENU_ID.DASHBOARDS, store.getters['user/pagePermissionList']);
                if (!isUserAccessibleToDashboards) return [];
                return convertDashboardConfigToReferenceData(
                    store.state.favorite.dashboardItems,
                    [...state.workspaceDashboardItems, ...state.projectDashboardItems],
                );
            }),
            favoriteCloudServiceItems: computed<FavoriteItem[]>(() => {
                const isUserAccessible = isUserAccessibleToMenu(MENU_ID.CLOUD_SERVICE, store.getters['user/pagePermissionList']);
                return isUserAccessible ? convertCloudServiceConfigToReferenceData(
                    store.state.favorite.cloudServiceItems,
                    state.cloudServiceTypes,
                ) : [];
            }),
            favoriteProjects: computed<FavoriteItem[]>(() => {
                const isUserAccessible = isUserAccessibleToMenu(MENU_ID.PROJECT, store.getters['user/pagePermissionList']);
                if (!isUserAccessible) return [];
                const favoriteProjectItems = convertProjectConfigToReferenceData(store.state.favorite.projectItems, state.projects);
                const favoriteProjectGroupItems = convertProjectGroupConfigToReferenceData(store.state.favorite.projectGroupItems, state.projectGroups);
                return [...favoriteProjectGroupItems, ...favoriteProjectItems];
            }),
            dataSourceMap: computed<CostDataSourceReferenceMap>(() => allReferenceStore.getters.costDataSource),
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
                SpaceRouter.router.replace({
                    name: PROJECT_ROUTE._NAME,
                });
            } else if (type === SUGGESTION_TYPE.CLOUD_SERVICE) {
                SpaceRouter.router.replace({
                    name: ASSET_INVENTORY_ROUTE.CLOUD_SERVICE._NAME,
                });
            }
            emit('close');
        };
        const handleClickShowAll = (type: SuggestionType) => {
            state.showAll = true;
            state.showAllType = type;
        };
        const handleShowAll = (type) => {
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
                if (menuInfo && SpaceRouter.router.currentRoute.name !== itemName) {
                    SpaceRouter.router.push({ name: itemName }).catch(() => {});
                }
            } else if (item.itemType === SUGGESTION_TYPE.DASHBOARD) {
                const dashboardRouteName = item.name?.startsWith('workspace') ? DASHBOARDS_ROUTE.WORKSPACE.DETAIL._NAME : DASHBOARDS_ROUTE.PROJECT.DETAIL._NAME;
                SpaceRouter.router.push({
                    name: dashboardRouteName,
                    params: {
                        dashboardId: itemName,
                    },
                }).catch(() => {});
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
            } else if (item.itemType === SUGGESTION_TYPE.COST_ANALYSIS) {
                const dataSourceId = state.favoriteCostAnalysisItems.find((d) => d.name === itemName)?.dataSourceId;
                const parsedKeys = getParsedKeysWithManagedCostQueryFavoriteKey(itemName);
                SpaceRouter.router.push({
                    name: COST_EXPLORER_ROUTE.COST_ANALYSIS.QUERY_SET._NAME,
                    params: {
                        dataSourceId,
                        costQuerySetId: parsedKeys ? parsedKeys[1] : itemName,
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
                getAllCostQuerySetList(),
                // TODO: If GNBDashboardMenu is deprecated, you need to add a request to receive a dashboard list here.
            ]);
            state.loading = false;
        })();

        return {
            ...toRefs(state),
            FAVORITE_TYPE,
            FAVORITE_LIMIT,
            handleClickShowAll,
            handleClickMenuButton,
            handleGoBack,
            handleSelect,
            handleShowAll,
            getItemLength,
        };
    },
};
</script>
<style lang="postcss" scoped>
.gnb-favorite {
    /* custom design-system component - p-data-loader */
    :deep(.p-data-loader) {
        &.loading {
            height: 15rem;
        }
        .data-loader-container {
            max-height: calc(100vh - $gnb-height - 3.75rem);
            overflow-y: auto;
            padding: 1rem 0;
        }
    }

    /* custom gnb-suggestion-list */
    :deep(.gnb-search-suggestion-list) {
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
