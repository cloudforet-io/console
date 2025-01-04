import type { Ref } from 'vue';
import { isRef } from 'vue';

import { uploadFileAndGetFileInfo } from '@/lib/file-manager';
import type { FileManagerResourceGroupType } from '@/lib/file-manager/type';


export const useFileUploader = ({
    resourceGroup,
}: {
    resourceGroup: FileManagerResourceGroupType|Ref<FileManagerResourceGroupType>;
}) => ({
    fileUploader(file: File) {
        return uploadFileAndGetFileInfo(file, isRef(resourceGroup) ? resourceGroup.value : resourceGroup);
    },
});
