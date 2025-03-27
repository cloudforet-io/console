import type { Tags } from '@/api-clients/_common/schema/model';
import type { AuthType } from '@/api-clients/identity/user/schema/type';

export interface WorkspaceUserCreateParameters {
    user_id: string;
    password?: string;
    name?: string;
    email?: string;
    auth_type: AuthType;
    language?: string;
    timezone?: string;
    tags?: Tags;
    reset_password?: boolean;
    role_id: string;
}
