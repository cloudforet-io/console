import type { Tags, TimeStamp } from '@/schema/_common/model';
import type { ResourceGroupType } from '@/schema/_common/type';

export interface AppCreateParameters {
    name: string;
    role_id: string;
    tags?: Tags;
    expired_at?: TimeStamp;
    resource_group: ResourceGroupType;
    workspace_id?: string;
}
