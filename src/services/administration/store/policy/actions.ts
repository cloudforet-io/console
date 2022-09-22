import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { POLICY_TYPES } from '@/services/administration/iam/policy/lib/config';
import type { PolicyDataModel, PolicyListDataModel } from '@/services/administration/iam/policy/lib/type';
import type { UpdatePolicyParams } from '@/services/administration/store/policy/type';

export const fetchPolicyList = async ({ commit }, params: any): Promise<void|Error> => {
    commit('setPolicyListLoading', true);
    try {
        const policyList: PolicyListDataModel = await SpaceConnector.client.identity.policy.list({
            params,
        });
        commit('setPolicyList', policyList.results);
        commit('setPolicyListTotalCount', policyList.total_count);
    } catch (e: any) {
        commit('setPolicyListTotalCount', 0);
        ErrorHandler.handleError(e);
        throw e;
    } finally {
        commit('setPolicyListLoading', false);
    }
};

export const getPolicyData = async ({ commit }, {
    policyId,
    policyType,
}): Promise<void|Error> => {
    try {
        const policy: PolicyDataModel = policyType === POLICY_TYPES.MANAGED
            ? await SpaceConnector.client.repository.policy.get({
                policy_id: policyId,
            })
            : await SpaceConnector.client.identity.policy.get({
                policy_id: policyId,
            });
        commit('setPolicyData', policy);
    } catch (e: any) {
        ErrorHandler.handleError(e);
        throw e;
    }
};

export const updatePolicyData = async ({ commit }, params: UpdatePolicyParams): Promise<void|Error> => {
    try {
        const policy: PolicyDataModel = await SpaceConnector.client.identity.policy.update({
            ...params.updateParams,
            policy_id: params.policyId,
        });
        commit('setPolicyData', policy);
    } catch (e: any) {
        ErrorHandler.handleError(e);
        throw e;
    }
};
