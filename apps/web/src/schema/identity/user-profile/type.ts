import type { MULTI_FACTOR_AUTH_TYPE } from '@/schema/identity/user-profile/constant';

export type MultiFactorAuthType = typeof MULTI_FACTOR_AUTH_TYPE[keyof typeof MULTI_FACTOR_AUTH_TYPE];
