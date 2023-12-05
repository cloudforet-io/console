import type { Menu } from '@/lib/menu/config';
import { MENU_LIST } from '@/lib/menu/menu-architecture';
import { MENU_INFO_MAP } from '@/lib/menu/menu-info';

import type { PageAccessMenuItem } from '@/services/administration/types/page-access-menu-type';

const flattenSubMenuList = (subMenuList?: Menu[], translationIds?: string[]): PageAccessMenuItem[] => {
    if (!subMenuList) return [];
    let results: PageAccessMenuItem[] = [];
    subMenuList.forEach((subMenu) => {
        if (!subMenu.needPermissionByRole) return;

        const menuInfo = MENU_INFO_MAP[subMenu.id];
        if (subMenu.subMenuList?.length) {
            results = results.concat(flattenSubMenuList(subMenu.subMenuList, [...translationIds || [], menuInfo.translationId]));
        } else {
            results.push({
                id: subMenu.id,
                translationIds: [...translationIds || [], menuInfo.translationId],
                isViewed: false,
                isManaged: false,
                hideMenu: false,
            });
        }
    });
    return results;
};

export const getPageAccessMenuList = (defaultItems: PageAccessMenuItem[] = []): PageAccessMenuItem[] => {
    const results: PageAccessMenuItem[] = [];
    MENU_LIST.forEach((menu) => {
        if (menu.needPermissionByRole) {
            const menuInfo = MENU_INFO_MAP[menu.id];
            results.push({
                id: menu.id,
                translationIds: [menuInfo.translationId],
                isViewed: false,
                isManaged: false,
                hideMenu: false,
                isParent: true,
                subMenuList: flattenSubMenuList(menu?.subMenuList),
            });
        }
    });
    return defaultItems.concat(results);
};
