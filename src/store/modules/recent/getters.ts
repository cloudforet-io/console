import { find } from 'lodash';
import { Getter } from 'vuex';
import {
    RECENT_TYPE, RecentItem, RecentState,
} from '@/store/modules/recent/type';
import { MENU_ICON } from '@/common/modules/navigations/gnb/config';
import { getAllMenuList } from '@/lib/helper/menu-helper';


export const menuItems: Getter<RecentState, any> = (state: RecentState, getters, rootState): RecentItem[] => {
    const menuList = getAllMenuList(rootState.display.menuList);
    const results: RecentItem[] = [];
    state.menuItems.forEach((d) => {
        const menu = find(menuList, { id: d.itemId });
        if (menu) {
            results.push({
                itemType: RECENT_TYPE.MENU,
                itemId: menu.id,
                name: menu.id,
                label: menu.label,
                icon: MENU_ICON[menu.parents?.[0]?.id ?? menu.id],
                parents: menu?.parents,
            });
        }
    });
    return results;
};
export const projectItems: Getter<RecentState, any> = (state: RecentState, getters, rootState): RecentItem[] => state.projectItems.map((d) => {
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
export const projectGroupItems: Getter<RecentState, any> = (state: RecentState, getters, rootState): RecentItem[] => state.projectGroupItems.map((d) => {
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
export const cloudServiceItems: Getter<RecentState, any> = (state: RecentState, getters, rootState): RecentItem[] => state.cloudServiceItems.map((d) => {
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
