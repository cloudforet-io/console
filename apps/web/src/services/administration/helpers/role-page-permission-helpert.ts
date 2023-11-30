import { find } from 'lodash';

import { ROLE_TYPE } from '@/schema/identity/role/constant';
import type { RoleType } from '@/schema/identity/role/type';

import { PAGE_PERMISSION_TYPE } from '@/lib/access-control/config';
import type { PagePermission } from '@/lib/access-control/config';

import type { PageAccessMenuItem } from '@/services/administration/types/page-access-menu-type';

const getIndividualPagePermissions = (menuItem: PageAccessMenuItem): PagePermission[] => {
    if (menuItem.id === 'all') return [];

    // MANAGE permission for menu group
    if (menuItem.isManaged) {
        if (menuItem.subMenuList?.length) {
            return menuItem.subMenuList.map((subMenu) => ({ page: subMenu.id, permission: PAGE_PERMISSION_TYPE.MANAGE }));
        }
        return [{ page: menuItem.id, permission: PAGE_PERMISSION_TYPE.MANAGE }];
    }

    // VIEW permission for menu group
    if (menuItem.isViewed) {
        if (menuItem.subMenuList?.length) {
            // Menu group with VIEW permission can contain sub menu whose permission is MANAGE.
            return menuItem.subMenuList.map((subMenu) => ({ page: subMenu.id, permission: subMenu.isManaged ? PAGE_PERMISSION_TYPE.MANAGE : PAGE_PERMISSION_TYPE.VIEW }));
        }
        return [{ page: menuItem.id, permission: PAGE_PERMISSION_TYPE.VIEW }];
    }

    // each individual menu case
    if (menuItem.subMenuList?.length) {
        const results: PagePermission[] = [];
        menuItem.subMenuList.forEach((subMenu) => {
            if (!subMenu.isManaged && !subMenu.isViewed) return;
            const permission = subMenu.isManaged ? PAGE_PERMISSION_TYPE.MANAGE : PAGE_PERMISSION_TYPE.VIEW;
            results.push({ page: subMenu.id, permission });
        });
        return results;
    }

    return [];
};


export const getPagePermissions = (menuItems: PageAccessMenuItem[], roleType: RoleType): PagePermission[] => {
    // all case
    const allItem = find(menuItems, { id: 'all' });
    if (allItem && allItem.isManaged) {
        if (roleType === ROLE_TYPE.WORKSPACE_OWNER) {
            return menuItems.map((menuItem) => getIndividualPagePermissions(menuItem)).flat();
        }
        return [{ page: '*', permission: PAGE_PERMISSION_TYPE.MANAGE }];
    }

    let results: PagePermission[] = [];
    menuItems.forEach((menu) => {
        // PROJECT role type case
        if (roleType === ROLE_TYPE.WORKSPACE_OWNER) {
            results = results.concat(getIndividualPagePermissions(menu));
            return;
        }

        // MANAGE permission for menu group
        if (menu.isManaged) {
            results.push({ page: `${menu.id}.*`, permission: PAGE_PERMISSION_TYPE.MANAGE });
            return;
        }

        // VIEW permission for menu group
        if (menu.isViewed) {
            results.push({ page: `${menu.id}.*`, permission: PAGE_PERMISSION_TYPE.VIEW });
            // Menu group with VIEW permission can contain sub menu whose permission is MANAGE.
            menu.subMenuList?.forEach((subMenu) => {
                if (subMenu.isManaged) results.push({ page: subMenu.id, permission: PAGE_PERMISSION_TYPE.MANAGE });
            });
            return;
        }

        // each individual menu case
        menu.subMenuList?.forEach((subMenu) => {
            if (!subMenu.isManaged && !subMenu.isViewed) return;
            const permission = subMenu.isManaged ? PAGE_PERMISSION_TYPE.MANAGE : PAGE_PERMISSION_TYPE.VIEW;
            results.push({ page: subMenu.id, permission });
        });
    });

    if (allItem && allItem.isViewed) return [{ page: '*', permission: PAGE_PERMISSION_TYPE.VIEW }, ...results];
    return results;
};
