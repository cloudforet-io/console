import type { PrivateFolderCreateParameters } from '@/schema/dashboard/private-folder/api-verbs/create';
import type { PrivateFolderDeleteParameters } from '@/schema/dashboard/private-folder/api-verbs/delete';
import type { PrivateFolderModel } from '@/schema/dashboard/private-folder/model';
import type { PublicFolderCreateParameters } from '@/schema/dashboard/public-folder/api-verbs/create';
import type { PublicFolderDeleteParameters } from '@/schema/dashboard/public-folder/api-verbs/delete';
import type { PublicFolderModel } from '@/schema/dashboard/public-folder/model';


export type FolderModel = PublicFolderModel & PrivateFolderModel;
export type FolderCreateParams = PublicFolderCreateParameters | PrivateFolderCreateParameters;
export type FolderDeleteParams = PublicFolderDeleteParameters | PrivateFolderDeleteParameters;
