import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { PolicyDataModel } from '@/services/administration/iam/policy/lib/type';

export const getPolicyData = async ({ commit }, policyId: string): Promise<void|Error> => {
    try {
        const policy: PolicyDataModel = await SpaceConnector.client.identity.policy.get({
            policy_id: policyId,
        });
        commit('setPolicyData', policy);
    } catch (e: any) {
        ErrorHandler.handleError(e);
        throw e;
    }
};
