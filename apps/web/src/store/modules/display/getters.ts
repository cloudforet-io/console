/* eslint-disable @typescript-eslint/no-unused-vars */

import type { RawLocation } from 'vue-router';
import type VueRouter from 'vue-router';
import type { Getter } from 'vuex';

import { SpaceRouter } from '@/router';
import { i18n } from '@/translations';

import { makeAdminRouteName } from '@/router/helpers/route-helper';

// eslint-disable-next-line import/no-cycle
import { useAppContextStore } from '@/store/app-context/app-context-store';
// eslint-disable-next-line import/no-cycle
import { useWorkspaceStore } from '@/store/app-context/workspace/workspace-store';
import { SIDEBAR_TYPE } from '@/store/modules/display/config';
import type {
    DisplayState, DisplayMenu, SidebarProps,
} from '@/store/modules/display/type';

import type { Menu, MenuId, MenuInfo } from '@/lib/menu/config';
import { ADMIN_MENU_LIST, MENU_LIST } from '@/lib/menu/menu-architecture';
import { MENU_INFO_MAP } from '@/lib/menu/menu-info';

export const hasUncheckedNotifications: Getter<DisplayState, any> = (state): boolean => state.uncheckedNotificationCount > 0;

export const isHandbookVisible: Getter<DisplayState, any> = (state): boolean => state.visibleSidebar && state.sidebarType === SIDEBAR_TYPE.handbook;

export const sidebarProps: Getter<DisplayState, any> = (state): Partial<SidebarProps> => {
    if (state.sidebarType === SIDEBAR_TYPE.info) {
        return {
            styleType: 'primary',
            disableButton: false,
            size: 'md',
            disableScroll: false,
        };
    }
    if (state.sidebarType === SIDEBAR_TYPE.handbook) {
        return {
            styleType: 'secondary',
            disableButton: false,
            size: 'md',
            disableScroll: true,
        };
    }
    if (state.sidebarType === SIDEBAR_TYPE.widget) {
        return {
            styleType: 'primary',
            disableButton: true,
            size: 'md',
            isFixedSize: true,
            disableScroll: false,
        };
    }
    return { styleType: 'primary', disableButton: false, size: 'md' };
};

const filterMenuByRoute = (menuList: DisplayMenu[], router: VueRouter): DisplayMenu[] => menuList.reduce((results, _menu) => {
    const workspaceStore = useWorkspaceStore();
    const tagetWorkspaceId = workspaceStore.getters.currentWorkspaceId;
    const menu = { ..._menu };
    if (menu.subMenuList) {
        menu.subMenuList = filterMenuByRoute(menu.subMenuList, router);
        if (menu.subMenuList.length) {
            results.push(menu);
            return results;
        }
    }

    const to: RawLocation = {
        name: menu.to.name,
        params: tagetWorkspaceId ? { workspaceId: tagetWorkspaceId } : {},
    };
    const link = router.resolve(to);
    if (link?.href !== '/') results.push(menu);

    return results;
}, [] as DisplayMenu[]);

const filterMenuByAccessPermission = (menuList: DisplayMenu[], pagePermissionList: MenuId[]): DisplayMenu[] => menuList.reduce((results, _menu) => {
    const menu = { ..._menu };

    if (menu.subMenuList) {
        menu.subMenuList = filterMenuByAccessPermission(menu.subMenuList, pagePermissionList);
    }

    if (menu.subMenuList?.length) results.push(menu);
    else {
        const hasPermission = pagePermissionList.some((menuId) => menuId === menu.id);
        if (hasPermission) results.push(menu);
    }

    return results;
}, [] as DisplayMenu[]);

const getDisplayMenuList = (menuList: Menu[], isAdminMode?: boolean): DisplayMenu[] => menuList.map((d) => {
    const menuInfo: MenuInfo = MENU_INFO_MAP[d.id];
    const routeName = isAdminMode ? makeAdminRouteName(MENU_INFO_MAP[d.id].routeName) : MENU_INFO_MAP[d.id].routeName;
    return {
        ...d,
        id: d.id,
        label: i18n.t(menuInfo.translationId),
        icon: menuInfo.icon,
        highlightTag: menuInfo.highlightTag,
        to: { name: routeName },
        subMenuList: d.subMenuList ? getDisplayMenuList(d.subMenuList, isAdminMode) : [],
    } as DisplayMenu;
});
export const allMenuList: Getter<DisplayState, any> = (state, getters, rootState, rootGetters): DisplayMenu[] => {
    const appContextStore = useAppContextStore();
    const appContextState = appContextStore.$state;
    const isAdminMode = appContextState.getters.isAdminMode;
    const menuList = isAdminMode ? ADMIN_MENU_LIST : MENU_LIST;
    let _allGnbMenuList: DisplayMenu[];

    _allGnbMenuList = getDisplayMenuList(menuList, isAdminMode);
    _allGnbMenuList = filterMenuByRoute(_allGnbMenuList, SpaceRouter.router);
    if (!isAdminMode) {
        _allGnbMenuList = filterMenuByAccessPermission(_allGnbMenuList, rootGetters['user/pageAccessPermissionList']);
    }

    return _allGnbMenuList;
};

export const GNBMenuList: Getter<DisplayState, any> = (state, getters): DisplayMenu[] => getters.allMenuList.filter((d) => !d.hideOnGNB);

export const siteMapMenuList: Getter<DisplayState, any> = (state, getters): DisplayMenu[] => getters.allMenuList.filter((d) => !d.hideOnSiteMap);
