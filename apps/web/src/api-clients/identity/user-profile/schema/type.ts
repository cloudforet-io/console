import type { MFA_STATE, MULTI_FACTOR_AUTH_TYPE } from '@/api-clients/identity/user-profile/schema/constant';

export type MultiFactorAuthType = typeof MULTI_FACTOR_AUTH_TYPE[keyof typeof MULTI_FACTOR_AUTH_TYPE];
export type MfaState = typeof MFA_STATE[keyof typeof MFA_STATE];
