import type { Tags } from '@/api-clients/_common/schema/model';
import type { ResourceGroupType } from '@/api-clients/_common/schema/type';
import type { FileReference } from '@/schema/file-manager/type';

export interface FileAddParameters {
    name: string;
    tags?: Tags;
    reference?: FileReference;
    resource_group: Extract<ResourceGroupType, 'DOMAIN'|'WORKSPACE'|'SYSTEM'>;
    domain_id?: string;
    workspace_id?: string;
}
