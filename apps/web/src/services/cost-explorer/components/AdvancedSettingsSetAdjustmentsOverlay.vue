<script setup lang="ts">
import {
    computed, reactive, watch,
} from 'vue';

import { useQueryClient } from '@tanstack/vue-query';

import {
    PButton, POverlayLayout,
} from '@cloudforet/mirinae';

import { useReportAdjustmentPolicyApi } from '@/api-clients/cost-analysis/report-adjustment-policy/composables/use-report-adjustment-policy-api';
import type { ReportAdjustmentPolicyUpdateParameters } from '@/api-clients/cost-analysis/report-adjustment-policy/schema/api-verbs/update';
import type { ReportAdjustmentPolicyModel } from '@/api-clients/cost-analysis/report-adjustment-policy/schema/model';
import { useReportAdjustmentApi } from '@/api-clients/cost-analysis/report-adjustment/composables/use-report-adjustment-api';
import type { ReportAdjustmentUpdateParameters } from '@/api-clients/cost-analysis/report-adjustment/schema/api-verbs/update';
import type { ReportAdjustmentModel } from '@/api-clients/cost-analysis/report-adjustment/schema/model';
import { useServiceQueryKey } from '@/query/query-key/use-service-query-key';
import { i18n } from '@/translations';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { WorkspaceReferenceMap } from '@/store/reference/workspace-reference-store';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import AdvancedSettingsAdjustmentGroupForm from '@/services/cost-explorer/components/AdvancedSettingsAdjustmentGroupForm.vue';
import { useCostReportConfigQuery } from '@/services/cost-explorer/composables/queries/use-cost-report-config-query';
import { useReportAdjustmentPolicyQuery } from '@/services/cost-explorer/composables/queries/use-report-adjustment-policy-query';
import { useReportAdjustmentQuery } from '@/services/cost-explorer/composables/queries/use-report-adjustment-query';
import { useAdvancedSettingsPageStore } from '@/services/cost-explorer/stores/advanced-settings-page-store';
import type { AdjustmentType, AdjustmentData, AdjustmentPolicyData } from '@/services/cost-explorer/types/report-adjustment-type';

const advancedSettingsPageStore = useAdvancedSettingsPageStore();
const advancedSettingsPageState = advancedSettingsPageStore.$state;
const allReferenceStore = useAllReferenceStore();
const { reportAdjustmentPolicyAPI } = useReportAdjustmentPolicyApi();
const { reportAdjustmentAPI } = useReportAdjustmentApi();
const { costReportConfig } = useCostReportConfigQuery();
const queryClient = useQueryClient();
const {
    reportAdjustmentList,
    isLoading: isReportAdjustmentLoading,
} = useReportAdjustmentQuery();
const {
    reportAdjustmentPolicyList,
    isLoading: isReportAdjustmentPolicyLoading,
} = useReportAdjustmentPolicyQuery();

const { key: rapQueryKey } = useServiceQueryKey('cost-analysis', 'report-adjustment-policy', 'list');
const { key: raQueryKey } = useServiceQueryKey('cost-analysis', 'report-adjustment', 'list');

const state = reactive({
    loading: false,
    createdPolicyIdMap: new Map<string, string>(), // Map to store new policy IDs
});
const workspaceReferenceMap = computed<WorkspaceReferenceMap>(() => allReferenceStore.getters.workspace);
const isAllValid = computed<boolean>(() => advancedSettingsPageStore.isAdjustmentPolicyValid && advancedSettingsPageStore.isAdjustmentValid);
const formPolicies = computed<AdjustmentPolicyData[]>(() => advancedSettingsPageState.adjustmentPolicyList);
const originalPolicies = computed<ReportAdjustmentPolicyModel[]>(() => reportAdjustmentPolicyList.value || []);
const originalAdjustments = computed<ReportAdjustmentModel[]>(() => reportAdjustmentList.value || []);
const formAdjustments = computed<AdjustmentData[]>(() => Object.values(advancedSettingsPageState.adjustmentListMap).flat());
const costReportConfigId = computed<string>(() => costReportConfig.value?.cost_report_config_id || '');

