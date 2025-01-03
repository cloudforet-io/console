import type { ComputedRef, Ref } from 'vue';
import { computed } from 'vue';

import type { ResourceGroupType } from '@/schema/_common/type';
import type { FileModel } from '@/schema/file-manager/model';

import { useAppContextStore } from '@/store/app-context/app-context-store';

import { getFileDownloadUrl } from '@/lib/file-manager';

import type { Attachment } from '@/common/components/editor/extensions/image/type';

export const useFileAttachments = (files: ComputedRef<FileModel[]>|Ref<FileModel[]>) => {
    const appContextStore = useAppContextStore();
    const appContextGetters = appContextStore.getters;
    const resourceGroup = computed<Extract<ResourceGroupType, 'DOMAIN'|'WORKSPACE'>>(() => {
        if (appContextGetters.isAdminMode) return 'DOMAIN';
        return 'WORKSPACE';
    });

    const attachments = computed<Attachment[]>(() => {
        if (files.value.length === 0) return [];

        return files.value.map((file, idx) => ({
            downloadUrl: getFileDownloadUrl(file.file_id, resourceGroup.value),
            fileId: files.value[idx].file_id,
        }));
    });

    return {
        attachments,
    };
};
