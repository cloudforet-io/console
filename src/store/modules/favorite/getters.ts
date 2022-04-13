import { FavoriteItem, FavoriteState } from '@/store/modules/favorite/type';
import { Getter } from 'vuex';


export const projectItems: Getter<FavoriteState, any> = (state: FavoriteState, getters, rootState): FavoriteItem[] => state.projectItems.map((d) => {
    const resource = rootState.reference.project.items[d.resourceId];
    return {
        ...d,
        name: resource?.name || d.name || d.resourceId,
        label: resource?.label || d.name || d.resourceId,
        icon: resource?.icon,
    };
});
export const projectGroupItems: Getter<FavoriteState, any> = (state: FavoriteState, getters, rootState): FavoriteItem[] => state.projectGroupItems.map((d) => {
    const resource = rootState.reference.projectGroup.items[d.resourceId];
    return {
        ...d,
        name: resource?.name || d.name || d.resourceId,
        label: resource?.label || d.name || d.resourceId,
        icon: resource?.icon,
    };
});
export const cloudServiceTypeItems: Getter<FavoriteState, any> = (state: FavoriteState, getters, rootState): FavoriteItem[] => state.cloudServiceTypeItems.map((d) => {
    const resource = rootState.reference.cloudServiceType.items[d.resourceId];
    return {
        ...d,
        name: resource?.name || d.name || d.resourceId,
        label: resource?.label || d.name || d.resourceId,
        icon: resource?.icon,
    };
});
