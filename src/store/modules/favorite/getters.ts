import { FavoriteItem, FavoriteState } from '@/store/modules/favorite/type';
import { Getter } from 'vuex';


// const convertToConsoleMenuList = (menu: GNBMenu[]) => flatten(menu.map(({ id, label, subMenuList }) => {
//     if (subMenuList?.length) {
//         return subMenuList.map(item => ({
//             id: item.id,
//             label: item.label,
//             parents: [{ id, label }],
//         }));
//     }
//     return [{ id, label }];
// }));
// todo
export const menuItems: Getter<FavoriteState, any> = (state: FavoriteState): FavoriteItem[] => state.menuItems.map(d => ({
    ...d,
}));
export const projectItems: Getter<FavoriteState, any> = (state: FavoriteState, getters, rootState): FavoriteItem[] => state.projectItems.map((d) => {
    const resource = rootState.reference.project.items[d.itemId];
    return {
        ...d,
        name: resource?.name || d.name || d.itemId,
        label: resource?.label || d.name || d.itemId,
        icon: resource?.icon,
    };
});
export const projectGroupItems: Getter<FavoriteState, any> = (state: FavoriteState, getters, rootState): FavoriteItem[] => state.projectGroupItems.map((d) => {
    const resource = rootState.reference.projectGroup.items[d.itemId];
    return {
        ...d,
        name: resource?.name || d.name || d.itemId,
        label: resource?.label || d.name || d.itemId,
        icon: resource?.icon,
    };
});
export const cloudServiceTypeItems: Getter<FavoriteState, any> = (state: FavoriteState, getters, rootState): FavoriteItem[] => state.cloudServiceTypeItems.map((d) => {
    const resource = rootState.reference.cloudServiceType.items[d.itemId];
    return {
        ...d,
        name: resource?.name || d.name || d.itemId,
        label: resource?.label || d.name || d.itemId,
        icon: resource?.icon,
    };
});
