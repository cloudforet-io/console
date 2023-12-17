import { find } from 'lodash';

import type { PageAccessMenuItem } from '@/services/administration/types/page-access-menu-type';
//
// const getIndividualPagePermissions = (menuItem: PageAccessMenuItem): string[] => {
//     if (menuItem.id === 'all') return [];
//
//     // accessible permission for menu group
//     if (menuItem.isAccessible) {
//         if (menuItem.subMenuList?.length) {
//             return menuItem.subMenuList.map((subMenu) => subMenu.id);
//         }
//         return [menuItem.id];
//     }
//
//
//     // each individual menu case
//     if (menuItem.subMenuList?.length) {
//         const results: string[] = [];
//         menuItem.subMenuList.forEach((subMenu) => {
//             if (!subMenu.isAccessible) return;
//             results.push(subMenu.id);
//         });
//         return results;
//     }
//
//     return [];
// };


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
