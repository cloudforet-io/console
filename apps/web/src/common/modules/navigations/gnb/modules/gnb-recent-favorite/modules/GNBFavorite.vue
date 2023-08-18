<script lang="ts" setup>
import {
    PButton, PI, PIconButton, PDataLoader, PEmpty,
} from '@spaceone/design-system';
import { computed, reactive } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';

import type { FavoriteItem } from '@/store/modules/favorite/type';
import { FAVORITE_TYPE } from '@/store/modules/favorite/type';
import type { CloudServiceTypeReferenceMap } from '@/store/modules/reference/cloud-service-type/type';
import type { ProjectReferenceMap } from '@/store/modules/reference/project/type';
import type { ProjectGroupReferenceMap } from '@/store/modules/reference/project-group/type';


import { isUserAccessibleToMenu } from '@/lib/access-control';
import {
    convertCloudServiceConfigToReferenceData,
    convertMenuConfigToReferenceData, convertProjectConfigToReferenceData, convertProjectGroupConfigToReferenceData,
} from '@/lib/helper/config-data-helper';
import type { MenuInfo } from '@/lib/menu/config';
import { MENU_ID } from '@/lib/menu/config';
import { MENU_INFO_MAP } from '@/lib/menu/menu-info';
import { referenceRouter } from '@/lib/reference/referenceRouter';

import type { SuggestionItem, SuggestionType } from '@/common/modules/navigations/gnb/modules/gnb-search/config';
import { SUGGESTION_TYPE } from '@/common/modules/navigations/gnb/modules/gnb-search/config';
import GNBSuggestionList from '@/common/modules/navigations/gnb/modules/GNBSuggestionList.vue';

import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/route-config';
import { PROJECT_ROUTE } from '@/services/project/route-config';


const FAVORITE_LIMIT = 5;

const emit = defineEmits<{(e: 'close'): void}>();
const store = useStore();
const { t } = useI18n();
const router = useRouter();

const state = reactive({
    loading: true,
    showAll: false,
    showAllType: undefined as undefined|SuggestionType,
    items: computed<SuggestionItem[]>(() => {
        const results: SuggestionItem[] = [];
        if (state.favoriteMenuItems.length) {
            results.push({
                name: 'title', label: t('COMMON.GNB.FAVORITES.MENU'), type: 'header', itemType: SUGGESTION_TYPE.MENU,
            });
            results.push(...state.favoriteMenuItems.slice(0, FAVORITE_LIMIT));
        }
        if (state.favoriteProjects.length) {
            if (results.length !== 0) results.push({ type: 'divider' });
            results.push({
                name: 'title', label: t('MENU.PROJECT'), type: 'header', itemType: SUGGESTION_TYPE.PROJECT,
            });
            results.push(...state.favoriteProjects.slice(0, FAVORITE_LIMIT));
        }
        if (state.favoriteCloudServiceItems.length) {
            if (results.length !== 0) results.push({ type: 'divider' });
            results.push({
                name: 'title', label: t('MENU.ASSET_INVENTORY_CLOUD_SERVICE'), type: 'header', itemType: SUGGESTION_TYPE.CLOUD_SERVICE,
            });
            results.push(...state.favoriteCloudServiceItems.slice(0, FAVORITE_LIMIT));
        }
        return results;
    }),
    allItems: computed<SuggestionItem[]>(() => {
        let items: FavoriteItem[] = [];
        let label = '';
        if (state.showAllType === SUGGESTION_TYPE.MENU) {
            items = state.favoriteMenuItems;
            label = t('COMMON.GNB.FAVORITES.ALL_MENU');
        }
        if (state.showAllType === SUGGESTION_TYPE.PROJECT) {
            items = state.favoriteProjects;
            label = t('COMMON.GNB.FAVORITES.ALL_PROJECTS');
        }
        if (state.showAllType === SUGGESTION_TYPE.CLOUD_SERVICE) {
            items = state.favoriteCloudServiceItems;
            label = t('COMMON.GNB.FAVORITES.ALL_CLOUD_SERVICES');
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
    //
    favoriteMenuItems: computed<FavoriteItem[]>(() => convertMenuConfigToReferenceData(
        store.state.favorite.menuItems,
        store.getters['display/allMenuList'],
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
        if (menuInfo && router.currentRoute.value.name !== itemName) {
            router.push({ name: itemName }).catch(() => {});
        }
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
    }
    emit('close');
};
const handleClickClose = () => {
    emit('close');
};

/* Init */
(async () => {
    state.loading = true;
    await Promise.allSettled([
        store.dispatch('favorite/load', FAVORITE_TYPE.MENU),
        store.dispatch('favorite/load', FAVORITE_TYPE.PROJECT),
        store.dispatch('favorite/load', FAVORITE_TYPE.PROJECT_GROUP),
        store.dispatch('favorite/load', FAVORITE_TYPE.CLOUD_SERVICE),
    ]);
    state.loading = false;
})();

</script>

<template>
    <div class="gnb-favorite">
        <p-data-loader :data="state.items"
                       :loading="state.loading"
                       :class="{ loading: state.loading }"
        >
            <g-n-b-suggestion-list :items="state.showAll ? state.allItems : state.items"
                                   use-favorite
                                   @close="handleClickClose"
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
                                <span class="text">{{ t('COMMON.GNB.FAVORITES.SHOW_ALL') }}</span>
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
                            {{ t('COMMON.GNB.FAVORITES.GO_TO_PROJECT') }}
                        </p-button>
                        <p-button style-type="tertiary"
                                  size="md"
                                  @click="handleClickMenuButton(FAVORITE_TYPE.CLOUD_SERVICE)"
                        >
                            {{ t('COMMON.GNB.FAVORITES.GO_TO_CLOUD_SERVICE') }}
                        </p-button>
                    </template>
                    {{ t('COMMON.GNB.FAVORITES.FAVORITES_HELP_TEXT') }}
                </p-empty>
            </template>
        </p-data-loader>
    </div>
</template>

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
