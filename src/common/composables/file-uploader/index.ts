import type { Ref } from 'vue';

import { uploadFileAndGetFileInfo } from '@/lib/file-manager';

export const useFileUploader = (domainId: Ref<string|null>) => ({
    fileUploader(file: File) {
        return uploadFileAndGetFileInfo(file, domainId.value);
    },
});
