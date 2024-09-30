import type { Tags } from '@/schema/_common/model';


export interface PublicFolderUpdateParameters {
    folder_id: string;
    name: string;
    tags?: Tags;
}
