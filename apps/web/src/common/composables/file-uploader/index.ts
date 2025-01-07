import type { Ref } from 'vue';
import { isRef } from 'vue';

import { uploadFileAndGetFileInfo } from '@/lib/file-manager';
import type { FileManagerResourceGroupType } from '@/lib/file-manager/type';


export const useFileUploader = ({
    resourceGroup, resourceId,
}: {
    resourceGroup: FileManagerResourceGroupType|Ref<FileManagerResourceGroupType>;
    resourceId?: string|Ref<string|undefined>;
}) => ({
    fileUploader(file: File) {
        return uploadFileAndGetFileInfo(
            file,
            isRef(resourceGroup) ? resourceGroup.value : resourceGroup,
            isRef(resourceId) ? resourceId.value : resourceId,
        );
    },
});
