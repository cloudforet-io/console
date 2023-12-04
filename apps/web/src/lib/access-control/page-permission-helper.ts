
import type { PageAccessType } from '@/store/modules/user/type';

import type {
    PagePermissionMap,
    PagePermissionTuple, PagePermissionType,
    PagePermission,
} from '@/lib/access-control/config';
import {
    BASIC_USER_DEFAULT_PERMISSIONS,
    NO_ROLE_USER_DEFAULT_PERMISSIONS,
    PAGE_PERMISSION_TYPE,
    SYSTEM_USER_DEFAULT_PERMISSIONS,
} from '@/lib/access-control/config';
import type { Menu } from '@/lib/menu/config';

import type { LNBItem, LNBMenu } from '@/common/modules/navigations/lnb/type';




export const getDefaultPagePermissionList = (pageAccessType?: PageAccessType): PagePermissionTuple[] => {
    if (pageAccessType === 'SYSTEM') return SYSTEM_USER_DEFAULT_PERMISSIONS;
    if (pageAccessType === 'USER') return BASIC_USER_DEFAULT_PERMISSIONS;
    return NO_ROLE_USER_DEFAULT_PERMISSIONS;
};

export const getProperPermissionType = (permissionA: PagePermissionType = PAGE_PERMISSION_TYPE.VIEW, permissionB: PagePermissionType = PAGE_PERMISSION_TYPE.VIEW): PagePermissionType => {
    if (permissionA === PAGE_PERMISSION_TYPE.MANAGE || permissionB === PAGE_PERMISSION_TYPE.MANAGE) return PAGE_PERMISSION_TYPE.MANAGE;
    return PAGE_PERMISSION_TYPE.VIEW;
};

const flattenMenu = (menuList: Menu[]) => menuList.flatMap((menu) => [
    { id: menu.id, needPermissionByRole: menu.needPermissionByRole },
    ...menu.subMenuList?.map((subMenu) => ({
        id: subMenu.id,
        needPermissionByRole: subMenu.needPermissionByRole,
    })) ?? [],
]);

const filterMenuByPermission = (menuList: Menu[]): Menu[] => menuList.filter((menu) => menu.needPermissionByRole)
    .map((menu) => ({
        ...menu,
        subMenulist: menu.subMenuList ? filterMenuByPermission(menu.subMenuList) : [],
    }));


export const getPagePermissionMapFromRaw = (pagePermissions: PagePermission[], menuList: Menu[]): PagePermissionMap => {
    const result = {} as PagePermissionMap;
    const filterdMenuListByRequiredPermission = filterMenuByPermission(menuList);
    const flattendPermissionRequiredMenuList = flattenMenu(filterdMenuListByRequiredPermission);

    pagePermissions.forEach((data) => {
        const { page, permission } = data ?? { page: '' };

        // in case of wildcard
        if (page === '*') {
            flattendPermissionRequiredMenuList.forEach(({ id }) => {
                result[id] = getProperPermissionType(permission, result[id]);
            });
            // in case of service wildcard
        } else if (page.endsWith('*')) {
            const menuId = page.replace('.*', '');
            const foundServiceMenuById = filterdMenuListByRequiredPermission.find(({ id }) => id === menuId);
            if (!foundServiceMenuById) return;
            flattenMenu([foundServiceMenuById]).forEach(({ id }) => {
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

export const getPermissionOfPage = (menuId: string, pagePermissions: PagePermissionTuple[], menuList: Menu[]): PagePermissionType|undefined => {
    let result: PagePermissionType|undefined;
    const filterdMenuListByRequiredPermission = filterMenuByPermission(menuList);

    pagePermissions.some(([id, permission]) => {
        if (id === menuId) {
            result = permission;
            return true;
        }

        // return VIEW permission if user has permission to children menu
        const foundServiceMenuById = filterdMenuListByRequiredPermission.find((menu) => menu.id === menuId);
        if (foundServiceMenuById) {
            result = PAGE_PERMISSION_TYPE.VIEW;
            return true;
        }
        return false;
    });
    return result;
};
