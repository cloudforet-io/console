import type { PublicFolderGetParameters } from '@/api-clients/dashboard/public-folder/schema/api-verbs/get';
import type { PublicFolderListParameters } from '@/api-clients/dashboard/public-folder/schema/api-verbs/list';

export const publicFolderKeys = {
    list: (params: PublicFolderListParameters) => ['public-folder', 'list', params] as const,
    get: (idParam: PublicFolderGetParameters['folder_id']) => ['public-folder', 'get', idParam] as const,
};
