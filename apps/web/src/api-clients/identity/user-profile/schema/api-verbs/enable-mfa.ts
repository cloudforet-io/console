import type { MultiFactorAuthType } from '@/api-clients/identity/user-profile/schema/type';

export interface UserProfileEnableMfaParameters {
    mfa_type: MultiFactorAuthType;
    options: Record<string, any>;
}
