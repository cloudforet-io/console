import type { Tags } from '@/api-clients/_common/schema/model';
import type { ResourceGroupType } from '@/api-clients/_common/schema/type';

export interface SharedConfigModel<T = Record<string, any>> {
    name: string;
    data: T;
    tags: Tags;
    resource_group: ResourceGroupType;
    project_id?: string;
    workspace_id?: string;
    domain_id: string;
    created_at: string;
    updated_at: string;
}
