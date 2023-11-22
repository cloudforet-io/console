import type { POLICY_TYPE } from '@/services/administration/constants/policy-constant';

export type PolicyType = typeof POLICY_TYPE[keyof typeof POLICY_TYPE];
