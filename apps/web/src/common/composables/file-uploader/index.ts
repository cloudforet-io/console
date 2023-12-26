import { computed } from 'vue';

import type { ResourceGroupType } from '@/schema/_common/type';
import { store } from '@/store';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';

import { uploadFileAndGetFileInfo } from '@/lib/file-manager';

export const useFileUploader = () => {
    const appContextStore = useAppContextStore();
    const appContextGetters = appContextStore.getters;
    const userWorkspaceStore = useUserWorkspaceStore();
    const workspaceGetters = userWorkspaceStore.getters;
    const resourceGroup = computed<ResourceGroupType>(() => {
        if (appContextGetters.isAdminMode) return 'DOMAIN';
        return 'WORKSPACE';
    });
    const domainIdOrWorkspaceId = computed<string>(() => {
        if (appContextGetters.isAdminMode) return store.state.domain.domainId;
        return workspaceGetters.currentWorkspaceId;
    });
    return {
        fileUploader(file: File) {
            return uploadFileAndGetFileInfo(file, resourceGroup.value, domainIdOrWorkspaceId.value);
        },
    };
};
