import type { Tags } from '@/schema/_common/model';
import type { MfaState, MultiFactorAuthType } from '@/schema/identity/user-profile/type';

export interface UserUpdateParameters {
    user_id: string;
    password?: string;
    name?: string;
    email?: string;
    language?: string;
    timezone?: string;
    tags?: Tags;
    reset_password?: boolean;
    enforce_mfa_state?: MfaState;
    enforce_mfa_type?: MultiFactorAuthType; // only when enforce_mfa_state is ENABLED, this field is required
}
