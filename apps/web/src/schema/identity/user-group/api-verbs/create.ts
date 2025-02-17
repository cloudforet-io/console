import type { Tags } from '@/api-clients/_common/schema/model';

export interface UserGroupCreateParameters {
    name: string;
    description?: string;
    tags?: Tags;
}
