import type { Tags } from '@/schema/_common/model';

export interface UserGroupUpdateParameters {
    user_group_id?: string;
    name?: string;
    description?: string;
    tags?: Tags;
}
