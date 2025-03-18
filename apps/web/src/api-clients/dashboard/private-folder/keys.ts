import type { PrivateFolderGetParameters } from '@/api-clients/dashboard/private-folder/schema/api-verbs/get';
import type { PrivateFolderListParameters } from '@/api-clients/dashboard/private-folder/schema/api-verbs/list';

export const privateFolderKeys = {
    all: ['private-folder'],
    list: (params: PrivateFolderListParameters) => [...privateFolderKeys.all, 'list', params],
    get: (idParam: PrivateFolderGetParameters['folder_id']) => [...privateFolderKeys.all, 'get', idParam],
};
