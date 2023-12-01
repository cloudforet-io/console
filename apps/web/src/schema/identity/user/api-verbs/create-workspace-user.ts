import type { Tags } from '@/schema/_common/model';
import type { AuthType } from '@/schema/identity/user/type';


export interface UserCreateWorkspaceUserRequestParameters {
    user_id: string;
    auth_type: AuthType;
    role_id: string;
    //
    password?: string;
    name?: string;
    email?: string;
    language?: string;
    timezone?: string;
    tags?: Tags;
    reset_password?: boolean;
    workspace_id?: string;
}
