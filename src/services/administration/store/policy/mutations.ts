import type { Mutation } from 'vuex';

import type { PolicyDataModel } from '@/services/administration/iam/policy/lib/type';
import type { PolicyState } from '@/services/administration/store/policy/type';

export const setPolicyList: Mutation<PolicyState> = (state, policyList: PolicyDataModel[]) => {
    state.policyList = policyList;
};

export const setPolicyListLoading: Mutation<PolicyState> = (state, policyListLoading: boolean) => {
    state.policyListLoading = policyListLoading;
};

export const setPolicyListTotalCount: Mutation<PolicyState> = (state, policyListTotalCount: number) => {
    state.totalCount = policyListTotalCount;
};

export const setPolicyData: Mutation<PolicyState> = (state, policyData: Partial<PolicyDataModel>) => {
    state.policyData = policyData;
};
