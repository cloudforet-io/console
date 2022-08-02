import { ACCESS_LEVEL } from '@/lib/access-control/config';
import type { MenuId, MenuInfo } from '@/lib/menu/config';
import { MENU_ID } from '@/lib/menu/config';
import { MENU_INFO_MAP } from '@/lib/menu/menu-info';

import type { LNBItem, LNBMenu } from '@/common/modules/navigations/lnb/type';

export const PAGE_PERMISSION_TYPE = {
    VIEW: 'VIEW',
    MANAGE: 'MANAGE',
} as const;

const GENERAL_USER_DEFAULT_PERMISSIONS: PagePermissionTuple[] = [
    [MENU_ID.DASHBOARD, PAGE_PERMISSION_TYPE.VIEW],
    [MENU_ID.MY_PAGE, PAGE_PERMISSION_TYPE.MANAGE],
    [MENU_ID.MY_PAGE_ACCOUNT, PAGE_PERMISSION_TYPE.MANAGE],
    [MENU_ID.MY_PAGE_ACCOUNT_PROFILE, PAGE_PERMISSION_TYPE.MANAGE],
    [MENU_ID.MY_PAGE_NOTIFICATIONS, PAGE_PERMISSION_TYPE.MANAGE],
    [MENU_ID.MY_PAGE_API_KEY, PAGE_PERMISSION_TYPE.MANAGE],
    [MENU_ID.MY_PAGE_INFO, PAGE_PERMISSION_TYPE.VIEW],
    [MENU_ID.MY_PAGE_NOTICE, PAGE_PERMISSION_TYPE.VIEW],
];
const NO_ROLE_USER_DEFAULT_PERMISSIONS: PagePermissionTuple[] = [
    [MENU_ID.MY_PAGE, PAGE_PERMISSION_TYPE.VIEW],
    [MENU_ID.MY_PAGE_ACCOUNT, PAGE_PERMISSION_TYPE.VIEW],
    [MENU_ID.MY_PAGE_ACCOUNT_PROFILE, PAGE_PERMISSION_TYPE.MANAGE],
];
const DOMAIN_OWNER_DEFAULT_PERMISSIONS: PagePermissionTuple[] = [
    [MENU_ID.ADMINISTRATION_ROLE, PAGE_PERMISSION_TYPE.MANAGE],
    [MENU_ID.ADMINISTRATION_POLICY, PAGE_PERMISSION_TYPE.MANAGE],
    [MENU_ID.ADMINISTRATION_USER, PAGE_PERMISSION_TYPE.MANAGE],
    [MENU_ID.MY_PAGE, PAGE_PERMISSION_TYPE.MANAGE],
    [MENU_ID.MY_PAGE_ACCOUNT, PAGE_PERMISSION_TYPE.MANAGE],
    [MENU_ID.MY_PAGE_ACCOUNT_PROFILE, PAGE_PERMISSION_TYPE.MANAGE],
    [MENU_ID.MY_PAGE_INFO, PAGE_PERMISSION_TYPE.MANAGE],
    [MENU_ID.MY_PAGE_NOTICE, PAGE_PERMISSION_TYPE.MANAGE],
];

export const getDefaultPagePermissionList = (isDomainOwner: boolean, hasAnyPermissions: boolean): PagePermissionTuple[] => {
    if (isDomainOwner) return DOMAIN_OWNER_DEFAULT_PERMISSIONS;
    if (hasAnyPermissions) return GENERAL_USER_DEFAULT_PERMISSIONS;
    return NO_ROLE_USER_DEFAULT_PERMISSIONS;
};


export type PagePermissionType = typeof PAGE_PERMISSION_TYPE[keyof typeof PAGE_PERMISSION_TYPE];

// backend data format of page permissions. page includes wildcard('*').
export interface RawPagePermission {
    page: string;
    permission: PagePermissionType
}
// refined page permission types. page NEVER includes wildcard.
export type PagePermissionMap = Record<string, PagePermissionType>
export type PagePermissionTuple = [page: string, permission: PagePermissionType];

export const getProperPermissionType = (permissionA: PagePermissionType = PAGE_PERMISSION_TYPE.VIEW, permissionB: PagePermissionType = PAGE_PERMISSION_TYPE.VIEW): PagePermissionType => {
    if (permissionA === PAGE_PERMISSION_TYPE.MANAGE || permissionB === PAGE_PERMISSION_TYPE.MANAGE) return PAGE_PERMISSION_TYPE.MANAGE;
    return PAGE_PERMISSION_TYPE.VIEW;
};

const menuIdList = Object.keys(MENU_INFO_MAP) as MenuId[];
export const getPermissionRequiredMenuIds = (): MenuId[] => menuIdList.filter((id) => {
    const info = MENU_INFO_MAP[id];
    return info.accessLevel >= ACCESS_LEVEL.VIEW_PERMISSION;
});

const permissionRequiredMenuIds: MenuId[] = getPermissionRequiredMenuIds();
export const getPagePermissionMapFromRaw = (pagePermissions: RawPagePermission[]): PagePermissionMap => {
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
        if (info.accessLevel >= ACCESS_LEVEL.VIEW_PERMISSION) {
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

export const getPermissionOfPage = (menuId: MenuId, pagePermissions: PagePermissionTuple[]): PagePermissionType|undefined => {
    let result: PagePermissionType|undefined;
    pagePermissions.some(([id, permission]) => {
        if (id === menuId) {
            result = permission;
            return true;
        }
        // return VIEW permission if user has permission to children menu
        if (id.startsWith(`${menuId}.`)) {
            result = PAGE_PERMISSION_TYPE.VIEW;
            return true;
        }
        return false;
    });
    return result;
};
