import { FAVORITE_TYPE, FavoriteItem, FavoriteState } from '@/store/modules/favorite/type';
import { Getter } from 'vuex';
import { find } from 'lodash';
import { Menu } from '@/store/modules/display/type';
import { MENU_ICON } from '@/common/modules/navigations/gnb/config';

interface MenuData {
    id: string;
    label: string;
    parents?: MenuData[];
}

const getAllMenuList = (menuList: Menu[], parent?: Menu): MenuData[] => {
    const results: MenuData[] = [];
    if (parent) {
        results.push({ id: parent.id, label: parent.label });
    }
    menuList.forEach((menu) => {
        if (parent) {
            results.push({
                id: menu.id,
                label: menu.label,
                parents: [{ id: parent.id, label: parent.label }],
            });
        }
        if (menu?.sub_menu?.length) {
            results.push(...getAllMenuList(menu.sub_menu, menu));
        }
    });
    return results;
};

export const menuItems: Getter<FavoriteState, any> = (state: FavoriteState, getters, rootState): FavoriteItem[] => {
    const menuList: MenuData[] = getAllMenuList(rootState.display.menuList);
    const results: FavoriteItem[] = [];
    state.menuItems.forEach((d) => {
        const menu: MenuData | undefined = find(menuList, { id: d.itemId });
        if (menu) {
            results.push({
                favoriteType: FAVORITE_TYPE.MENU,
                itemId: menu.id,
                name: menu.id,
                label: menu.label,
                icon: MENU_ICON[menu.id.split('.')[0]],
                parents: menu?.parents?.map(p => ({ name: p.id, label: p.label })) || [],
            });
        }
    });
    return results;
};
export const projectItems: Getter<FavoriteState, any> = (state: FavoriteState, getters, rootState): FavoriteItem[] => state.projectItems.map((d) => {
    const resource = rootState.reference.project.items[d.itemId];
    const result = {
        ...d,
        name: d.itemId,
        label: resource?.name || d.itemId,
        icon: 'ic_tree_project',
    };
    if (resource?.data?.groupInfo?.id) {
        return {
            ...result,
            parents: [{
                name: resource?.data?.groupInfo?.id,
                label: resource?.data?.groupInfo?.name,
            }],
        };
    }
    return result;
});
export const projectGroupItems: Getter<FavoriteState, any> = (state: FavoriteState, getters, rootState): FavoriteItem[] => state.projectGroupItems.map((d) => {
    const resource = rootState.reference.projectGroup.items[d.itemId];
    const result = {
        ...d,
        name: d.itemId,
        label: resource?.name || d.itemId,
        icon: 'ic_tree_project-group',
    };
    if (resource?.data?.parentGroupInfo?.project_group_id) {
        return {
            ...result,
            parents: [{
                name: resource?.data?.parentGroupInfo?.project_group_id,
                label: resource?.data?.parentGroupInfo?.name,
            }],
        };
    }
    return result;
});
export const cloudServiceTypeItems: Getter<FavoriteState, any> = (state: FavoriteState, getters, rootState): FavoriteItem[] => state.cloudServiceTypeItems.map((d) => {
    const resource = rootState.reference.cloudServiceType.items[d.itemId];
    return {
        ...d,
        name: d.itemId,
        label: resource?.name || d.itemId,
        icon: resource?.icon,
        provider: resource?.data?.provider,
        parents: [{
            name: resource?.data?.group,
            label: resource?.data?.group,
        }],
    };
});
