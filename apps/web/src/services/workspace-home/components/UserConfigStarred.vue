<script setup lang="ts">
import { useWindowSize } from '@vueuse/core';
import { computed, reactive, watch } from 'vue';

import {
    PFieldTitle, PSelectDropdown, PI, PPagination, PLink, screens,
} from '@cloudforet/mirinae';
import type { SelectDropdownMenuItem } from '@cloudforet/mirinae/types/controls/dropdown/select-dropdown/type';

import { i18n } from '@/translations';

import { useFavoriteStore } from '@/common/modules/favorites/favorite-button/store/favorite-store';
import type { FavoriteItem } from '@/common/modules/favorites/favorite-button/type';
import { FAVORITE_TYPE } from '@/common/modules/favorites/favorite-button/type';

import UserConfigsItem from '@/services/workspace-home/components/UserConfigsItem.vue';
import { STARRED_SERVICE_ITEMS } from '@/services/workspace-home/constants/workspace-home-constant';
import { useWorkspaceHomePageStore } from '@/services/workspace-home/store/workspace-home-page-store';
import type { StarredServiceItem } from '@/services/workspace-home/types/workspace-home-type';

const favoriteStore = useFavoriteStore();
const favoriteGetters = favoriteStore.getters;
const workspaceHomePageStore = useWorkspaceHomePageStore();
const workspaceHomePageState = workspaceHomePageStore.state;

const { width } = useWindowSize();

const storeState = reactive({
    favoriteMenuList: computed<FavoriteItem[]>(() => workspaceHomePageState.favoriteMenuList),
});
const state = reactive({
    pageStart: 1,
    isLaptopSize: computed<boolean>(() => width.value < screens.laptop.max),
    starredServiceItem: computed<StarredServiceItem[]>(() => (state.isLaptopSize ? STARRED_SERVICE_ITEMS.slice(0, 2) : STARRED_SERVICE_ITEMS)),
    excludedCloudServiceTypeFavoriteMenuList: computed<FavoriteItem[]>(() => storeState.favoriteMenuList.filter(
        (item) => (FAVORITE_TYPE.CLOUD_SERVICE !== item.itemType && FAVORITE_TYPE.SECURITY !== item.itemType),
    )),
    slicedFavoriteMenuList: computed<FavoriteItem[]>(() => state.excludedCloudServiceTypeFavoriteMenuList.slice((state.pageStart - 1) * 10, state.pageStart * 10)),
    isFavoriteMenuListExist: computed<boolean>(() => state.excludedCloudServiceTypeFavoriteMenuList.length > 0),
});
const dropdownState = reactive({
    dropdownMenuList: computed<SelectDropdownMenuItem[]>(() => {
        const results: SelectDropdownMenuItem[] = [{
            name: 'All', label: i18n.t('HOME.CONFIG_STARRED_ALL'), type: 'item',
        }];
        if (favoriteGetters.menuItems.length) {
            results.push({
                name: FAVORITE_TYPE.MENU, label: i18n.t('COMMON.GNB.FAVORITES.MENU'), type: 'item',
            });
        }
        if (favoriteGetters.dashboardItems.length) {
            results.push({
                name: FAVORITE_TYPE.DASHBOARD, label: i18n.t('MENU.DASHBOARDS'), type: 'item',
            });
        }
        if (favoriteGetters.projectItems.length) {
            results.push({
                name: FAVORITE_TYPE.PROJECT, label: i18n.t('MENU.PROJECT'), type: 'item',
            });
        }
        if (favoriteGetters.costAnalysisItems.length) {
            results.push({
                name: FAVORITE_TYPE.COST_ANALYSIS, label: i18n.t('MENU.COST_EXPLORER_COST_ANALYSIS'), type: 'item',
            });
        }
        if (favoriteGetters.serviceItems.length) {
            results.push({
                name: FAVORITE_TYPE.SERVICE, label: i18n.t('MENU.ALERT_MANAGER_SERVICE'), type: 'item',
            });
        }
        return results;
    }),
    selectedItem: 'All',
});

watch(() => dropdownState.selectedItem, async (selectedItem) => {
    await workspaceHomePageStore.fetchFavoriteList(selectedItem);
});
</script>

<template>
    <div class="user-config-starred">
        <div class="header-wrapper">
            <p-i name="ic_multi-favorite"
                 width="1.5rem"
                 height="1.5rem"
                 class="start-title-button"
            />
            <p-field-title :label="$t('HOME.CONFIG_STARRED_TITLE')"
                           size="lg"
            />
            <div v-if="storeState.favoriteMenuList.length > 0"
                 class="filters-wrapper"
            >
                <p-select-dropdown
                    class="sort-key-select-dropdown"
                    :menu="dropdownState.dropdownMenuList"
                    :selected.sync="dropdownState.selectedItem"
                    menu-position="right"
                />
                <p-pagination :total-count="storeState.favoriteMenuList.length"
                              :page-size="10"
                              @change="state.pageStart = $event"
                />
            </div>
        </div>
        <div v-if="state.isFavoriteMenuListExist"
             class="suggestion-list-wrapper"
        >
            <user-configs-item v-for="(item) in state.slicedFavoriteMenuList"
                               :key="item.itemId"
                               :item="item"
            />
        </div>
        <div v-else
             class="empty"
        >
            <span class="title">{{ $t('HOME.NO_STARRED_TITLE') }}</span>
            <div class="desc-wrapper">
                <p>{{ $t('HOME.NO_STARRED_DESC1') }}</p>
                <div class="route-buttons">
                    <p-link v-for="(item, idx) in state.starredServiceItem"
                            :key="`starred-service-item-${idx}`"
                            class="starred-service-item"
                            :to="{ name: item.to }"
                            :icon-left="item.icon"
                    >
                        {{ item.label }}
                    </p-link>
                </div>
            </div>
            <img alt="star-menu-image"
                 class="star-menu-image"
                 src="/images/home/img_how-to-star-menu.png"
                 srcset="/images/home/img_how-to-star-menu@2x.png 2x,
                        /images/home/img_how-to-star-menu@3x.png 3x"
            >
        </div>
    </div>
</template>

<style scoped lang="postcss">
.user-config-starred {
    @apply flex flex-col overflow-y-hidden;
    .header-wrapper {
        @apply flex items-center;
        padding: 1rem;
        .filters-wrapper {
            @apply flex;
            margin-left: auto;
            gap: 0.5rem;

            /* custom design-system component - p-pagination */
            :deep(.pagination) {
                .page-number-wrapper {
                    @apply hidden;
                }
            }
        }
    }
    .suggestion-list-wrapper {
        @apply grid grid-cols-2;
        padding-right: 1.5rem;
        padding-bottom: 1.25rem;
        padding-left: 1.5rem;
    }
    .empty {
        @apply flex flex-col items-center justify-center;
        padding-right: 1rem;
        padding-left: 1rem;
        gap: 0.75rem;
        flex: 1;
        .title {
            @apply text-label-xl text-gray-800 text-center;
        }
        .desc-wrapper {
            @apply flex flex-col items-center text-paragraph-md text-gray-700;
            gap: 0.5rem;
            padding-bottom: 0.25rem;
            .route-buttons {
                @apply flex;
                gap: 0.375rem;
                .starred-service-item {
                    @apply flex bg-gray-150 text-gray-900;
                    padding: 0.25rem 0.625rem;
                    border-radius: 0.25rem;
                }
            }
        }
    }
}
</style>
