import { MENU_ID, MenuId } from '@/lib/menu/config';

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
// export type PagePermissionTuple = [page: string, permission: PagePermissionType] // eslint parsing error occurs
export type PagePermissionTuple = Array<string|PagePermissionType>

const getProperPermissionType = (permissionA: PagePermissionType = 'VIEW', permissionB: PagePermissionType = 'VIEW'): PagePermissionType => {
    if (permissionA === 'MANAGE' || permissionB === 'MANAGE') return 'MANAGE';
    return 'VIEW';
};

const permissionRequiredMenuIds: readonly MenuId[] = Object.freeze([
    MENU_ID.ASSET_INVENTORY_CLOUD_SERVICE,
    MENU_ID.ASSET_INVENTORY_SERVER,
    MENU_ID.ASSET_INVENTORY_SERVICE_ACCOUNT,
    MENU_ID.COST_EXPLORER_DASHBOARD,
    MENU_ID.COST_EXPLORER_COST_ANALYSIS,
    MENU_ID.COST_EXPLORER_BUDGET,
    MENU_ID.ALERT_MANAGER_DASHBOARD,
    MENU_ID.ALERT_MANAGER_ALERT,
    MENU_ID.ALERT_MANAGER_ESCALATION_POLICY,
    MENU_ID.ADMINISTRATION_USER,
    MENU_ID.ADMINISTRATION_ROLE,
    MENU_ID.ADMINISTRATION_POLICY,
]);

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
