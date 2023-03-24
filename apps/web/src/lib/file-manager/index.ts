import axios from 'axios';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { FileInfo } from '@/lib/file-manager/type';

import type { Attachment } from '@/common/components/editor/extensions/image/type';
import ErrorHandler from '@/common/composables/error/errorHandler';

const getUploadInfo = async (file: File, domainId: string|null): Promise<[fileId: string, uploadUrl: string, options: object]> => {
    const result = await SpaceConnector.client.fileManager.file.add({
        name: file.name,
        file_type: file.type,
        domain_id: domainId,
    });
    if (!result.upload_url || !result.upload_options) throw new Error('[File Manager] No upload info in response of add file api');
    return [result.file_id, result.upload_url, result.upload_options];
};

const uploadFile = async (uploadUrl: string, options: object, file: File) => {
    const formData = new FormData();
    Object.keys(options).forEach((key) => {
        formData.append(key, options[key]);
    });
    formData.append('file', file);
    await axios.post(uploadUrl, formData);
};

export const getDownloadUrl = async (fileId: string): Promise<string> => {
    const result: FileInfo = await SpaceConnector.client.fileManager.file.getDownloadUrl({
        file_id: fileId,
    });
    if (!result.download_url) throw new Error('[File Manager] No download url in response of update file state api');
    return result.download_url;
};

export const uploadFileAndGetFileInfo = async (file: File, domainId: string|null): Promise<Attachment> => {
    try {
        const [fileId, uploadUrl, options] = await getUploadInfo(file, domainId);
        await uploadFile(uploadUrl, options, file);
        const downloadUrl = await getDownloadUrl(fileId);
        return { downloadUrl, fileId };
    } catch (e) {
        ErrorHandler.handleError(e);
        // TODO: change it to default error image
        return {
            downloadUrl: 'https://spaceone-custom-assets.s3.ap-northeast-2.amazonaws.com/console-assets/icons/spaceone.svg',
            fileId: '',
        };
    }
};
