import type { PrivateFolderCreateParameters } from '@/api-clients/dashboard/private-folder/schema/api-verbs/create';
import type { PrivateFolderDeleteParameters } from '@/api-clients/dashboard/private-folder/schema/api-verbs/delete';
import type { PrivateFolderUpdateParameters } from '@/api-clients/dashboard/private-folder/schema/api-verbs/update';
import type { PrivateFolderModel } from '@/api-clients/dashboard/private-folder/schema/model';
import type { PublicFolderCreateParameters } from '@/api-clients/dashboard/public-folder/schema/api-verbs/create';
import type { PublicFolderDeleteParameters } from '@/api-clients/dashboard/public-folder/schema/api-verbs/delete';
import type { PublicFolderUpdateParameters } from '@/api-clients/dashboard/public-folder/schema/api-verbs/update';
import type { PublicFolderModel } from '@/api-clients/dashboard/public-folder/schema/model';


export type FolderModel = PublicFolderModel | PrivateFolderModel;
export type FolderCreateParams = PublicFolderCreateParameters | PrivateFolderCreateParameters;
export type FolderUpdateParams = PublicFolderUpdateParameters | PrivateFolderUpdateParameters;
export type FolderDeleteParams = PublicFolderDeleteParameters | PrivateFolderDeleteParameters;
