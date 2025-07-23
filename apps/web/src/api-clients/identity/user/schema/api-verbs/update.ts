import type { Tags } from '@/api-clients/_common/schema/model';
import type { MfaState, MultiFactorAuthType } from '@/api-clients/identity/user-profile/schema/type';


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