/* Util */
const convertRawPolicyToPolicyData = (rawPolicy: ReportAdjustmentPolicyModel): AdjustmentPolicyData => ({
    id: rawPolicy.report_adjustment_policy_id,
    workspaceMenuItems: rawPolicy.policy_filter?.workspace_ids?.map((workspaceId) => ({
        name: workspaceId,
        label: workspaceReferenceMap.value?.[workspaceId]?.name || workspaceId,
    })) || [],
    isAllWorkspaceSelected: !rawPolicy.policy_filter?.workspace_ids,
});
const convertRawAdjustmentToAdjustmentData = (rawAdjustment: ReportAdjustmentModel): AdjustmentData => {
    let adjustment: AdjustmentType;
    if (rawAdjustment.unit === 'FIXED') {
        adjustment = rawAdjustment.value > 0 ? 'FIXED_ADDITION' : 'FIXED_DEDUCTION';
    } else {
        adjustment = rawAdjustment.value > 0 ? 'PERCENT_ADDITION' : 'PERCENT_DEDUCTION';
    }
    return {
        id: rawAdjustment.report_adjustment_id,
        policyId: rawAdjustment.report_adjustment_policy_id,
        name: rawAdjustment.name,
        provider: rawAdjustment.provider,
        adjustment,
        amount: Math.abs(rawAdjustment.value),
        description: rawAdjustment.description,
    };
};

/* Init */
const initForm = async () => {
    try {
        const adjustmentPolicyList: AdjustmentPolicyData[] = reportAdjustmentPolicyList.value?.map(convertRawPolicyToPolicyData) || [];
        const adjustmentList: AdjustmentData[] = reportAdjustmentList.value?.map(convertRawAdjustmentToAdjustmentData) || [];

        // 3. Group Adjustment by Policy
        const adjustmentsByPolicy: Record<string, AdjustmentData[]> = {};
        adjustmentPolicyList.forEach((policy) => {
            adjustmentsByPolicy[policy.id] = adjustmentList.filter(
                (adj) => adj.policyId === policy.id,
            );
        });

        // 4. Store them
        advancedSettingsPageStore.setAdjustmentPolicyList(adjustmentPolicyList);
        advancedSettingsPageStore.setAdjustmentListMap(adjustmentsByPolicy);
    } catch (error) {
        console.error(error);
    }
};

