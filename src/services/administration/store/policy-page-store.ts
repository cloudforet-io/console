import { reactive } from 'vue';

import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import ErrorHandler from '@/common/composables/error/errorHandler';

import type { PolicyDataModel, PolicyListDataModel } from '@/services/administration/iam/policy/lib/type';
import type { PolicyType } from '@/services/administration/store/type';
import { POLICY_TYPE } from '@/services/administration/store/type';


export const usePolicyStore = defineStore('policy-page', () => {
    const state = reactive({
        loading: false,
        totalCount: 0,
        policyData: null as PolicyDataModel | null,
        policyList: [] as PolicyDataModel[],
    });

    /* Actions */
    const listPolicyData = async (params: any): Promise<void|Error> => {
        state.loading = true;
        try {
            const { results, total_count }: PolicyListDataModel = await SpaceConnector.client.identity.policy.list({
                params,
            });
            state.policyList = results;
            state.totalCount = total_count;
        } catch (e: any) {
            state.totalCount = 0;
            ErrorHandler.handleError(e);
            throw e;
        } finally {
            state.loading = false;
        }
    };
    const getPolicyData = async (policyId: string, policyType?: PolicyType): Promise<void|Error> => {
        try {
            state.policyData = policyType === POLICY_TYPE.MANAGED
                ? await SpaceConnector.client.repository.policy.get({
                    policy_id: policyId,
                })
                : await SpaceConnector.client.identity.policy.get({
                    policy_id: policyId,
                });
        } catch (e: any) {
            state.policyData = null;
            ErrorHandler.handleError(e);
        }
    };
    const updatePolicyData = async (policyId: string, params: any): Promise<void|Error> => {
        try {
            state.policyData = await SpaceConnector.client.identity.policy.update({
                policy_id: policyId,
                ...params,
            });
        } catch (e: any) {
            ErrorHandler.handleError(e);
        }
    };

    return {
        state,
        listPolicyData,
        getPolicyData,
        updatePolicyData,
    };
});
