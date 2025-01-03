import { computed } from 'vue';

import type { ResourceGroupType } from '@/schema/_common/type';

import { useAppContextStore } from '@/store/app-context/app-context-store';

import { uploadFileAndGetFileInfo } from '@/lib/file-manager';


export const useFileUploader = () => {
    const appContextStore = useAppContextStore();
    const appContextGetters = appContextStore.getters;
    const resourceGroup = computed<Extract<ResourceGroupType, 'DOMAIN'|'WORKSPACE'>>(() => {
        if (appContextGetters.isAdminMode) return 'DOMAIN';
        return 'WORKSPACE';
    });
    return {
        fileUploader(file: File) {
            return uploadFileAndGetFileInfo(file, resourceGroup.value);
        },
    };
};
