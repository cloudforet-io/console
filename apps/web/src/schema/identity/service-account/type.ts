import type { ACCOUNT_TYPE } from '@/schema/identity/service-account/constant';

export type AccountType = typeof ACCOUNT_TYPE[keyof typeof ACCOUNT_TYPE];
