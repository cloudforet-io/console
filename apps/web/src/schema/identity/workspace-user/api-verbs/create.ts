import type { Tags } from '@/schema/_common/model';
import type { MfaState, MultiFactorAuthType } from '@/schema/identity/user-profile/type';
import type { AuthType } from '@/schema/identity/user/type';

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
    enforce_mfa_state?: MfaState;
    enforce_mfa_type?: MultiFactorAuthType;
}
