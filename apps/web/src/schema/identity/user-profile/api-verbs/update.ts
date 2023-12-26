import type { Tags } from '@/schema/_common/model';

export interface UserProfileUpdateParameters {
    password?: string;
    name?: string;
    email?: string;
    language?: string;
    timezone?: string;
    tags?: Tags
}
