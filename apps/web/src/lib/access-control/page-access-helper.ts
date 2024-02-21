import type { RoleType } from '@/schema/identity/role/type';

import type {
    PageAccessPermissionMap,
} from '@/lib/access-control/config';
import {
    DOMAIN_ADMIN_DEFAULT_PERMISSIONS,
    NO_ROLE_USER_DEFAULT_PERMISSIONS,
    SYSTEM_USER_DEFAULT_PERMISSIONS, WORKSPACE_MEMBER_DEFAULT_PERMISSIONS, WORKSPACE_OWNER_DEFAULT_PERMISSIONS, WORKSPACE_USER_MINIMAL_PERMISSIONS,
} from '@/lib/access-control/config';
import type { Menu, MenuId } from '@/lib/menu/config';
import { MENU_LIST } from '@/lib/menu/menu-architecture';

import type { LSBItem, LSBMenu } from '@/common/modules/navigations/lsb/type';

export const getDefaultPageAccessPermissionList = (roleType?: RoleType): MenuId[] => {
    if (roleType === 'SYSTEM_ADMIN') return SYSTEM_USER_DEFAULT_PERMISSIONS;
    if (roleType === 'DOMAIN_ADMIN') return DOMAIN_ADMIN_DEFAULT_PERMISSIONS;
    if (roleType === 'WORKSPACE_OWNER') return WORKSPACE_OWNER_DEFAULT_PERMISSIONS;
    if (roleType === 'WORKSPACE_MEMBER') return WORKSPACE_MEMBER_DEFAULT_PERMISSIONS;
    return NO_ROLE_USER_DEFAULT_PERMISSIONS;
};

export const getMinimalPageAccessPermissionList = (roleType?: RoleType): MenuId[] => {
    if (roleType === 'SYSTEM_ADMIN') return SYSTEM_USER_DEFAULT_PERMISSIONS;
    if (roleType === 'DOMAIN_ADMIN') return DOMAIN_ADMIN_DEFAULT_PERMISSIONS;
    if (roleType === 'WORKSPACE_OWNER') return WORKSPACE_USER_MINIMAL_PERMISSIONS;
    if (roleType === 'WORKSPACE_MEMBER') return WORKSPACE_USER_MINIMAL_PERMISSIONS;
    return NO_ROLE_USER_DEFAULT_PERMISSIONS;
};

export const flattenMenu = (menuList: Menu[]): Menu[] => menuList.flatMap((menu) => [
    { id: menu.id, needPermissionByRole: menu.needPermissionByRole },
    ...(menu.subMenuList ? flattenMenu(menu.subMenuList) : []),
]);

export const getPageAccessPermissionMapFromRawData = (pageAccessPermissions: string[]): PageAccessPermissionMap => {
    const result = {} as PageAccessPermissionMap;
    const flattendPermissionRequiredMenuList = flattenMenu(MENU_LIST);

    pageAccessPermissions.forEach((page) => {
        // in case of wildcard
        if (page === '*') {
            flattendPermissionRequiredMenuList.forEach(({ id }) => {
                result[id] = true;
            });
            // in case of service wildcard
        } else if (page.endsWith('*')) {
            const menuId = page.replace('.*', '');
            const foundServiceMenuById = MENU_LIST.find(({ id }) => id === menuId);
            if (!foundServiceMenuById) return;
            flattenMenu([foundServiceMenuById]).forEach(({ id }) => {
                result[id] = true;
            });
            // general case -  asset_inventory.service_account
        } else {
            const endMenuIdByPageName = page.split('.').reverse()[0];
            result[endMenuIdByPageName] = true;
        }
    });
    return result;
};

const hasAccessPermissionToLSBItem = (lsbItem: LSBItem, pageAccessList: MenuId[]): boolean => {
    const { id } = lsbItem;
    return pageAccessList.some((menuId) => menuId === id);
};
export const filterLSBMenuByAccessPermission = (menuSet: LSBMenu[], pagePermissionList: MenuId[]): LSBMenu[] => menuSet.reduce((results, menuData) => {
    if (Array.isArray(menuData)) {
        const filteredMenuData = menuData.filter((lsbItem) => hasAccessPermissionToLSBItem(lsbItem, pagePermissionList));
        if (filteredMenuData.length) {
            results.push(filteredMenuData);
        }
    } else if (hasAccessPermissionToLSBItem(menuData, pagePermissionList)) {
        results.push(menuData);
    }

    return results;
}, [] as LSBMenu[]);

export const getAccessPermissionOfMenu = (menuId: MenuId, pagePermissions: MenuId[]): boolean => pagePermissions.some((id) => id === menuId);
