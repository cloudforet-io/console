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
                                <p-i name="ic_arrow_right" width="1rem" height="1rem"
                                     color="inherit"
                                />
                            </div>
                        </div>
                    </template>
                    <template v-else>
                        <div class="all-items-header">
                            <p-icon-button name="ic_back" size="sm"
                                           @click="handleGoBack"
                            />
                            <span class="title-text">{{ item.label }}</span>
                        </div>
                    </template>
                </template>
            </g-n-b-suggestion-list>
            <template #no-data>
                <div class="no-data">
                    <img class="img" src="@/assets/images/illust_star.svg">
                    <p class="text">
                        {{ $t('COMMON.GNB.FAVORITES.FAVORITES_HELP_TEXT') }}
                    </p>
                    <div class="button-wrapper">
                        <p-button style-type="gray-border"
                                  size="md"
                                  @click="handleClickMenuButton(FAVORITE_TYPE.PROJECT)"
                        >
                            {{ $t('COMMON.GNB.FAVORITES.GO_TO_PROJECT') }}
                        </p-button>
                        <p-button style-type="gray-border"
                                  size="md"
                                  @click="handleClickMenuButton(FAVORITE_TYPE.CLOUD_SERVICE)"
                        >
                            {{ $t('COMMON.GNB.FAVORITES.GO_TO_CLOUD_SERVICE') }}
                        </p-button>
                    </div>
                </div>
            </template>
        </p-data-loader>
    </div>
</template>

<script lang="ts">
import { computed, reactive, toRefs } from '@vue/composition-api';

import {
    PButton, PI, PIconButton, PDataLoader,
} from '@spaceone/design-system';

import GNBSuggestionList from '@/common/modules/navigations/gnb/modules/GNBSuggestionList.vue';

import { PROJECT_ROUTE } from '@/services/project/route-config';
import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/route-config';
import { FAVORITE_TYPE, FavoriteItem } from '@/store/modules/favorite/type';
import { SUGGESTION_TYPE, SuggestionItem, SuggestionType } from '@/common/modules/navigations/gnb/modules/gnb-search/config';
import { SpaceRouter } from '@/router';
import { store } from '@/store';
import { referenceRouter } from '@/lib/reference/referenceRouter';
import {
    convertCloudServiceConfigToReferenceData,
    convertMenuConfigToReferenceData, convertProjectConfigToReferenceData, convertProjectGroupConfigToReferenceData,
} from '@/lib/helper/config-data-helper';
import { CloudServiceTypeReferenceMap } from '@/store/modules/reference/cloud-service-type/type';
import { ProjectReferenceMap } from '@/store/modules/reference/project/type';
import { ProjectGroupReferenceMap } from '@/store/modules/reference/project-group/type';
import { i18n } from '@/translations';
import { TranslateResult } from 'vue-i18n';
import { MENU_INFO_MAP } from '@/lib/menu/menu-info';
import { MENU_ID, MenuInfo } from '@/lib/menu/config';
import { isUserAccessibleToMenu } from '@/lib/access-control';

const FAVORITE_LIMIT = 5;

