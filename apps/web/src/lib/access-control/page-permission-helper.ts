
import type { PageAccessType } from '@/store/modules/user/type';

import type {
    PagePermissionMap,
    PagePermissionTuple, PagePermissionType,
    PagePermission,
} from '@/lib/access-control/config';
import {
    DOMAIN_ADMIN_DEFAULT_PERMISSIONS,
    BASIC_USER_DEFAULT_PERMISSIONS,
    NO_ROLE_USER_DEFAULT_PERMISSIONS,
    PAGE_PERMISSION_TYPE,
    SYSTEM_USER_DEFAULT_PERMISSIONS,
} from '@/lib/access-control/config';
import type { MenuId } from '@/lib/menu/config';
import { MENU_INFO_MAP } from '@/lib/menu/menu-info';

import type { LNBItem, LNBMenu } from '@/common/modules/navigations/lnb/type';




export const getDefaultPagePermissionList = (isAdminMode?: boolean, pageAccessType?: PageAccessType): PagePermissionTuple[] => {
    if (isAdminMode) return DOMAIN_ADMIN_DEFAULT_PERMISSIONS;
    if (pageAccessType === 'SYSTEM') return SYSTEM_USER_DEFAULT_PERMISSIONS;
    if (pageAccessType === 'BASIC') return BASIC_USER_DEFAULT_PERMISSIONS;
    return NO_ROLE_USER_DEFAULT_PERMISSIONS;
};

export const getProperPermissionType = (permissionA: PagePermissionType = PAGE_PERMISSION_TYPE.VIEW, permissionB: PagePermissionType = PAGE_PERMISSION_TYPE.VIEW): PagePermissionType => {
    if (permissionA === PAGE_PERMISSION_TYPE.MANAGE || permissionB === PAGE_PERMISSION_TYPE.MANAGE) return PAGE_PERMISSION_TYPE.MANAGE;
    return PAGE_PERMISSION_TYPE.VIEW;
};

const menuIdList = Object.keys(MENU_INFO_MAP) as MenuId[];
export const getPermissionRequiredMenuIds = (): MenuId[] => menuIdList.filter((id) => MENU_INFO_MAP[id]?.needPermissionByRole);

const permissionRequiredMenuIds: MenuId[] = getPermissionRequiredMenuIds();
export const getPagePermissionMapFromRaw = (pagePermissions: PagePermission[]): PagePermissionMap => {
    const result = {} as PagePermissionMap;
    pagePermissions.forEach((data) => {
        const { page, permission } = data ?? { page: '' };

        // in case of wildcard
        if (page === '*') {
            permissionRequiredMenuIds.forEach((id) => {
                result[id] = getProperPermissionType(permission, result[id]);
            });
            // in case of service wildcard
        } else if (page.endsWith('*')) {
            const menuId = page.replace('.*', '');
            const menuIds = permissionRequiredMenuIds.filter((id) => id.split('.')[0] === menuId);
            menuIds.forEach((id) => {
                result[id] = getProperPermissionType(permission, result[id]);
            });
            // general case
        } else {
            result[page] = getProperPermissionType(permission, result[page]);
        }
    });
    return result;
};

const hasPermissionToLNBItem = (lnbItem: LNBItem, pagePermissionList: PagePermissionTuple[]): boolean => {
    const { id } = lnbItem;
    return pagePermissionList.some(([permissionMenuId]) => permissionMenuId === id);
};
export const filterLNBMenuByPermission = (menuSet: LNBMenu[], pagePermissionList: PagePermissionTuple[]): LNBMenu[] => menuSet.reduce((results, menuData) => {
    if (Array.isArray(menuData)) {
        const filteredMenuData = menuData.filter((lnbItem) => hasPermissionToLNBItem(lnbItem, pagePermissionList));
        if (filteredMenuData.length) {
            results.push(filteredMenuData);
        }
    } else if (hasPermissionToLNBItem(menuData, pagePermissionList)) {
        results.push(menuData);
    }

    return results;
}, [] as LNBMenu[]);

export const getPermissionOfPage = (routeName: string, pagePermissions: PagePermissionTuple[]): PagePermissionType|undefined => {
    let result: PagePermissionType|undefined;
    pagePermissions.some(([id, permission]) => {
        if (id === routeName) {
            result = permission;
            return true;
        }
        // return VIEW permission if user has permission to children menu
        if (id.startsWith(`${routeName}.`)) {
            result = PAGE_PERMISSION_TYPE.VIEW;
            return true;
        }
        return false;
    });
    return result;
};
