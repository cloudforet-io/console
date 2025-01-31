import type { Tags } from '@/api-clients/_common/schema/model';

export interface UserGroupUpdateParameters {
    user_group_id?: string;
    name?: string;
    description?: string;
    tags?: Tags;
}
