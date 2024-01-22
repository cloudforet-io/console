import { computed, reactive } from 'vue';

import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { UserConfigGetParameters } from '@/schema/config/user-config/api-verbs/get';
import type { UserConfigSetParameters } from '@/schema/config/user-config/api-verbs/set';
import type { UserConfigModel } from '@/schema/config/user-config/model';
import type { WorkspaceModel } from '@/schema/identity/workspace/model';

import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';

const LAST_ACCESSED_WORKSPACE_KEY = 'console:last-accessed-workspace';

interface AppContextStoreState {
    isAdminMode: boolean;
    globalGrantLoading: boolean;
}

export const useAppContextStore = defineStore('app-context-store', () => {
    const userWorkspaceStore = useUserWorkspaceStore();

    const state = reactive<AppContextStoreState>({
        isAdminMode: false,
        globalGrantLoading: false,
    });

    const getters = reactive({
        isAdminMode: computed<boolean>(() => state.isAdminMode),
        globalGrantLoading: computed<boolean>(() => state.globalGrantLoading),
        workspaceId: computed<string|undefined>(() => userWorkspaceStore.getters.currentWorkspaceId),
        workspaceList: computed<WorkspaceModel[]>(() => userWorkspaceStore.getters.workspaceList),
    });

    const actions = {
        enterAdminMode() {
            userWorkspaceStore.setCurrentWorkspace();
            state.isAdminMode = true;
        },
        exitAdminMode() {
            userWorkspaceStore.setCurrentWorkspace();
            state.isAdminMode = false;
        },
        setGlobalGrantLoading(loading: boolean) {
            state.globalGrantLoading = loading;
        },
        async setCurrentAccessedWorkspaceId(workspaceId: string): Promise<void> {
            try {
                await SpaceConnector.clientV2.config.userConfig.set<UserConfigSetParameters, UserConfigModel>({
                    name: LAST_ACCESSED_WORKSPACE_KEY,
                    data: { workspace_id: workspaceId },
                });
            } catch (e) {
                console.error(`Workspace Set Error: ${e}`);
            }
        },
        async getValidLastAccessedWorkspaceId(): Promise<string | undefined> {
            try {
                const response = await SpaceConnector.clientV2.config.userConfig.get<UserConfigGetParameters, UserConfigModel>({
                    name: LAST_ACCESSED_WORKSPACE_KEY,
                });

                const validWorkspaceId = userWorkspaceStore.getters.workspaceList.find((workspace) => workspace.workspace_id === response.data.workspace_id)?.workspace_id;

                return validWorkspaceId;
            } catch (e) {
                return undefined;
            }
        },
    };


    return {
        getters,
        ...actions,
    };
});
