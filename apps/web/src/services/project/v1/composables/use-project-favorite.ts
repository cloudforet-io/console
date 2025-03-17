// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { reactive, computed, toRef } from 'vue';

import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';
import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { ProjectGroupReferenceMap } from '@/store/reference/project-group-reference-store';
import type { ProjectReferenceMap } from '@/store/reference/project-reference-store';

import {
    convertProjectConfigToReferenceData,
    convertProjectGroupConfigToReferenceData,
} from '@/lib/helper/config-data-helper';

import { useFavoriteStore } from '@/common/modules/favorites/favorite-button/store/favorite-store';
import { FAVORITE_TYPE } from '@/common/modules/favorites/favorite-button/type';
import type { FavoriteItem } from '@/common/modules/favorites/favorite-button/type';

import { useProjectPageStore } from '@/services/project/v1/stores/project-page-store';


export const useProjectFavorite = () => {
    const allReferenceStore = useAllReferenceStore();
    const projectPageStore = useProjectPageStore();
    const projectPageGetters = projectPageStore.getters;
    const userWorkspaceStore = useUserWorkspaceStore();
    const userWorkspaceGetters = userWorkspaceStore.getters;
    const favoriteStore = useFavoriteStore();
    const favoriteGetters = favoriteStore.getters;

    const storeState = reactive({
        projectGroups: computed<ProjectGroupReferenceMap>(() => allReferenceStore.getters.projectGroup),
        projects: computed<ProjectReferenceMap>(() => allReferenceStore.getters.project),
        favoriteProjectGroups: computed(() => favoriteGetters.projectGroupItems),
        favoriteProjects: computed(() => favoriteGetters.projectItems),
        groupId: computed(() => projectPageGetters.groupId),
        currentWorkspaceId: computed(() => userWorkspaceGetters.currentWorkspaceId as string),
    });
    const state = reactive({
        favoriteItems: computed<FavoriteItem[]>(() => [
            ...convertProjectGroupConfigToReferenceData(storeState.favoriteProjectGroups, storeState.projectGroups),
            ...convertProjectConfigToReferenceData(storeState.favoriteProjects, storeState.projects),
        ].filter((i) => !i.isDeleted)),
    });

    const beforeFavoriteRoute = async (item: FavoriteItem) => {
        if (item.itemType === FAVORITE_TYPE.PROJECT_GROUP) {
            if (storeState.groupId !== item.itemId) {
                await projectPageStore.selectNode(item.itemId);
            } else await projectPageStore.selectNode();
        } else {
            await projectPageStore.selectNode();
        }
    };
    const handleDeleteFavorite = (item: FavoriteItem) => {
        favoriteStore.deleteFavorite({
            itemType: item.itemType,
            workspaceId: userWorkspaceGetters.currentWorkspaceId || '',
            itemId: item.itemId,
        });
    };

    return {
        favoriteItems: toRef(state, 'favoriteItems'),
        beforeFavoriteRoute,
        handleDeleteFavorite,
    };
};
