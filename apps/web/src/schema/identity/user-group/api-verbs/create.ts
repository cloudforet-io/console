import type { Tags } from '@/schema/_common/model';

export interface UserGroupCreateParameters {
    name: string;
    description?: string;
    tags?: Tags;
}
