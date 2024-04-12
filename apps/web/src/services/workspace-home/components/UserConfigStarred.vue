<script setup lang="ts">
import { computed, reactive, watch } from 'vue';

import {
    PFieldTitle, PSelectDropdown, PI, PPagination,
} from '@spaceone/design-system';
import { CONTEXT_MENU_TYPE } from '@spaceone/design-system/src/inputs/context-menu/type';
import type { SelectDropdownMenuItem } from '@spaceone/design-system/types/inputs/dropdown/select-dropdown/type';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { UserConfigListParameters } from '@/schema/config/user-config/api-verbs/list';
import type { UserConfigModel } from '@/schema/config/user-config/model';
import { store } from '@/store';
import { i18n } from '@/translations';

import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useFavoriteStore } from '@/common/modules/favorites/favorite-button/store/favorite-store';
import type { FavoriteItem } from '@/common/modules/favorites/favorite-button/type';
import { FAVORITE_TYPE } from '@/common/modules/favorites/favorite-button/type';

import UserConfigsItem from '@/services/workspace-home/components/UserConfigsItem.vue';



const userWorkspaceStore = useUserWorkspaceStore();
const userWorkspaceStoreGetters = userWorkspaceStore.getters;
const favoriteStore = useFavoriteStore();
const favoriteGetters = favoriteStore.getters;

const favoriteListApiQuery = new ApiQueryHelper().setSort('updated_at', true);

const storeState = reactive({
    userId: computed<string>(() => store.state.user.userId),
    currentWorkspaceId: computed<string|undefined>(() => userWorkspaceStoreGetters.currentWorkspaceId),
});
const state = reactive({
    pageStart: 1,
    favoriteMenuList: [] as FavoriteItem[],
    slicedFavoriteMenuList: computed<FavoriteItem[]>(() => state.favoriteMenuList.slice((state.pageStart - 1) * 10, state.pageStart * 10)),
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

const fetchFavoriteList = async (selectedItem?: string) => {
    favoriteListApiQuery.setFilters([
        { k: 'user_id', v: storeState.userId, o: '=' },
        { k: 'data.workspaceId', v: storeState.currentWorkspaceId || '', o: '=' },
        { k: 'data.itemType', v: FAVORITE_TYPE.WORKSPACE, o: '!=' },
    ]);
    if (selectedItem === 'All' || !selectedItem) {
        favoriteListApiQuery.addFilter({ k: 'name', v: 'console:favorite:', o: '' });
    } else {
        favoriteListApiQuery.addFilter({ k: 'name', v: `console:favorite:${selectedItem}`, o: '' });
    }
    try {
        const { results } = await SpaceConnector.clientV2.config.userConfig.list<UserConfigListParameters, ListResponse<UserConfigModel>>({
            query: favoriteListApiQuery.data,
        });
        const _recentList = (results ?? []).map((i) => i.data as FavoriteItem);
        state.favoriteMenuList = _recentList.filter((i) => !i?.isDeleted);
    } catch (e) {
        ErrorHandler.handleError(e);
        state.favoriteMenuList = [];
    }
};

watch(() => dropdownState.selectedItem, async (selectedItem) => {
    await fetchFavoriteList(selectedItem);
}, { immediate: true });
watch(() => storeState.currentWorkspaceId, async (currentWorkspaceId) => {
    if (!currentWorkspaceId) return;
    await fetchFavoriteList();
}, { immediate: true });
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
                <p-pagination :total-count="state.favoriteMenuList.length"
                              :page-size="10"
                              @change="state.pageStart = $event"
                />
            </div>
        </div>
        <div class="suggestion-list-wrapper">
            <user-configs-item v-for="(item) in state.slicedFavoriteMenuList"
                               :key="item.itemId"
                               :item="item"
            />
        </div>
    </div>
</template>

<style scoped lang="postcss">
.user-config-starred {
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
}
</style>
