import type { Ref } from 'vue';
import { computed, reactive, toRef } from 'vue';
import type { Location } from 'vue-router/types/router';

import { makeAdminRouteName } from '@/router/helpers/route-helper';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';

interface UseProperRouteLocationReturnType {
    isAdminMode: Ref<boolean>;
    getProperRouteLocation: (location?: Location) => Location;
}

export const useProperRouteLocation = (): UseProperRouteLocationReturnType => {
    const appContextStore = useAppContextStore();
    const userWorkspaceStore = useUserWorkspaceStore();
    const state = reactive({
        isAdminMode: computed(() => appContextStore.getters.isAdminMode),
    });

    const getProperRouteLocation = (location?: Location): Location => {
        if (!location || !location.name) throw new Error('location.name is required');

        return (state.isAdminMode ? {
            ...location,
            name: makeAdminRouteName(location.name),
        } : {
            ...location,
            params: {
                ...location.params,
                workspaceId: userWorkspaceStore.getters.currentWorkspaceId,
            },
        }) as Location;
    };

    return {
        isAdminMode: toRef(state, 'isAdminMode'),
        getProperRouteLocation,
    };
};
