<script setup lang="ts">
import type { Ref } from 'vue';
import {
    reactive, computed, ref, watch, nextTick,
} from 'vue';
import { useRoute, useRouter } from 'vue-router/composables';

import type { ContextMenuType } from '@spaceone/design-system/src/inputs/context-menu/type';
import type { MenuItem } from '@spaceone/design-system/types/inputs/context-menu/type';
import { includes } from 'lodash';

import { SpaceRouter } from '@/router';
import { store } from '@/store';

import { ROOT_ROUTE } from '@/router/constant';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import type { DisplayMenu as GNBMenuType } from '@/store/modules/display/type';
import { DOMAIN_CONFIG_TYPE } from '@/store/modules/domain/type';

import { isUserAccessibleToMenu } from '@/lib/access-control';
import type { MenuId } from '@/lib/menu/config';
import { MENU_ID } from '@/lib/menu/config';

import { useGnbContainerWidth } from '@/common/modules/navigations/gnb/composables/use-gnb-container-width';
import GNBHeader from '@/common/modules/navigations/gnb/modules/gnb-header/GNBHeader.vue';
import GNBInvisibleMenuDropdown from '@/common/modules/navigations/gnb/modules/gnb-menu/GNBInvisibleMenuDropdown.vue';
import GNBMenu from '@/common/modules/navigations/gnb/modules/gnb-menu/GNBMenu.vue';
import GNBToolset from '@/common/modules/navigations/gnb/modules/GNBToolset.vue';
import SiteMap from '@/common/modules/navigations/gnb/modules/SiteMap.vue';


const ALLOWED_MENUS_FOR_ALL_USERS = ['notifications', 'support', 'profile'];
const DEFAULT_INVISIBLE_MENU_WIDTH = 64;
const MINIMAL_GAP_BETWEEN_MENU_N_TOOLSET = 16;

const router = useRouter();
const route = useRoute();
const appContextStore = useAppContextStore();

const state = reactive({
    isAdminMode: computed(() => appContextStore.getters.isAdminMode),
    openedMenu: '',
    showSiteMap: false,
    hasPermission: computed((() => store.getters['user/hasPermission'])),
    logoLink: computed(() => {
        if (state.isAdminMode) return { name: ROOT_ROUTE.ADMIN._NAME };
        return (isUserAccessibleToMenu(MENU_ID.HOME_DASHBOARD, store.getters['user/pageAccessPermissionList']) ? { name: ROOT_ROUTE._NAME } : null);
    }),
    gnbMenuList: computed<GNBMenuType[]>(() => {
        let menuList = [...store.getters['display/GNBMenuList']];
        if (state.integrationMenu) menuList = [...menuList, state.integrationMenu];
        return menuList;
    }),
    visibleGnbMenuList: computed<GNBMenuType[]>(() => {
        const menuList = state.gnbMenuList;
        // WARNING: This is a temporary solution to show only 2 menus in the GNB
        const result = menuList.slice(0, 2);
        // const result = menuList.slice(0, state.availableMenuCount);
        return result;
    }),
    invisibleGnbMenuList: computed<MenuItem[]>(() => {
        const menuList = state.gnbMenuList.slice(state.availableMenuCount);
        let result = [] as MenuItem[];
        menuList.forEach((menu) => {
            const dividerItem = result.length ? [{ type: 'divider' }] : [];
            result = [
                ...result,
                ...dividerItem,
                {
                    ...menu,
                    name: menu.id,
                    type: 'header',
                },
            ];
            if (menu.subMenuList) {
                result = [...result, ...convertGNBMenuToMenuItem(menu.subMenuList)];
            }
        });
        return result;
    }),
    selectedInvisibleGNBMenuId: computed(() => {
        const selectedMenu = state.invisibleGnbMenuList.find((menu) => getMenuIsSelected(menu.id) && menu.type === 'item');
        return selectedMenu?.id;
    }),
    siteMapMenuList: computed<GNBMenuType[]>(() => {
        const basicSiteMapList: GNBMenuType[] = store.getters['display/siteMapMenuList'];
        if (!state.isAdminMode) {
            // WORKSPACE_OWNER case: only WORKSPACE OWNER can see IAM menu
            const IAMMenu = basicSiteMapList.find((menu) => menu.id === MENU_ID.IAM) as GNBMenuType;
            if (IAMMenu) IAMMenu.icon = 'ic_service_administration';
            return basicSiteMapList;
        }
        const adminSiteMapList: GNBMenuType[] = [];
        basicSiteMapList.forEach((menu) => {
            if (menu.id === MENU_ID.ADMINISTRATION) {
                let integralSubMenuList: GNBMenuType[] = [];
                (menu.subMenuList ?? []).forEach((subMenu) => {
                    integralSubMenuList = [...integralSubMenuList, ...(subMenu.subMenuList ?? [])];
                });
                adminSiteMapList.push({
                    ...menu,
                    subMenuList: integralSubMenuList,
                });
            } else {
                adminSiteMapList.push(menu);
            }
        });
        return adminSiteMapList;
    }),
    integrationMenu: computed<GNBMenuType | undefined>(() => {
        const extraMenu = store.getters['domain/domainExtraMenu'];
        if (extraMenu?.title) {
            return {
                show: true,
                id: DOMAIN_CONFIG_TYPE.EXTRA_MENU as MenuId,
                label: extraMenu.title,
                to: {},
            };
        }
        return undefined;
    }),
    availableMenuCount: 0,
    isInvisibleMenuExists: false,
});

