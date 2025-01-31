import type { Tags } from '@/api-clients/_common/schema/model';


export interface UserUpdateParameters {
    user_id: string;
    password?: string;
    name?: string;
    email?: string;
    language?: string;
    timezone?: string;
    tags?: Tags;
    reset_password?: boolean;
}
