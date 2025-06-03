import { cloneDeep } from 'lodash';
import { defineStore } from 'pinia';

import getRandomId from '@/lib/random-id-generator';

import type { AdjustmentData, AdjustmentPolicyData } from '@/services/cost-explorer/types/report-adjustment-type';

interface AdvancedSettingsPageStore {
    loading: boolean;
    showAdjustmentsOverlay: boolean;
    adjustmentPolicyList: AdjustmentPolicyData[];
    adjustmentListMap: Record<string, AdjustmentData[]>;
}
export const useAdvancedSettingsPageStore = defineStore('page-advanced-settings', {
    state: (): AdvancedSettingsPageStore => ({
        loading: true,
        showAdjustmentsOverlay: false,
        adjustmentPolicyList: [], // [{ id, workspace_ids, ... }]
        adjustmentListMap: {}, // { policy_id: [{ id, ... }] }
    }),
    getters: {
        isAdjustmentPolicyValid: (state) => state.adjustmentPolicyList
            .every((item) => (item.isAllWorkspaceSelected || !!item.workspaceMenuItems?.length) && !!state.adjustmentListMap[item.id]?.length),
        isAdjustmentValid: (state) => Object.values(state.adjustmentListMap)
            .every((item) => item.every((adjustment) => adjustment.name && adjustment.provider && adjustment.adjustment && !!adjustment.amount && Number(adjustment.amount) > 0)),
    },
    actions: {
        setLoading(state: AdvancedSettingsPageStore['loading']) {
            this.loading = state;
        },
        setShowAdjustmentsOverlay(state: AdvancedSettingsPageStore['showAdjustmentsOverlay']) {
            this.showAdjustmentsOverlay = state;
        },
        setAdjustmentPolicyList(state: AdvancedSettingsPageStore['adjustmentPolicyList']) {
            this.adjustmentPolicyList = state;
        },
        setAdjustmentListMap(state: AdvancedSettingsPageStore['adjustmentListMap']) {
            this.adjustmentListMap = state;
        },
        addAdjustmentPolicy(policyId: string) {
            this.adjustmentPolicyList.push({
                id: policyId,
                workspaceMenuItems: undefined,
                isAllWorkspaceSelected: true,
            });
            this.adjustmentListMap[policyId] = [];
        },
        addAdjustment(policyId: string) {
            this.adjustmentListMap[policyId].push({
                id: getRandomId(),
                name: '',
                provider: '',
                adjustment: 'FIXED_ADDITION',
                amount: 0,
                description: '',
                policyId,
            });
            this.adjustmentListMap = cloneDeep(this.adjustmentListMap);
        },
        deleteAdjustmentPolicy(policyId: string) {
            this.adjustmentPolicyList = this.adjustmentPolicyList.filter((item) => item.id !== policyId);
            delete this.adjustmentListMap[policyId];
        },
        deleteAdjustment(policyId: string, adjustmentId: string) {
            this.adjustmentListMap[policyId] = this.adjustmentListMap[policyId].filter((item) => item.id !== adjustmentId);
        },
        updateAdjustmentPolicy(policyId: string, policy: AdjustmentPolicyData) {
            this.adjustmentPolicyList = this.adjustmentPolicyList.map((item) => (item.id === policyId ? policy : item));
        },
        updateAdjustment(policyId: string, adjustmentId: string, adjustment: AdjustmentData) {
            this.adjustmentListMap[policyId] = this.adjustmentListMap[policyId].map((item) => (item.id === adjustmentId ? adjustment : item));
        },
    },
});
