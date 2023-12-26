import type { Tags } from '@/schema/_common/model';
import type { ResourceGroupType } from '@/schema/_common/type';

export interface AppCreateParameters {
    name: string;
    role_id: string;
    tags?: Tags;
    expired_at?: string;
    resource_group: ResourceGroupType;
    workspace_id?: string;
}
