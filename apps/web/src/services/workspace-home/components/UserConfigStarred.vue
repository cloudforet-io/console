<script setup lang="ts">
import { computed, reactive, watch } from 'vue';
import { useRouter } from 'vue-router/composables';

import {
    PFieldTitle, PSelectDropdown, PI, PPagination, PTextButton,
} from '@spaceone/design-system';
import { CONTEXT_MENU_TYPE } from '@spaceone/design-system/src/inputs/context-menu/type';
import type { SelectDropdownMenuItem } from '@spaceone/design-system/types/inputs/dropdown/select-dropdown/type';

import { i18n } from '@/translations';

import { useFavoriteStore } from '@/common/modules/favorites/favorite-button/store/favorite-store';
import type { FavoriteItem } from '@/common/modules/favorites/favorite-button/type';
import { FAVORITE_TYPE } from '@/common/modules/favorites/favorite-button/type';

import { DASHBOARDS_ROUTE } from '@/services/dashboards/routes/route-constant';
import { PROJECT_ROUTE } from '@/services/project/routes/route-constant';
import UserConfigsItem from '@/services/workspace-home/components/UserConfigsItem.vue';
import { useWorkspaceHomePageStore } from '@/services/workspace-home/store/workspace-home-page-store';

const favoriteStore = useFavoriteStore();
const favoriteGetters = favoriteStore.getters;
const workspaceHomePageStore = useWorkspaceHomePageStore();
const workspaceHomePageGetters = workspaceHomePageStore.getters;

const router = useRouter();

const storeState = reactive({
    favoriteMenuList: computed<FavoriteItem[]>(() => workspaceHomePageGetters.favoriteMenuList),

});
const state = reactive({
    pageStart: 1,
    slicedFavoriteMenuList: computed<FavoriteItem[]>(() => storeState.favoriteMenuList.slice((state.pageStart - 1) * 10, state.pageStart * 10)),
});
const dropdownState = reactive({
    dropdownMenuList: computed<SelectDropdownMenuItem[]>(() => {
        const results: SelectDropdownMenuItem[] = [{
            name: 'All', label: i18n.t('HOME.CONFIG_STARRED_ALL'), type: CONTEXT_MENU_TYPE.item,
        }];
        if (favoriteGetters.menuItems.length) {
            results.push({
                name: FAVORITE_TYPE.MENU, label: i18n.t('COMMON.GNB.FAVORITES.MENU'), type: CONTEXT_MENU_TYPE.item,
            });
        }
        if (favoriteGetters.dashboardItems.length) {
            results.push({
                name: FAVORITE_TYPE.DASHBOARD, label: i18n.t('MENU.DASHBOARDS'), type: CONTEXT_MENU_TYPE.item,
            });
        }
        if (favoriteGetters.projectItems.length) {
            results.push({
                name: FAVORITE_TYPE.PROJECT, label: i18n.t('MENU.PROJECT'), type: CONTEXT_MENU_TYPE.item,
            });
        }
        if (favoriteGetters.cloudServiceItems.length) {
            results.push({
                name: FAVORITE_TYPE.CLOUD_SERVICE, label: i18n.t('MENU.ASSET_INVENTORY_CLOUD_SERVICE'), type: CONTEXT_MENU_TYPE.item,
            });
        }
        if (favoriteGetters.securityItems.length) {
            results.push({
                name: FAVORITE_TYPE.SECURITY, label: i18n.t('MENU.ASSET_INVENTORY_SECURITY'), type: CONTEXT_MENU_TYPE.item,
            });
        }
        if (favoriteGetters.costAnalysisItems.length) {
            results.push({
                name: FAVORITE_TYPE.COST_ANALYSIS, label: i18n.t('MENU.COST_EXPLORER_COST_ANALYSIS'), type: CONTEXT_MENU_TYPE.item,
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
            <div class="filters-wrapper">
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
        <div v-if="storeState.favoriteMenuList.length > 0"
             class="suggestion-list-wrapper"
        >
            <user-configs-item v-for="(item) in state.slicedFavoriteMenuList"
                               :key="item.itemId"
                               :item="item"
                               @click-favorite="workspaceHomePageStore.fetchFavoriteList()"
            />
        </div>
        <div v-else
             class="empty"
        >
            <span class="title">{{ $t('HOME.NO_STARRED') }}</span>
            <div class="desc-wrapper">
                <p>{{ $t('HOME.NO_STARRED_DESC1') }}</p>
                <p>{{ $t('HOME.NO_STARRED_DESC2') }}</p>
            </div>
            <div class="route-buttons">
                <p-text-button style-type="highlight"
                               @click="router.push({ name: DASHBOARDS_ROUTE._NAME })"
                >
                    <span>{{ $t('MENU.DASHBOARDS') }}</span>
                </p-text-button>
                <span>/</span>
                <p-text-button style-type="highlight"
                               @click="router.push({ name: PROJECT_ROUTE._NAME })"
                >
                    <span>{{ $t('MENU.PROJECT') }}</span>
                </p-text-button>
                <!-- TODO: add Metric Explorer after merged -->
            </div>
        </div>
    </div>
</template>

<style scoped lang="postcss">
.user-config-starred {
    @apply flex flex-col;
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
        gap: 0.75rem;
        flex: 1;
        .title {
            @apply text-label-xl text-gray-800;
        }
        .desc-wrapper {
            @apply flex flex-col items-center text-paragraph-md text-gray-700;
        }
        .route-buttons {
            @apply flex;
            gap: 0.5rem;
        }
    }
}
</style>
