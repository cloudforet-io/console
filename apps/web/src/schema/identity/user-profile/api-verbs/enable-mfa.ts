import type { MultiFactorAuthType } from '@/schema/identity/user-profile/type';

export interface UserProfileEnableMfaParameters {
    mfa_type: MultiFactorAuthType;
    options: Record<string, any>;
}
