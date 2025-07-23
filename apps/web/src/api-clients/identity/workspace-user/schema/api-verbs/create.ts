import type { Tags } from '@/api-clients/_common/schema/model';
import type { MfaState, MultiFactorAuthType } from '@/api-clients/identity/user-profile/schema/type';
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
    enforce_mfa_state?: MfaState;
    enforce_mfa_type?: MultiFactorAuthType;
    role_id: string;
}
