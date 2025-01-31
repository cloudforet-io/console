import type { Tags } from '@/api-clients/_common/schema/model';


export interface PublicFolderUpdateParameters {
    folder_id: string;
    name: string;
    tags?: Tags;
}
