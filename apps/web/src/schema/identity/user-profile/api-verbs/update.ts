import type { Tags } from '@/api-clients/_common/schema/model';

export interface UserProfileUpdateParameters {
    password?: string;
    name?: string;
    email?: string;
    language?: string;
    timezone?: string;
    tags?: Tags
}
