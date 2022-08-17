import type { ComputedRef, Ref } from '@vue/composition-api';

import { computedAsync } from '@vueuse/core';

import { getDownloadUrl } from '@/lib/file-manager';
import type { FileInfo } from '@/lib/file-manager/type';

import type { Attachment } from '@/common/components/editor/extensions/image/type';

export const useFileAttachments = (files: ComputedRef<FileInfo[]>| Ref<FileInfo[]>) => {
    const attachments = computedAsync<Attachment[]>(async () => {
        if (files.value.length === 0) return [];

        let results;
        if (files.value[0].download_url) results = files.value.map(file => file.download_url ?? '');
        else results = await Promise.allSettled(files.value.map(file => getDownloadUrl(file.file_id)));
        return results.map((result, idx) => {
            if (result.status === 'fulfilled') return { downloadUrl: result.value ?? '', fileId: files.value[idx].file_id };
            return { downloadUrl: '', fileId: files.value[idx].file_id };
        });
    });

    return {
        attachments,
    };
};
