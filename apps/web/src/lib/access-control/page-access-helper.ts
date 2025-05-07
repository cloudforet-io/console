import type { RoleType } from '@/api-clients/identity/role/type';

import type {
    PageAccessMap,
} from '@/lib/access-control/config';
import {
    DOMAIN_ADMIN_DEFAULT_PERMISSIONS,
    NO_ROLE_USER_DEFAULT_PERMISSIONS, PAGE_ACCESS,
    SYSTEM_USER_DEFAULT_PERMISSIONS,
    WORKSPACE_MEMBER_DEFAULT_PERMISSIONS,
    WORKSPACE_OWNER_DEFAULT_PERMISSIONS,
    WORKSPACE_USER_MINIMAL_PERMISSIONS,
} from '@/lib/access-control/config';
import config from '@/lib/config';
import type { GlobalServiceConfig } from '@/lib/config/global-config/types/type';
import type { Menu, MenuId } from '@/lib/menu/config';

import type { LSBItem, LSBMenu } from '@/common/modules/navigations/lsb/type';

import {
    ALERT_V1_WORKSPACE_PAGE_ACCESS_MENU_LIST,
    ALERT_V2_WORKSPACE_PAGE_ACCESS_MENU_LIST, DEFAULT_WORKSPACE_PAGE_ACCESS_MENU_LIST,
} from '@/services/iam/constants/role-constant';
import type { PageAccessMenuByConfig } from '@/services/iam/types/role-type';

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

export const getPageAccessMapFromRawData = ({
    pageAccessPermissions,
    isRolePage,
    menuList,
}: {
    pageAccessPermissions?: string[],
    isRolePage?: boolean,
    menuList?: Menu[],
}): PageAccessMap => {
    const globalConfig = config.get('SERVICES') || {};
    const result: PageAccessMap = {};
    const menuListByVersion = !isRolePage ? (menuList || []) : getEnabledMenus(globalConfig);
    const flattenedMenuList = flattenMenu(menuListByVersion);
    const setPermissions = (id: string, read = true, write = true, access = true) => {
        result[id] = { read, write, access };
    };

    const handleWildcardPermissions = (menuId: string, accessType: string) => {
        const menu = menuListByVersion.find(({ id }) => id === menuId);
        if (!menu) return;

        const write = accessType === PAGE_ACCESS.WRITABLE;
        const access = accessType !== PAGE_ACCESS.RESTRICTED;

        setPermissions(menuId, access, write, access);

        menu.subMenuList?.forEach(({ id: subMenuId }) => {
            setPermissions(subMenuId, access, write, access);
        });
    };

    pageAccessPermissions?.forEach((page) => {
        if (page === '*') {
            flattenedMenuList.forEach(({ id }) => setPermissions(id));
        } else if (page.endsWith('.*')) {
            const [menuId, accessType = PAGE_ACCESS.WRITABLE] = page.replace('.*', '').split(':');
            handleWildcardPermissions(menuId, accessType);
        } else {
            const [menuId, accessType = PAGE_ACCESS.WRITABLE] = page.split('.')[0].split(':');
            const subMenuId = page.split('.').slice(1).join('.');

            setPermissions(menuId, true, accessType === PAGE_ACCESS.WRITABLE, true);

            const menu = menuListByVersion.find(({ id }) => id === menuId);
            const subMenuExists = menu?.subMenuList?.some(({ id }) => id === subMenuId);

            setPermissions(subMenuId, subMenuExists, accessType === PAGE_ACCESS.WRITABLE, subMenuExists);
        }
    });

    // Set remaining items with no access
    flattenedMenuList.forEach(({ id }) => {
        if (!result[id]) {
            setPermissions(id, false, false, false);
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

export const checkAllMenuReadonly = (permissions: string[]) => permissions.every((item) => {
    const accessType = item.split('.*')[0].split(':')[1];
    return accessType === PAGE_ACCESS.READONLY;
});

export const getEnabledMenus = (globalServiceConfig: GlobalServiceConfig): Menu[] => {
    const versionMenuMap = {
        V1: ALERT_V1_WORKSPACE_PAGE_ACCESS_MENU_LIST,
        V2: ALERT_V2_WORKSPACE_PAGE_ACCESS_MENU_LIST,
    };

    const getAllMenus = (version: string): PageAccessMenuByConfig[] => [
        ...DEFAULT_WORKSPACE_PAGE_ACCESS_MENU_LIST,
        ...versionMenuMap[version],
    ];

    return Object.entries(globalServiceConfig)
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        .filter(([_, cfg]) => cfg.ENABLED)
        .flatMap(([configKey, cfg]) => {
            const targetMenus = getAllMenus(cfg.VERSION);
            const matchedMenu = targetMenus
                .filter((menuItem) => menuItem.key === configKey);

            return matchedMenu.map((i) => ({
                id: i.id,
                subMenuList: (i.subMenuList || [{ id: i.id }]) as Menu[],
            }));
        });
};
