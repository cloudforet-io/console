import type { Tags } from '@/schema/_common/model';
import type { ResourceGroupType } from '@/schema/_common/type';
import type { FileReference } from '@/schema/file-manager/type';

export interface FileAddParameters {
    name: string;
    resource_group: ResourceGroupType;
    tags?: Tags;
    reference?: FileReference;
    workspace_id?: string;
    domain_id?: string;
}
