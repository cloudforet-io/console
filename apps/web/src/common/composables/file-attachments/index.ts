import { computedAsync } from '@vueuse/core';
import type { ComputedRef, Ref } from 'vue';

import type { FileModel } from '@/schema/file-manager/model';

import { getUploadedFile } from '@/lib/file-manager';

import type { Attachment } from '@/common/components/editor/extensions/image/type';

export const useFileAttachments = (files: ComputedRef<FileModel[]>| Ref<FileModel[]>) => {
    const noImage = `${window.location.origin}/images/no-image.png`;

    const attachments = computedAsync<Attachment<FileModel>[]>(async (): Promise<Attachment<FileModel>[]> => {
        if (files.value.length === 0) return [];

        const results = await Promise.allSettled(files.value.map((file) => {
            if (file.download_url) return Promise.resolve(file);
            return getUploadedFile(file.file_id);
        }));
        return results.map((result, idx) => {
            if (result.status === 'fulfilled') {
                return {
                    downloadUrl: result.value.download_url ?? noImage,
                    fileId: result.value.file_id,
                    data: result.value,
                };
            }
            return { downloadUrl: noImage, fileId: files.value[idx].file_id, data: files.value[idx] };
        });
    });

    return {
        attachments,
    };
};
