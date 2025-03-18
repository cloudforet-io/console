import type { PublicFolderGetParameters } from '@/api-clients/dashboard/public-folder/schema/api-verbs/get';
import type { PublicFolderListParameters } from '@/api-clients/dashboard/public-folder/schema/api-verbs/list';

export const publicFolderKeys = {
    all: ['public-folder'],
    list: (params: PublicFolderListParameters) => [...publicFolderKeys.all, 'list', params],
    get: (idParam: PublicFolderGetParameters['folder_id']) => [...publicFolderKeys.all, 'get', idParam],
};
