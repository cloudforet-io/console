import type { Tags } from '@/schema/_common/model';
import type { MfaState, MultiFactorAuthType } from '@/schema/identity/user-profile/type';
import type { AuthType } from '@/schema/identity/user/type';


export interface UserCreateParameters {
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
    enforce_mfa_type?: MultiFactorAuthType; // only when enforce_mfa_state is ENABLED, this field is required
}
