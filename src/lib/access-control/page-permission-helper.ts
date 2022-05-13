/* eslint-disable import/no-cycle */
import { MenuId, MenuInfo } from '@/lib/menu/config';
import { MENU_INFO_MAP } from '@/lib/menu/menu-info';
import { ACCESS_LEVEL } from '@/lib/access-control/config';

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
    if (permissionA === 'MANAGE' || permissionB === 'MANAGE') return 'MANAGE';
    return 'VIEW';
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
export const filterMenuIdsByPermission = (menuIds: MenuId[], pagePermissionList: PagePermissionTuple[]): MenuId[] => menuIds.filter((menuId) => {
    const hasPermission = pagePermissionList.some(([permissionMenuId]) => !permissionRequiredMenuInfoMap[permissionMenuId] || permissionMenuId === menuId);
    return hasPermission;
});
