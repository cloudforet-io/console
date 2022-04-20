import { Menu } from '@/store/modules/display/type';

interface MenuData {
    id: string;
    label: string;
    parents?: MenuData[];
}

export const getAllMenuList = (menuList: Menu[], parent?: MenuData): MenuData[] => {
    const results: MenuData[] = [];
    if (parent) {
        results.push({ id: parent.id, label: parent.label, parents: parent.parents });
    }
    menuList.forEach((menu) => {
        if (parent) {
            const tempMenu: MenuData = {
                id: menu.id,
                label: menu.label,
                parents: [{ id: parent.id, label: parent.label }],
            };
            if (parent?.parents && tempMenu.parents) {
                tempMenu.parents.unshift(...parent.parents);
            }
            if (menu?.sub_menu?.length) {
                results.push(...getAllMenuList(menu.sub_menu, tempMenu));
            } else {
                results.push(tempMenu);
            }
        } else if (menu?.sub_menu?.length) {
            results.push(...getAllMenuList(menu.sub_menu, menu));
        }
    });
    return results;
};
