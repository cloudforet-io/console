import type { ResourceGroupType } from '@/api-clients/_common/schema/type';

export interface SharedConfigCreateParameters<T = Record<string, any>> {
    name: string;
    data: T;
    resource_group: ResourceGroupType;
    tags?: Record<string, any>;
    project_id?: string;
    workspace_id?: string;
}