/* Api */
const deleteAdjustmentPolicy = async (): Promise<string[]> => {
    const deletedPolicyIds: string[] = originalPolicies.value
        .map((policy) => policy.report_adjustment_policy_id)
        .filter((_id) => !formPolicies.value.some((p) => p.id === _id));

    deletedPolicyIds.forEach(async (_id) => {
        await reportAdjustmentPolicyAPI.delete({
            report_adjustment_policy_id: _id,
        });
    });
    return deletedPolicyIds;
};
const createAdjustmentPolicy = async (policy: AdjustmentPolicyData, idx: number) => {
    const createdPolicy = await reportAdjustmentPolicyAPI.create({
        cost_report_config_id: costReportConfigId.value,
        policy_filter: {
            workspace_ids: policy.workspaceMenuItems?.map((item) => item.name) || [],
        },
        order: idx + 1,
    });
    state.createdPolicyIdMap.set(policy.id, createdPolicy.report_adjustment_policy_id);
};
const updateAdjustmentPolicy = async (policy: AdjustmentPolicyData, idx: number) => {
    const oldPolicy = originalPolicies.value.find((p) => p.report_adjustment_policy_id === policy.id);
    const newPolicy: ReportAdjustmentPolicyUpdateParameters = {
        report_adjustment_policy_id: policy.id,
        policy_filter: {
            workspace_ids: policy.isAllWorkspaceSelected ? undefined : policy.workspaceMenuItems?.map((item) => item.name),
        },
    };
    const isEqual = (
        !oldPolicy?.policy_filter?.workspace_ids && !newPolicy.policy_filter?.workspace_ids
        || (oldPolicy?.policy_filter?.workspace_ids?.length === newPolicy.policy_filter?.workspace_ids?.length
            && !!oldPolicy?.policy_filter?.workspace_ids?.every((id) => newPolicy.policy_filter?.workspace_ids?.includes(id)))
    );
    if (!isEqual) {
        await reportAdjustmentPolicyAPI.update(newPolicy);
    }
    const newOrder = idx + 1;
    await reportAdjustmentPolicyAPI.changeOrder({
        report_adjustment_policy_id: policy.id,
        order: newOrder,
    });
};
const deleteAdjustment = async (deletedPolicyIds: string[]) => {
    const deletedAdjustmentIds: string[] = originalAdjustments.value
        .filter((adjustment) => !deletedPolicyIds.includes(adjustment.report_adjustment_policy_id))
        .filter((adjustment) => !formAdjustments.value.some((a) => a.id === adjustment.report_adjustment_id))
        .map((adjustment) => adjustment.report_adjustment_id);

    deletedAdjustmentIds.forEach(async (_id) => {
        await reportAdjustmentAPI.delete({
            report_adjustment_id: _id,
        });
    });
};
const createAdjustment = async (adjustment: AdjustmentData, idx: number) => {
    const createdPolicyId = state.createdPolicyIdMap.get(adjustment.policyId) || adjustment.policyId;
    await reportAdjustmentAPI.create({
        report_adjustment_policy_id: createdPolicyId,
        name: adjustment.name,
        provider: adjustment.provider,
        unit: adjustment.adjustment.includes('PERCENT') ? 'PERCENT' : 'FIXED',
        value: adjustment.adjustment.includes('DEDUCTION') ? -adjustment.amount : adjustment.amount,
        description: adjustment.description,
        order: idx + 1,
        currency: costReportConfig.value?.currency,
    });
};
const updateAdjustment = async (adjustment: AdjustmentData, idx: number) => {
    const oldAdjustment = originalAdjustments.value.find((a) => a.report_adjustment_id === adjustment.id);
    const newAdjustment: ReportAdjustmentUpdateParameters = {
        report_adjustment_id: adjustment.id,
        name: adjustment.name,
        provider: adjustment.provider,
        unit: adjustment.adjustment.includes('PERCENT') ? 'PERCENT' : 'FIXED',
        value: adjustment.adjustment.includes('DEDUCTION') ? -adjustment.amount : adjustment.amount,
        description: adjustment.description,
    };
    const isEqual = (
        newAdjustment.name === oldAdjustment?.name
        && newAdjustment.provider === oldAdjustment?.provider
        && newAdjustment.unit === oldAdjustment?.unit
        && newAdjustment.value === oldAdjustment?.value
        && newAdjustment.description === oldAdjustment?.description
    );
    if (!isEqual) {
        await reportAdjustmentAPI.update(newAdjustment);
    }
    const newOrder = idx + 1;
    await reportAdjustmentAPI.changeOrder({
        report_adjustment_id: adjustment.id,
        order: newOrder,
    });
};

/* Event */
const handleClose = () => {
    advancedSettingsPageStore.setShowAdjustmentsOverlay(false);
};
const handleSave = async () => {
    state.loading = true;
    try {
        // CUD Adjustment Policy
        const deletedPolicyIds = await deleteAdjustmentPolicy();
        await formPolicies.value.reduce(async (promise, policy, idx) => {
            await promise;
            if (policy.id.startsWith('rap-')) {
                return updateAdjustmentPolicy(policy, idx);
            }
            return createAdjustmentPolicy(policy, idx);
        }, Promise.resolve());

        // CUD Adjustment
        await deleteAdjustment(deletedPolicyIds);
        await formPolicies.value.reduce(async (promise, policy) => {
            await promise;
            const adjustments = formAdjustments.value.filter((adjustment) => adjustment.policyId === policy.id);
            return adjustments.reduce(async (adjPromise, adjustment, idx) => {
                await adjPromise;
                if (adjustment.id.startsWith('ra-')) {
                    return updateAdjustment(adjustment, idx);
                }
                return createAdjustment(adjustment, idx);
            }, Promise.resolve());
        }, Promise.resolve());

        showSuccessMessage(i18n.t('COST_EXPLORER.ADVANCED_SETTINGS.ALT_S_SAVE_COST_REPORT_ADJUSTMENTS'), '');
    } catch (error) {
        ErrorHandler.handleRequestError(error, i18n.t('COST_EXPLORER.ADVANCED_SETTINGS.ALT_E_SAVE_COST_REPORT_ADJUSTMENTS'));
    } finally {
        await Promise.all([
            queryClient.invalidateQueries({ queryKey: rapQueryKey.value }),
            queryClient.invalidateQueries({ queryKey: raQueryKey.value }),
        ]);
        initForm();
        state.loading = false;
    }
};
const handleSyncCurrency = async (policyIdList: string[]) => {
    try {
        await Promise.all(policyIdList.map(async (policyId) => {
            await reportAdjustmentPolicyAPI.syncCurrency({
                report_adjustment_policy_id: policyId,
            });
        }));
        showSuccessMessage(i18n.t('COST_EXPLORER.ADVANCED_SETTINGS.ALT_S_SYNC_EXCHANGE_RATE'), '');
        queryClient.invalidateQueries({ queryKey: raQueryKey });
    } catch (error) {
        ErrorHandler.handleRequestError(error, i18n.t('COST_EXPLORER.ADVANCED_SETTINGS.ALT_E_SYNC_EXCHANGE_RATE'));
    }
};

