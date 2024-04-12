<script setup lang="ts">
import { useWindowSize } from '@vueuse/core';
import {
    computed, reactive, watch,
} from 'vue';
import { useRoute } from 'vue-router/composables';

import {
    PIconButton, PBreadcrumbs, PCopyButton, screens, PTooltip,
} from '@spaceone/design-system';
import type { MenuItem } from '@spaceone/design-system/types/inputs/context-menu/type';
import { clone, isEmpty } from 'lodash';

import { i18n } from '@/translations';

import { ROOT_ROUTE } from '@/router/constant';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';


import type { MenuId } from '@/lib/menu/config';
import { MENU_ID } from '@/lib/menu/config';

import { useBreadcrumbs } from '@/common/composables/breadcrumbs';
import FavoriteButton from '@/common/modules/favorites/favorite-button/FavoriteButton.vue';
import { useFavoriteStore } from '@/common/modules/favorites/favorite-button/store/favorite-store';
import { FAVORITE_TYPE } from '@/common/modules/favorites/favorite-button/type';
import type { FavoriteOptions } from '@/common/modules/favorites/favorite-button/type';
import { useGnbStore } from '@/common/modules/navigations/stores/gnb-store';
import type { Breadcrumb } from '@/common/modules/page-layouts/type';

const userWorkspaceStore = useUserWorkspaceStore();
const userWorkspaceGetters = userWorkspaceStore.getters;
const gnbStore = useGnbStore();
const gnbGetters = gnbStore.getters;
const favoriteStore = useFavoriteStore();
const appContextStore = useAppContextStore();
const appContextGetters = appContextStore.getters;

const route = useRoute();
const { width } = useWindowSize();
const { breadcrumbs } = useBreadcrumbs();

const storeState = reactive({
    isAdminMode: computed(() => appContextGetters.isAdminMode),
    currentWorkspaceId: computed(() => userWorkspaceGetters.currentWorkspaceId),
    isHideNavRail: computed(() => gnbGetters.isHideNavRail),
});
const state = reactive({
    beforeWorkspace: computed(() => route.query?.beforeWorkspace as string|undefined),
    isMobileSize: computed<boolean>(() => width.value < screens.mobile.max),
    routes: computed(() => {
        let routes: Breadcrumb[] = [];
        if (!storeState.isAdminMode) {
            routes.push({
                name: i18n.t('MENU.HOME_DASHBOARD'),
                to: {
                    name: ROOT_ROUTE.WORKSPACE._NAME,
                    params: {
                        workspaceId: storeState.currentWorkspaceId || state.beforeWorkspace,
                    },
                },
            });
        }
        if (gnbGetters.breadcrumbs.length === 0) {
            routes = [...routes, ...breadcrumbs.value];
        }
        routes = [...routes, ...gnbGetters.breadcrumbs];
        return routes;
    }),
    selectedMenuId: computed(() => {
        const reversedMatched = clone(route.matched).reverse();
        const closestRoute = reversedMatched.find((d) => d.meta?.menuId !== undefined);
        const targetMenuId: MenuId = closestRoute?.meta?.menuId || MENU_ID.HOME_DASHBOARD;
        return targetMenuId;
    }),
    currentMenuId: computed(() => route.matched[route.matched.length - 1].meta?.menuId),
    favoriteOptions: computed<FavoriteOptions|undefined>(() => {
        if (!state.currentMenuId) return undefined;
        return {
            type: FAVORITE_TYPE.MENU,
            id: state.currentMenuId,
        };
    }),
});

const handleClickMenuButton = () => {
    if (!state.isMobileSize) gnbStore.createHideNavRail(!gnbGetters.isHideNavRail);
    else gnbStore.createMinimizeNavRail(!gnbGetters.isMinimizeNavRail);
};
const handleClickBreadcrumbsItem = (item: Breadcrumb) => {
    if (item) gnbStore.setSelectedItem(item);
};
const handleClickBreadcrumbsDropdownItem = (item: MenuItem) => {
    if (item) {
        const selectedItem = gnbGetters.breadcrumbs.find((breadcrumb) => breadcrumb.name === item.name);
        if (selectedItem) gnbStore.setSelectedItem(selectedItem);
    }
};

watch(() => state.selectedMenuId, async (selectedMenuId) => {
    if (selectedMenuId === MENU_ID.COST_ANALYSIS) return;
    await gnbStore.initState();
    await favoriteStore.fetchFavorite();
    await gnbStore.setFavoriteItemId(state.favoriteOptions);
}, { immediate: true });
watch(() => state.currentMenuId, async () => {
    if (state.selectedMenuId === MENU_ID.COST_ANALYSIS || state.selectedMenuId === MENU_ID.SECURITY) return;
    await gnbStore.setFavoriteItemId(state.favoriteOptions);
    await gnbStore.fetchCostQuerySet();
}, { immediate: true });
</script>

<template>
    <div class="g-n-b-toolbox">
        <div class="navigation-section">
            <p-tooltip class="menu-button-wrapper"
                       position="bottom"
                       :contents="storeState.isHideNavRail ? $t('COMMON.GNB.TOOLTIP.OPEN_GNB_RAIL') : $t('COMMON.GNB.TOOLTIP.HIDE_GNB_RAIL')"
            >
                <p-icon-button name="ic_gnb_menu"
                               style-type="transparent"
                               class="menu-button"
                               shape="square"
                               size="md"
                               @click="handleClickMenuButton"
                />
            </p-tooltip>
            <p-breadcrumbs :routes="state.routes"
                           @click="handleClickBreadcrumbsItem"
                           @click-dropdown-menu-item="handleClickBreadcrumbsDropdownItem"
            />
            <favorite-button v-if="state.routes.length > 0 && !isEmpty(gnbGetters.favoriteItem) && state.currentMenuId !== MENU_ID.HOME_DASHBOARD"
                             :item-id="gnbGetters.favoriteItem.id || ''"
                             :favorite-type="gnbGetters.favoriteItem.type || ''"
                             scale="0.8"
                             class="favorite-button"
            />
        </div>
        <div v-if="gnbGetters.id"
             class="extra-section"
        >
            <b>{{ $t('COMMON.GNB.TOOLBOX.ID') }}: </b>
            <p-copy-button class="copy-button"
                           size="sm"
                           :value="gnbGetters.id"
            >
                {{ state.isMobileSize ? '' : gnbGetters.id }}
            </p-copy-button>
        </div>
    </div>
</template>

<style scoped lang="postcss">
.g-n-b-toolbox {
    @apply justify-between bg-white border-b;
    top: 0;
    width: 100%;
    height: $gnb-toolbox-height;
    padding-right: 1rem;
    z-index: 50;
    box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.12);
    .navigation-section {
        @apply flex items-center;
        .menu-button-wrapper {
            @apply flex items-center justify-center;
            width: $gnb-navigation-rail-min-width;
            .menu-button {
                @apply border-none text-gray-900;
                margin-bottom: -0.025rem;
                &:hover {
                    @apply text-blue-600;
                }
            }
        }
    }
    .extra-section {
        @apply flex items-center text-gray-500 text-label-sm;
        gap: 0.25rem;
        .copy-button {
            @apply flex items-center text-gray-500;
        }
    }
}

/* custom design-system component - p-copy-button */
:deep(.p-copy-button) {
    .copy-button-alert {
        top: calc($top-bar-height + $gnb-toolbox-height - 0.5rem) !important;
    }
}
</style>