const getMenuIsSelected = (menuId?: MenuId): boolean => {
    if (!menuId) return false;
    const matchedPaths = route.matched;
    return matchedPaths.some((matchedPath) => matchedPath.meta?.menuId === menuId);
};

const convertGNBMenuToMenuItem = (menuList: GNBMenuType[], menuType: ContextMenuType = 'item'): MenuItem[] => menuList.map((menu) => ({
    ...menu,
    name: menu.id,
    type: menuType,
}));

const gnbRef = ref<HTMLElement|null>(null);
const gnbMenuRef = ref<(InstanceType<typeof GNBMenu>)[]>();
const gnbToolsetRef = ref<InstanceType<typeof GNBToolset>>();
const gnbHeaderRef = ref<InstanceType<typeof GNBHeader>>();
const { containerWidth } = useGnbContainerWidth({ containerRef: gnbRef, observeResize: true });

/* event */
const hideMenu = () => {
    state.openedMenu = '';
};
const handleOpenMenu = (menuId: MenuId) => {
    if (state.openedMenu === menuId) {
        hideMenu();
    } else if (state.hasPermission || includes(ALLOWED_MENUS_FOR_ALL_USERS, menuId)) {
        state.openedMenu = menuId;
        state.showSiteMap = false;
    }
};

const handleSelectGNBMenu = (menuId: string) => {
    if (router.currentRoute.name === menuId) return;
    const selectedRoute = state.invisibleGnbMenuList.find((menu) => menu.id === menuId)?.to;
    const isDuplicatePath = SpaceRouter.router.currentRoute.name === selectedRoute.name;
    if (isDuplicatePath) return;
    router.push(selectedRoute).catch(() => {});
};


