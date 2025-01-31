import type { Tags } from '@/api-clients/_common/schema/model';


export interface PrivateFolderUpdateParameters {
    folder_id: string;
    name: string;
    tags?: Tags;
}
