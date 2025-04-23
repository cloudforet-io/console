import { computed } from 'vue';
import type { RawLocation, Route } from 'vue-router';
import type VueRouter from 'vue-router';

import { i18n } from '@/translations';

import { makeAdminRouteName } from '@/router/helpers/route-helper';


import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';
import { useAuthorizationStore } from '@/store/authorization/authorization-store';
import { useMenuStore } from '@/store/menu/menu-store';
import type { DisplayMenu } from '@/store/menu/type';

import { MENU_ID } from '@/lib/menu/config';
import type { Menu, MenuId, MenuInfo } from '@/lib/menu/config';
import { MENU_INFO_MAP } from '@/lib/menu/menu-info';


export const useAllMenuList = () => {
    const appContextStore = useAppContextStore();
    const menuStore = useMenuStore();
    const authorizationStore = useAuthorizationStore();
    const userWorkspaceStore = useUserWorkspaceStore();

    const _isAdminMode = computed(() => appContextStore.getters.isAdminMode);
    const _currentWorkspaceId = computed(() => userWorkspaceStore.getters.currentWorkspaceId);


    const getAllMenuList = (route: Route, router: VueRouter): DisplayMenu[] => {
        const isMyPage = route?.path.startsWith('/my-page');
        let _allGnbMenuList: DisplayMenu[];

        _allGnbMenuList = _getDisplayMenuList(menuStore.getters.menuList, _isAdminMode.value);
        _allGnbMenuList = _filterMenuByRoute(_allGnbMenuList, router, _currentWorkspaceId.value);
        if (!_isAdminMode.value) {
            _allGnbMenuList = _filterMenuByAccessPermission(_allGnbMenuList, authorizationStore.getters.pageAccessPermissionList);
        }

        if (!isMyPage) {
            _allGnbMenuList.forEach((menu) => {
                if (menu.id === MENU_ID.MY_PAGE) {
                    menu.hideOnGNB = true;
                }
            });
        }

        return _allGnbMenuList;
    };

    return {
        getAllMenuList,
    };
};

const _filterMenuByRoute = (menuList: DisplayMenu[], router: VueRouter, targetWorkspaceId?: string): DisplayMenu[] => menuList.reduce((results, _menu) => {
    const menu = { ..._menu };
    if (menu.subMenuList) {
        menu.subMenuList = _filterMenuByRoute(menu.subMenuList, router, targetWorkspaceId);
        if (menu.subMenuList.length) {
            results.push(menu);
            return results;
        }
    }

    const to: RawLocation = {
        name: menu.to.name,
        params: targetWorkspaceId ? { workspaceId: targetWorkspaceId } : {},
    };
    const link = router.resolve(to);
    if (link?.href !== '/') results.push(menu);

    return results;
}, [] as DisplayMenu[]);
const _filterMenuByAccessPermission = (menuList: DisplayMenu[], pagePermissionList: MenuId[]): DisplayMenu[] => menuList.reduce((results, _menu) => {
    const menu = { ..._menu };

    if (menu.subMenuList) {
        menu.subMenuList = _filterMenuByAccessPermission(menu.subMenuList, pagePermissionList);
    }

    if (menu.subMenuList?.length) results.push(menu);
    else {
        const hasPermission = pagePermissionList.some((menuId) => menuId === menu.id);
        if (hasPermission) results.push(menu);
    }

    return results;
}, [] as DisplayMenu[]);

const _getDisplayMenuList = (menuList: Menu[], isAdminMode?: boolean): DisplayMenu[] => menuList.map((d) => {
    const menuInfo: MenuInfo = MENU_INFO_MAP[d.id];
    const routeName = isAdminMode ? makeAdminRouteName(MENU_INFO_MAP[d.id].routeName) : MENU_INFO_MAP[d.id].routeName;
    const label = d.label || i18n.t(menuInfo.translationId);

    return {
        ...d,
        id: d.id,
        label,
        icon: menuInfo.icon,
        highlightTag: menuInfo.highlightTag,
        to: { name: routeName },
        subMenuList: d.subMenuList ? _getDisplayMenuList(d.subMenuList, isAdminMode) : [],
    } as DisplayMenu;
});