// GNB Layout helpers
const getComponentWidth = (componentRef: Ref<InstanceType<any>>) => componentRef.value?.$el.clientWidth ?? 0;
const getAvailableGNBMenuWidth = (gnbWidth: number): number => {
    const gnbToolsetWidth = getComponentWidth(gnbToolsetRef);
    const gnbHeaderWidth = getComponentWidth(gnbHeaderRef);
    return gnbWidth - (gnbToolsetWidth + gnbHeaderWidth + DEFAULT_INVISIBLE_MENU_WIDTH + MINIMAL_GAP_BETWEEN_MENU_N_TOOLSET);
};
const getVisibleMenuCountWithinWidth = (availableWidth: number): number => {
    let visibleMenuCount = 0;
    let _availableWidth = availableWidth;
    const menuRefs = gnbMenuRef.value;

    menuRefs?.forEach((menuRef) => {
        _availableWidth -= menuRef.$el.clientWidth;
        if (_availableWidth > 0) visibleMenuCount += 1;
    });
    return visibleMenuCount;
};
const updateGNBLayout = (gnbWidth: number) => {
    const availableWidth = getAvailableGNBMenuWidth(gnbWidth);
    const visibleMenuCount = getVisibleMenuCountWithinWidth(availableWidth);

    state.availableMenuCount = visibleMenuCount;
    state.isInvisibleMenuExists = visibleMenuCount < state.gnbMenuList.length;
};


watch([containerWidth, () => store.getters['user/getCurrentRoleInfo']], async ([changedWidth]) => {
    if (!changedWidth) return;
    state.availableMenuCount = state.gnbMenuList.length;
    await nextTick();
    updateGNBLayout(changedWidth);
}, { immediate: true });

</script>

<template>
    <div ref="gnbRef"
         :class="{'gnb': true, 'admin-gnb': state.isAdminMode}"
    >
        <div class="site-map-wrapper">
            <site-map :menu-list="state.siteMapMenuList"
                      :visible.sync="state.showSiteMap"
                      :disabled="!state.hasPermission"
                      :is-admin-mode="state.isAdminMode"
            />
        </div>

        <g-n-b-header ref="gnbHeaderRef"
                      :to="state.logoLink"
                      :is-admin-mode="state.isAdminMode"
        />

        <g-n-b-menu v-for="(menu, idx) in state.visibleGnbMenuList"
                    ref="gnbMenuRef"
                    :key="`gnb-menu-${idx}`"
                    :class="{ 'gnb-menu-list': true, 'gnb-first-menu': idx === 0 }"
                    :is-admin-mode="state.isAdminMode"
                    :show="menu.show"
                    :menu-id="menu.id"
                    :label="menu.label"
                    :to="menu.to"
                    :sub-menu-list="menu.subMenuList"
                    :has-permission="state.hasPermission"
                    :is-opened="state.openedMenu === menu.id"
                    :is-selected="getMenuIsSelected(menu.id)"
                    :highlight-tag="menu.highlightTag"
                    @open-menu="handleOpenMenu"
                    @hide-menu="hideMenu"
        />
        <g-n-b-invisible-menu-dropdown v-if="state.invisibleGnbMenuList.length"
                                       :is-admin-mode="state.isAdminMode"
                                       :menu="state.invisibleGnbMenuList"
                                       :selected-menu-id="state.selectedInvisibleGNBMenuId"
                                       @select-menu="handleSelectGNBMenu"
        />
        <g-n-b-toolset ref="gnbToolsetRef"
                       class="toolset"
                       :opened-menu="state.openedMenu"
                       @open-menu="handleOpenMenu"
                       @hide-menu="hideMenu"
        />
    </div>
</template>

<style lang="postcss" scoped>
.gnb {
    @apply bg-white items-center;
    display: flex !important;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12);

    &.admin-gnb {
        @apply bg-violet-900;
        background: linear-gradient(90deg, #2c0f66 14.69%, #7d5dd2 100%);
        box-shadow: 0 0.125rem 0.25rem 0 rgba(0, 0, 0, 0.12);
    }

    .site-map-wrapper {
        @apply hidden;
        padding-left: 1.25rem;

        @screen mobile {
            @apply inline-flex items-center;
        }
    }

    .gnb-menu-list {
        padding-right: 0.25rem;
        &.gnb-first-menu {
            padding-left: 0.75rem;
        }

        @screen mobile {
            @apply hidden;
        }
    }
    .toolset {
        @apply absolute inline-flex items-center;
        right: 0;
        padding-right: 1.5rem;
    }
}
</style>
