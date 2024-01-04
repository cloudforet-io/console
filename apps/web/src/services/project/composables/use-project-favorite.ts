import { reactive, computed, toRef } from 'vue';

import { store } from '@/store';

import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';
import type { FavoriteItem } from '@/store/modules/favorite/type';
import { FAVORITE_TYPE } from '@/store/modules/favorite/type';
import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { ProjectGroupReferenceMap } from '@/store/reference/project-group-reference-store';
import type { ProjectReferenceMap } from '@/store/reference/project-reference-store';

import {
    convertProjectConfigToReferenceData,
    convertProjectGroupConfigToReferenceData,
} from '@/lib/helper/config-data-helper';

import { useProjectPageStore } from '@/services/project/stores/project-page-store';


export const useProjectFavorite = () => {
    const allReferenceStore = useAllReferenceStore();
    const projectPageStore = useProjectPageStore();
    const projectPageGetters = projectPageStore.getters;
    const userWorkspaceStore = useUserWorkspaceStore();

    const storeState = reactive({
        favoriteProjectGroups: computed(() => store.state.favorite.projectGroupItems),
        projectGroups: computed<ProjectGroupReferenceMap>(() => allReferenceStore.getters.projectGroup),
        favoriteProjects: computed(() => store.state.favorite.projectItems),
        projects: computed<ProjectReferenceMap>(() => allReferenceStore.getters.project),
        groupId: computed(() => projectPageGetters.groupId),
    });
    const state = reactive({
        favoriteItems: computed<FavoriteItem[]>(() => [
            ...convertProjectGroupConfigToReferenceData(storeState.favoriteProjectGroups, storeState.projectGroups),
            ...convertProjectConfigToReferenceData(storeState.favoriteProjects, storeState.projects),
        ]),
    });

    const beforeFavoriteRoute = async (item: FavoriteItem, e: MouseEvent) => {
        if (item.itemType === FAVORITE_TYPE.PROJECT_GROUP) {
            e.preventDefault();
            if (storeState.groupId !== item.itemId) {
                await projectPageStore.selectNode(item.itemId);
            }
        }
    };
    const handleDeleteFavorite = (item: FavoriteItem) => {
        const _item = {
            ...item,
            workspaceId: userWorkspaceStore.getters.currentWorkspaceId,
        };
        store.dispatch('favorite/removeItem', _item);
    };

    return {
        favoriteItems: toRef(state, 'favoriteItems'),
        beforeFavoriteRoute,
        handleDeleteFavorite,
    };
};
