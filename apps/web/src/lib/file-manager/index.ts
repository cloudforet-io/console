import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ResourceGroupType } from '@/schema/_common/type';
import type { FileModel } from '@/schema/file-manager/model';

import type { Attachment } from '@/common/components/editor/extensions/image/type';
import ErrorHandler from '@/common/composables/error/errorHandler';


type FileManagerResourceGroupType = Extract<ResourceGroupType, 'DOMAIN'|'WORKSPACE'|'USER'>;


const uploadFile = async (file: File, resourceGroup: FileManagerResourceGroupType): Promise<FileModel> => {
    const formData = new FormData();
    formData.append('files', file);

    let resourceGroupPath: string;
    if (resourceGroup === 'DOMAIN') {
        resourceGroupPath = 'domain';
    } else if (resourceGroup === 'WORKSPACE') {
        resourceGroupPath = 'workspace';
    } else if (resourceGroup === 'USER') {
        resourceGroupPath = 'user';
    } else { resourceGroupPath = 'public'; }

    const response = await SpaceConnector.restClient.post(`/files/${resourceGroupPath}/upload`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export const getFileDownloadUrl = (fileId: string, resourceGroup: FileManagerResourceGroupType): string => {
    const baseUri = SpaceConnector.restClient.getUri();

    let resourceGroupPath: string;
    if (resourceGroup === 'DOMAIN') {
        resourceGroupPath = 'domain';
    } else if (resourceGroup === 'WORKSPACE') {
        resourceGroupPath = 'workspace';
    } else if (resourceGroup === 'USER') {
        resourceGroupPath = 'user';
    } else { resourceGroupPath = 'public'; }

    return `${baseUri}/files/${resourceGroupPath}/${fileId}?token=${SpaceConnector.getAccessToken()}`;
};
export const uploadFileAndGetFileInfo = async (file: File, resourceGroup: FileManagerResourceGroupType): Promise<Attachment> => {
    try {
        const fileModel = await uploadFile(file, resourceGroup);
        return {
            downloadUrl: getFileDownloadUrl(fileModel.file_id, resourceGroup),
            fileId: fileModel.file_id,
        };
    } catch (e) {
        ErrorHandler.handleError(e);
        return {
            downloadUrl: `${window.location.origin}/images/no-image.png`,
            fileId: '',
        };
    }
};