export default {
    name: 'GNBFavorite',
    components: {
        GNBSuggestionList,
        PDataLoader,
        PButton,
        PI,
        PIconButton,
    },
    props: {},
    setup(props, { emit }) {
        const state = reactive({
            loading: true,
            showAll: false,
            showAllType: undefined as undefined|SuggestionType,
            items: computed<SuggestionItem[]>(() => {
                const results: SuggestionItem[] = [];
                if (state.favoriteMenuItems) {
                    results.push({
                        name: 'title', label: i18n.t('COMMON.GNB.FAVORITES.MENU'), type: 'header', itemType: SUGGESTION_TYPE.MENU,
                    });
                    results.push(...state.favoriteMenuItems.slice(0, FAVORITE_LIMIT));
                }
                if (state.favoriteProjects.length) {
                    if (results.length !== 0) results.push({ type: 'divider' });
                    results.push({
                        name: 'title', label: i18n.t('MENU.PROJECT.PROJECT'), type: 'header', itemType: SUGGESTION_TYPE.PROJECT,
                    });
                    results.push(...state.favoriteProjects.slice(0, FAVORITE_LIMIT));
                }
                if (state.favoriteCloudServiceItems.length) {
                    if (results.length !== 0) results.push({ type: 'divider' });
                    results.push({
                        name: 'title', label: i18n.t('MENU.INVENTORY.CLOUD_SERVICE'), type: 'header', itemType: SUGGESTION_TYPE.CLOUD_SERVICE,
                    });
                    results.push(...state.favoriteCloudServiceItems.slice(0, FAVORITE_LIMIT));
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
                if (state.showAllType === SUGGESTION_TYPE.PROJECT) {
                    items = state.favoriteProjects;
                    label = i18n.t('COMMON.GNB.FAVORITES.ALL_PROJECTS');
                }
                if (state.showAllType === SUGGESTION_TYPE.CLOUD_SERVICE) {
                    items = state.favoriteCloudServiceItems;
                    label = i18n.t('COMMON.GNB.FAVORITES.ALL_CLOUD_SERVICES');
                }
                return [
                    {
                        name: 'title', type: 'header', label, itemType: state.showAllType,
                    },
                    ...items,
                ];
            }),
            //
            cloudServiceTypes: computed<CloudServiceTypeReferenceMap>(() => store.state.reference.cloudServiceType.items),
            projects: computed<ProjectReferenceMap>(() => store.state.reference.project.items),
            projectGroups: computed<ProjectGroupReferenceMap>(() => store.state.reference.projectGroup.items),
            //
            favoriteMenuItems: computed<FavoriteItem[]>(() => convertMenuConfigToReferenceData(
                store.state.favorite.menuItems,
                store.getters['display/allGnbMenuList'],
            )),
            favoriteCloudServiceItems: computed<FavoriteItem[]>(() => {
                const isUserAccessible = isUserAccessibleToMenu(MENU_ID.ASSET_INVENTORY_CLOUD_SERVICE, store.getters['user/pagePermissionList']);
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
        });

        /* Util */
        const getItemLength = (type: SuggestionType): number => {
            if (type === SUGGESTION_TYPE.MENU) return state.favoriteMenuItems.length;
            if (type === SUGGESTION_TYPE.PROJECT) return state.favoriteProjects.length;
            if (type === SUGGESTION_TYPE.CLOUD_SERVICE) return state.favoriteCloudServiceItems.length;
            return 0;
        };

        /* Event */
        const handleClickMenuButton = (type: SuggestionType) => {
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

        /* Init */
        (async () => {
            state.loading = true;
            await Promise.allSettled([
                store.dispatch('reference/project/load'),
                store.dispatch('reference/projectGroup/load'),
                store.dispatch('reference/cloudServiceType/load'),
                store.dispatch('favorite/load', FAVORITE_TYPE.MENU),
                store.dispatch('favorite/load', FAVORITE_TYPE.PROJECT),
                store.dispatch('favorite/load', FAVORITE_TYPE.PROJECT_GROUP),
                store.dispatch('favorite/load', FAVORITE_TYPE.CLOUD_SERVICE),
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
    .p-data-loader::v-deep {
        &.loading {
            height: 15rem;
        }
        .data-loader-container {
            max-height: calc(100vh - $gnb-height - 3.75rem);
            overflow-y: auto;
            padding: 1rem 0;
        }
    }
    .gnb-search-suggestion-list::v-deep {
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
    .no-data {
        text-align: center;
        padding: 3rem 3.25rem;
        .img {
            margin: auto;
        }
        .text {
            @apply text-gray-400;
            font-size: 0.875rem;
            line-height: 1.5;
            padding-top: 1.5rem;
        }
        .button-wrapper {
            display: flex;
            gap: 0.5rem;
            justify-content: center;
            padding-top: 1rem;
            .p-button {
                width: 10.5rem;
            }
        }
    }
}
</style>
