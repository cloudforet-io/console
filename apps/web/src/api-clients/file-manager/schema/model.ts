import type { Tags } from '@/api-clients/_common/schema/model';
import type { ResourceGroupType } from '@/api-clients/_common/schema/type';
import type { FileState, FileReference } from '@/api-clients/file-manager/schema/type';

export interface FileModel {
    file_id: string;
    name: string;
    state: FileState;
    file_type: string;
    upload_url?: string;
    upload_options?: object;
    download_url?: string;
    tags: Tags;
    reference: FileReference;
    resource_group: Extract<ResourceGroupType, 'DOMAIN'|'WORKSPACE'>|'SYSTEM';
    workspace_id: string;
    domain_id: string;
    user_id: string;
    created_ait: string;
}
