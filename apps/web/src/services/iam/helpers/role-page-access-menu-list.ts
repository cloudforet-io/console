import type { RoleType } from '@/api-clients/identity/role/type';

import { PAGE_ACCESS } from '@/lib/access-control/config';
import { getDefaultPageAccessPermissionList, getEnabledMenus } from '@/lib/access-control/page-access-helper';
import config from '@/lib/config';
import type { Menu, MenuId } from '@/lib/menu/config';
import { MENU_ID } from '@/lib/menu/config';
import { MENU_INFO_MAP } from '@/lib/menu/menu-info';

import type { PageAccessMenuItem } from '@/services/iam/types/role-type';

const flattenSubMenuList = (subMenuList: Menu[], defaultMenuIds: MenuId[], translationIds?: string[]): PageAccessMenuItem[] => {
    if (!subMenuList) return [];
    let results: PageAccessMenuItem[] = [];
    subMenuList.forEach((subMenu) => {
        if (!defaultMenuIds.includes(subMenu.id)) return;

        const menuInfo = MENU_INFO_MAP[subMenu.id];
        if (subMenu.subMenuList?.length) {
            results = results.concat(flattenSubMenuList(subMenu.subMenuList, defaultMenuIds, [...translationIds || [], menuInfo.translationId]));
        } else {
            results.push({
                id: subMenu.id,
                translationIds: [...translationIds || [], menuInfo.translationId],
                isAccessible: false,
            });
        }
    });
    return results;
};

export const getPageAccessMenuListByRoleType = (roleType: RoleType): PageAccessMenuItem[] => {
    const globalConfig = config.get('SERVICES') || {};
    const results: PageAccessMenuItem[] = [];
    const defaultMenuIdsByRoleType = getDefaultPageAccessPermissionList(roleType);
    const menuListByVersion = getEnabledMenus(globalConfig);
    menuListByVersion.forEach((menu) => {
        if (defaultMenuIdsByRoleType.includes(menu.id)) {
            if (menu.id === MENU_ID.WORKSPACE_HOME) return;
            const menuInfo = MENU_INFO_MAP[menu.id];
            results.push({
                id: menu.id,
                translationIds: [menuInfo.translationId],
                isParent: true,
                accessType: PAGE_ACCESS.WRITABLE,
                subMenuList: flattenSubMenuList(menu?.subMenuList ?? [], defaultMenuIdsByRoleType),
            });
        }
    });
    return results;
};

export const getPageAccessList = (menuItems: PageAccessMenuItem[]): string[] => {
    const results: string[] = [];

    menuItems.forEach((menu) => {
        if (menu.isParent) {
            // Access type is restricted
            if (menu.accessType === PAGE_ACCESS.RESTRICTED) {
                results.push(`${menu.id}:${menu.accessType}.*`);
                return;
            }

            const subMenuList = menu.subMenuList || [];
            const allSubMenusAccessible = subMenuList.every((subMenu) => subMenu.isAccessible);
            const accessibleSubMenus = subMenuList.filter((subMenu) => subMenu.isAccessible && subMenu.id !== menu.id);

            const accessTypePart = `${menu.id}:${menu.accessType}`;

            if (allSubMenusAccessible) {
                // If all submenus are accessible, push main menu with wildcard
                results.push(`${accessTypePart}.*`);
            } else if (accessibleSubMenus.length > 0) {
                // If some submenus are accessible, push each individually
                accessibleSubMenus.forEach((subMenu) => {
                    results.push(`${accessTypePart}.${subMenu.id}`);
                });
            } else {
                // If no submenus are accessible, push only the main menu access type
                results.push(`${accessTypePart}.*`);
            }
        } else if (menu.isAccessible) {
            results.push(`${menu.id}.*`);
        }
    });

    return results;
};
