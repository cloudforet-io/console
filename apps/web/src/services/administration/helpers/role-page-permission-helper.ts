import { find } from 'lodash';

import type { PageAccessMenuItem } from '@/services/administration/types/role-type';

export const getPageAccessList = (menuItems: PageAccessMenuItem[]): string[] => {
    // all case
    const allItem = find(menuItems, { id: 'all' });
    if (allItem && allItem.isAccessible) return ['*'];

    const results: string[] = [];
    menuItems.forEach((menu) => {
        // accessible permission for menu group
        if (menu.isAccessible) {
            results.push(`${menu.id}.*`);
            return;
        }

        // each individual menu case
        menu.subMenuList?.forEach((subMenu) => {
            if (!subMenu.isAccessible) return;
            results.push(`${menu.id}.${subMenu.id}`);
        });
    });

    return results;
};

export const stringifyPermission = (permissions: Array<string>|string) => permissions?.toString().replace(/,/gi, '\n') ?? '';

