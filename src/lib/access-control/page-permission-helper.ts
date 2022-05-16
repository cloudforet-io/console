/* eslint-disable import/no-cycle */
import { MenuId, MenuInfo } from '@/lib/menu/config';
import { MENU_INFO_MAP } from '@/lib/menu/menu-info';
import { ACCESS_LEVEL } from '@/lib/access-control/config';
import { LNBItem, LNBMenu } from '@/common/modules/navigations/lnb/type';

export const PAGE_PERMISSION_TYPE = Object.freeze({
    VIEW: 'VIEW',
    MANAGE: 'MANAGE',
} as const);

export type PagePermissionType = typeof PAGE_PERMISSION_TYPE[keyof typeof PAGE_PERMISSION_TYPE];

export interface PagePermission {
    page: string;
    permission: PagePermissionType
}
export type PagePermissionMap = Record<string, PagePermissionType>
export type PagePermissionTuple = Array<string|PagePermissionType>

const getProperPermissionType = (permissionA: PagePermissionType = 'VIEW', permissionB: PagePermissionType = 'VIEW'): PagePermissionType => {
    if (permissionA === PAGE_PERMISSION_TYPE.MANAGE || permissionB === PAGE_PERMISSION_TYPE.MANAGE) return PAGE_PERMISSION_TYPE.MANAGE;
    return PAGE_PERMISSION_TYPE.VIEW;
};

const menuIdList = Object.keys(MENU_INFO_MAP) as MenuId[];
const getPermissionRequiredMenuIds = (): MenuId[] => menuIdList.filter((id) => {
    const info = MENU_INFO_MAP[id];
    return ACCESS_LEVEL[info.accessLevel] >= ACCESS_LEVEL.VIEW_PERMISSION;
});

const permissionRequiredMenuIds: MenuId[] = getPermissionRequiredMenuIds();
export const getPagePermissionMap = (pagePermissions: PagePermission[]): PagePermissionMap => {
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
            const menuIds = permissionRequiredMenuIds.filter(id => id.split('.')[0] === menuId);
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

const getPermissionRequiredMenuInfo = (): Partial<Record<MenuId, MenuInfo>> => {
    const result: Partial<Record<MenuId, MenuInfo>> = {};
    menuIdList.forEach((id) => {
        const info = MENU_INFO_MAP[id];
        if (ACCESS_LEVEL[info.accessLevel] >= ACCESS_LEVEL.VIEW_PERMISSION) {
            result[id] = info;
        }
    });
    return result;
};

const permissionRequiredMenuInfoMap = getPermissionRequiredMenuInfo();
const hasPermissionToLNBItem = (lnbItem: LNBItem, pagePermissionList: PagePermissionTuple[]): boolean => {
    const { id } = lnbItem;
    if (!permissionRequiredMenuInfoMap[id ?? '']) return true;
    return pagePermissionList.some(([permissionMenuId]) => permissionMenuId === id);
};
export const filterLNBMenuByPermission = (menuSet: LNBMenu[], pagePermissionList: PagePermissionTuple[]): LNBMenu[] => menuSet.reduce((results, menuData) => {
    if (Array.isArray(menuData)) {
        const filteredMenuData = menuData.filter(lnbItem => hasPermissionToLNBItem(lnbItem, pagePermissionList));
        if (filteredMenuData.length) {
            results.push(filteredMenuData);
        }
    } else if (hasPermissionToLNBItem(menuData, pagePermissionList)) {
        results.push(menuData);
    }

    return results;
}, [] as LNBMenu[]);
