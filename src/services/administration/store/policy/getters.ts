import { Getter } from 'vuex';

import { PolicyState } from '@/services/administration/store/policy/type';

export const policyId: Getter<PolicyState, any> = (state): string|undefined => state.policyData?.policy_id;
