import type { Getter } from 'vuex';

import type { PolicyState } from '@/services/administration/store/policy/type';

export const policyId: Getter<PolicyState, any> = (state): string|undefined => state.policyData?.policy_id;
