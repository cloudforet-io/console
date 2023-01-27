import type VueRouter from 'vue-router';
import type { Getter } from 'vuex';

import { SpaceRouter } from '@/router';
import { i18n } from '@/translations';

import {
    CURRENCY_SYMBOL, SIDEBAR_TYPE,
} from '@/store/modules/display/config';
import type {
    DisplayState, DisplayMenu, SidebarProps,
} from '@/store/modules/display/type';

import type { PagePermissionTuple } from '@/lib/access-control/config';
import config from '@/lib/config';
import type { Menu, MenuInfo } from '@/lib/menu/config';
import { MENU_ID } from '@/lib/menu/config';
import { MENU_LIST } from '@/lib/menu/menu-architecture';
import { MENU_INFO_MAP } from '@/lib/menu/menu-info';

export const hasUncheckedNotifications: Getter<DisplayState, any> = (state): boolean => state.uncheckedNotificationCount > 0;

export const isHandbookVisible: Getter<DisplayState, any> = (state): boolean => state.visibleSidebar && state.sidebarType === SIDEBAR_TYPE.handbook;

export const currencySymbol: Getter<DisplayState, any> = (state): string => CURRENCY_SYMBOL[state.currency] ?? '$';

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
    const menu = { ..._menu };
    if (menu.subMenuList) {
        menu.subMenuList = filterMenuByRoute(menu.subMenuList, router);
        if (menu.subMenuList.length) {
            results.push(menu);
            return results;
        }
    }

    const link = router.resolve(menu.to);
    if (link?.href !== '/') results.push(menu);

    return results;
}, [] as DisplayMenu[]);

const filterMenuByPermission = (menuList: DisplayMenu[], pagePermissionList: PagePermissionTuple[]): DisplayMenu[] => menuList.reduce((results, _menu) => {
    const menu = { ..._menu };

    if (menu.subMenuList) {
        menu.subMenuList = filterMenuByPermission(menu.subMenuList, pagePermissionList);
    }

    if (menu.subMenuList?.length) results.push(menu);
    else {
        const hasPermission = pagePermissionList.some(([permissionMenuId]) => permissionMenuId === menu.id);
        if (hasPermission) results.push(menu);
    }

    return results;
}, [] as DisplayMenu[]);

const getDisplayMenuList = (menuList: Menu[]): DisplayMenu[] => menuList.map((d) => {
    const menuInfo: MenuInfo = MENU_INFO_MAP[d.id];
    return {
        ...d,
        label: i18n.t(menuInfo.translationId),
        icon: menuInfo.icon,
        isNew: menuInfo.isNew,
        isBeta: menuInfo.isBeta,
        to: { name: d.id },
        subMenuList: d.subMenuList ? getDisplayMenuList(d.subMenuList) : [],
    } as DisplayMenu;
});
export const allMenuList: Getter<DisplayState, any> = (state, getters, rootState, rootGetters): DisplayMenu[] => {
    const menuList = rootState.domain.billingEnabled ? MENU_LIST : MENU_LIST.filter((d) => d.id !== MENU_ID.COST_EXPLORER);

    let _allGnbMenuList: DisplayMenu[] = getDisplayMenuList(menuList);
    _allGnbMenuList = filterMenuByRoute(_allGnbMenuList, SpaceRouter.router);
    _allGnbMenuList = filterMenuByPermission(_allGnbMenuList, rootGetters['user/pagePermissionList']);
    return _allGnbMenuList;
};

export const GNBMenuList: Getter<DisplayState, any> = (state, getters): DisplayMenu[] => getters.allMenuList.filter((d) => {
    if (d.id === MENU_ID.DASHBOARDS) {
        return !d.hideOnGNB && !!config.get('DASHBOARD_ENABLED');
    }
    return !d.hideOnGNB;
});

export const siteMapMenuList: Getter<DisplayState, any> = (state, getters): DisplayMenu[] => getters.allMenuList.filter((d) => !d.hideOnSiteMap);
