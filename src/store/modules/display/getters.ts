import {
    DisplayState, GNBMenu, SidebarProps,
} from '@/store/modules/display/type';
import { Getter } from 'vuex';
import {
    CURRENCY_SYMBOL, SIDEBAR_TYPE,
} from '@/store/modules/display/config';
import VueRouter from 'vue-router';
import config from '@/lib/config';
import { SpaceRouter } from '@/router';
import { menuRouterMap } from '@/lib/menu/menu-router-map';
import {
    Menu, MENU_ID, MENU_INFO, MENU_LIST,
} from '@/lib/menu/config';

export const hasUncheckedNotifications: Getter<DisplayState, any> = (state): boolean => state.uncheckedNotificationCount > 0;

export const isHandbookVisible: Getter<DisplayState, any> = (state): boolean => state.visibleSidebar && state.sidebarType === SIDEBAR_TYPE.handbook;

export const currencySymbol: Getter<DisplayState, any> = (state): string => CURRENCY_SYMBOL[state.currency] ?? '$';

export const sidebarProps: Getter<DisplayState, any> = (state): Partial<SidebarProps> => {
    if (state.sidebarType === SIDEBAR_TYPE.info) return { styleType: 'primary', disableButton: false, size: 'md' };
    if (state.sidebarType === SIDEBAR_TYPE.handbook) return { styleType: 'secondary', disableButton: false, size: 'md' };
    if (state.sidebarType === SIDEBAR_TYPE.widget) return { styleType: 'primary', disableButton: true, size: 'sm' };
    return { styleType: 'primary', disableButton: false, size: 'md' };
};

const filterMenuByRoute = (menuList: GNBMenu[], disabledMenu: string[], showBilling: boolean, isAdmin: boolean, router: VueRouter): GNBMenu[] => menuList.reduce((results, _menu) => {
    if (!showBilling) {
        const idx = results.findIndex(item => item.id === MENU_ID.COST_EXPLORER);
        if (idx > -1) results.splice(idx, 1);
    }
    if (!isAdmin) {
        const idx = results.findIndex(item => item.id === MENU_ID.ADMINISTRATION);
        if (idx > -1) results.splice(idx, 1);
    }
    if (disabledMenu.includes(_menu.id) && !isAdmin) return results;

    const menu = { ..._menu };
    if (menu.subMenuList) {
        menu.subMenuList = filterMenuByRoute(menu.subMenuList, disabledMenu, showBilling, isAdmin, router);
        if (menu.subMenuList.length) {
            results.push(menu);
            return results;
        }
    }

    const link = router.resolve(menu.to);
    if (link?.href !== '/') results.push(menu);

    return results;
}, [] as GNBMenu[]);

const getGnbMenuList = (menuList: Menu[]): GNBMenu[] => menuList.map((d) => {
    const menuInfo = MENU_INFO[d.id];
    return {
        ...d,
        label: menuInfo.label,
        icon: menuInfo.icon,
        to: { name: menuRouterMap[d.id].name },
        subMenuList: d.subMenuList ? getGnbMenuList(d.subMenuList) : [],
    } as GNBMenu;
});

export const allGnbMenuList: Getter<DisplayState, any> = (state, getters, rootState, rootGetters): GNBMenu[] => {
    const _isAdmin = rootGetters['user/isAdmin'];
    const _billingEnabledMenuList: string[] = config.get('BILLING_ENABLED') ?? [];
    const _showBilling = _billingEnabledMenuList.includes(rootState.domain.domainId);
    const _disabledMenu = config.get('DISABLED_MENU');

    const _allMenuList: GNBMenu[] = getGnbMenuList(MENU_LIST);

    return filterMenuByRoute(_allMenuList, _disabledMenu, _showBilling, _isAdmin, SpaceRouter.router);
};

export const GNBMenuList: Getter<DisplayState, any> = (state, getters): GNBMenu[] => getters.allGnbMenuList.filter(d => !d.optional);
