import type { PrivateFolderGetParameters } from '@/api-clients/dashboard/private-folder/schema/api-verbs/get';
import type { PrivateFolderListParameters } from '@/api-clients/dashboard/private-folder/schema/api-verbs/list';

export const privateFolderKeys = {
    list: (params: PrivateFolderListParameters) => ['private-folder', 'list', params] as const,
    get: (idParam: PrivateFolderGetParameters['folder_id']) => ['private-folder', 'get', idParam] as const,
};
