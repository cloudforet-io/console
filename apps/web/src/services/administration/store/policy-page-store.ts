import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { defineStore } from 'pinia';

import ErrorHandler from '@/common/composables/error/errorHandler';

import type { PolicyDataModel, PolicyListDataModel } from '@/services/administration/iam/policy/lib/type';
import type { PolicyType } from '@/services/administration/store/type';
import { POLICY_TYPE } from '@/services/administration/store/type';


export const usePolicyStore = defineStore('policy-page', {
    state: () => ({
        loading: false,
        totalCount: 0,
        policyData: null as PolicyDataModel | null,
        policyList: [] as PolicyDataModel[],
    }),
    actions: {
        async listPolicyData(params: any): Promise<void|Error> {
            this.loading = true;
            try {
                const { results, total_count }: PolicyListDataModel = await SpaceConnector.client.identity.policy.list({
                    params,
                });
                this.policyList = results;
                this.totalCount = total_count;
            } catch (e: any) {
                this.totalCount = 0;
                ErrorHandler.handleError(e);
                throw e;
            } finally {
                this.loading = false;
            }
        },
        async getPolicyData(policyId: string, policyType?: PolicyType): Promise<void|Error> {
            try {
                this.policyData = policyType === POLICY_TYPE.MANAGED
                    ? await SpaceConnector.client.repository.policy.get({
                        policy_id: policyId,
                    })
                    : await SpaceConnector.client.identity.policy.get({
                        policy_id: policyId,
                    });
            } catch (e: any) {
                this.policyData = null;
                ErrorHandler.handleError(e);
            }
        },
        async updatePolicyData(policyId: string, params: any): Promise<void|Error> {
            try {
                this.policyData = await SpaceConnector.client.identity.policy.update({
                    policy_id: policyId,
                    ...params,
                });
            } catch (e: any) {
                ErrorHandler.handleError(e);
            }
        },
    },
});
