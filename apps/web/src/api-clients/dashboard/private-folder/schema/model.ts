import type { Tags } from '@/api-clients/_common/schema/model';

export interface PrivateFolderModel {
    folder_id: string;
    name: string;
    user_id: string;
    //
    tags: Tags;
    workspace_id: string;
    domain_id: string;
    created_at: string;
    updated_at: string;
}