/* Watcher */
watch([
    () => advancedSettingsPageState.showAdjustmentsOverlay,
    () => isReportAdjustmentLoading.value,
    () => isReportAdjustmentPolicyLoading.value,
], ([visible, _isReportAdjustmentLoading, _isReportAdjustmentPolicyLoading]) => {
    if (visible && !_isReportAdjustmentLoading && !_isReportAdjustmentPolicyLoading) {
        state.createdPolicyIdMap.clear();
        initForm();
    }
});
</script>

<template>
    <div class="advanced-settings-set-adjustments-overlay">
        <p-overlay-layout :visible="advancedSettingsPageState.showAdjustmentsOverlay"
                          style-type="primary"
                          size="lg"
                          :title="$t('COST_EXPLORER.ADVANCED_SETTINGS.COST_REPORT_ADJUSTMENTS')"
                          @close="handleClose"
        >
            <div class="sidebar-contents">
                <advanced-settings-adjustment-group-form @sync-currency="handleSyncCurrency" />
            </div>
            <template #footer>
                <div class="footer-wrapper">
                    <p-button style-type="transparent"
                              :loading="state.loading"
                              @click="handleClose"
                    >
                        {{ $t('COST_EXPLORER.ADVANCED_SETTINGS.CANCEL') }}
                    </p-button>
                    <p-button style-type="primary"
                              :disabled="!isAllValid"
                              :loading="state.loading"
                              @click="handleSave"
                    >
                        {{ $t('COST_EXPLORER.ADVANCED_SETTINGS.SAVE_CHANGES') }}
                    </p-button>
                </div>
            </template>
        </p-overlay-layout>
    </div>
</template>

<style scoped lang="postcss">
.advanced-settings-set-adjustments-overlay {
    .sidebar-contents {
        display: flex;
        flex-direction: column;
        width: 100%;
        padding: 1rem 1.5rem;
        overflow-y: auto;
    }
    .footer-wrapper {
        @apply border-t border-gray-200;
        display: flex;
        justify-content: flex-end;
        width: 100%;
        gap: 1rem;
        padding: 0.75rem 1rem;
    }

    @screen lg {
        .footer-wrapper {
            bottom: calc($top-bar-height + $gnb-toolbox-height);
        }
    }
}

$footer-height: 57px;

/* custom design-system component - p-sidebar */
:deep(.p-sidebar) {
    .sidebar-wrapper {
        height: 100%;
        padding-top: 0;
        padding-bottom: $footer-height;
        .inner {
            padding-top: 2rem;
            padding-bottom: 1rem;
        }
    }

    @screen lg {
        .sidebar-wrapper {
            padding-bottom: calc($top-bar-height + $gnb-toolbox-height + $footer-height);
        }
    }
}

/* transition */
.slide-up-enter-active {
    transition: all 0.3s ease;
}
.slide-up-leave-active {
    transition: all 0.3s ease-out;
}
.slide-up-enter, .slide-up-leave-to {
    transform: translateY(100px);
    opacity: 0;
}
.slide-left-leave-active,
.slide-left-enter-active {
    transition: all 0.3s ease;
}
.slide-left-enter {
    transform: translate(100%, 0);
}
.slide-left-leave {
    transform: translate(0, 0);
}
.slide-left-leave-to {
    transform: translate(100%, 0);
}
.slide-left-enter-to {
    transform: translate(0, 0);
}
</style>
