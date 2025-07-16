import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { FileModel } from '@/api-clients/file-manager/schema/model';

import type { FileManagerResourceGroupType } from '@/lib/file-manager/type';

import type { Attachment } from '@/common/components/editor/extensions/image/type';
import ErrorHandler from '@/common/composables/error/errorHandler';


const uploadFile = async (file: File, resourceGroup: FileManagerResourceGroupType, resourceId?: string): Promise<FileModel> => {
    const formData = new FormData();
    formData.append('file', file);
    let resourceGroupPath: string;
    let params = '';
    if (resourceGroup === 'DOMAIN') {
        resourceGroupPath = 'domain';
    } else if (resourceGroup === 'WORKSPACE') {
        resourceGroupPath = 'workspace';
    } else if (resourceGroup === 'USER') {
        resourceGroupPath = 'user';
    } else if (resourceGroup === 'PROJECT') {
        resourceGroupPath = 'project';
        params = resourceId ? `?project_id=${resourceId}` : '';
    } else { resourceGroupPath = 'public'; }

    const response = await SpaceConnector.restClient.post(`/files/${resourceGroupPath}/upload${params}`, formData, {
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
    } else if (resourceGroup === 'PROJECT') {
        resourceGroupPath = 'project';
    } else { resourceGroupPath = 'public'; }

    return `${baseUri}/files/${resourceGroupPath}/${fileId}?token=${SpaceConnector.getAccessToken()}`;
};
export const uploadFileAndGetFileInfo = async (file: File, resourceGroup: FileManagerResourceGroupType, resourceId?: string): Promise<Attachment> => {
    try {
        const fileModel = await uploadFile(file, resourceGroup, resourceId);
        return {
            downloadUrl: getFileDownloadUrl(fileModel.file_id, resourceGroup),
            fileId: fileModel.file_id,
        };
    } catch (e) {
        ErrorHandler.handleError(e);
        return {
            downloadUrl: '',
            fileId: '',
        };
    }
};

