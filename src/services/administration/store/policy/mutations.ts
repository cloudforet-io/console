import { Mutation } from 'vuex';
import { PolicyState } from '@/services/administration/store/policy/type';
import { PolicyDataModel } from '@/services/administration/iam/policy/lib/type';

export const setPolicyData: Mutation<PolicyState> = (state, policyData: Partial<PolicyDataModel>) => {
    state.policyData = policyData;
};
