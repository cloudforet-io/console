import type { Tags } from '@/schema/_common/model';
import type { ResourceGroupType } from '@/schema/_common/type';
import type { FILE_STATE, FileReference } from '@/schema/file-manager/type';

export interface FileModel {
    file_id: string;
    name: string;
    state: FILE_STATE;
    file_type: string;
    upload_url?: string;
    upload_options?: object;
    download_url?: string;
    tags: Tags;
    reference: FileReference;
    resource_group: ResourceGroupType;
    workspace_id: string;
    domain_id: string;
    user_id: string;
    created_ait: string;
}
