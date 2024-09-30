import type { Tags } from '@/schema/_common/model';


export interface PrivateFolderUpdateParameters {
    folder_id: string;
    name: string;
    tags?: Tags;
}
