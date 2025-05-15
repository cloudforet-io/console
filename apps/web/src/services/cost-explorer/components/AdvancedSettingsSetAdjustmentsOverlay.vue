<script setup lang="ts">
import { computed, reactive, watch } from 'vue';

import {
    PButton, POverlayLayout,
} from '@cloudforet/mirinae';

import { useReportAdjustmentPolicyApi } from '@/api-clients/cost-analysis/report-adjustment-policy/composables/use-report-adjustment-policy-api';
import type { ReportAdjustmentPolicyModel } from '@/api-clients/cost-analysis/report-adjustment-policy/schema/model';
import { useReportAdjustmentApi } from '@/api-clients/cost-analysis/report-adjustment/composables/use-report-adjustment-api';
import type { ReportAdjustmentModel } from '@/api-clients/cost-analysis/report-adjustment/schema/model';

import AdvancedSettingsAdjustmentGroupForm from '@/services/cost-explorer/components/AdvancedSettingsAdjustmentGroupForm.vue';
import { useAdvancedSettingsPageStore } from '@/services/cost-explorer/stores/advanced-settings-page-store';
import type { AdjustmentType, AdjustmentData, AdjustmentPolicyData } from '@/services/cost-explorer/types/report-adjustment-type';

const advancedSettingsPageStore = useAdvancedSettingsPageStore();
const advancedSettingsPageState = advancedSettingsPageStore.$state;

const { reportAdjustmentPolicyAPI } = useReportAdjustmentPolicyApi();
const { reportAdjustmentAPI } = useReportAdjustmentApi();

const state = reactive({
    isAllValid: computed<boolean>(() => advancedSettingsPageStore.isAdjustmentPolicyValid && advancedSettingsPageStore.isAdjustmentValid),
});

/* Util */
const convertRawPolicy = (rawPolicy: ReportAdjustmentPolicyModel): AdjustmentPolicyData => ({
    id: rawPolicy.report_adjustment_policy_id,
    workspaceIdList: rawPolicy.policy_filter?.workspace_ids || [],
});
const convertRawAdjustment = (rawAdjustment: ReportAdjustmentModel): AdjustmentData => {
    let adjustment: AdjustmentType;
    if (rawAdjustment.method === 'FIXED') {
        adjustment = rawAdjustment.value > 0 ? 'FIXED_DEDUCTION' : 'FIXED_ADDITION';
    } else {
        adjustment = rawAdjustment.value > 0 ? 'PERCENTAGE_DEDUCTION' : 'PERCENTAGE_ADDITION';
    }
    return {
        id: rawAdjustment.report_adjustment_id,
        policyId: rawAdjustment.report_adjustment_policy_id,
        name: rawAdjustment.name,
        provider: rawAdjustment.provider,
        adjustment,
        amount: rawAdjustment.value,
        description: rawAdjustment.description,
    };
};

/* Init */
const initForm = async () => {
    try {
        // 1. List Adjustment Policy and convert
        const policyListRes = await reportAdjustmentPolicyAPI.list({});
        const policyList: AdjustmentPolicyData[] = policyListRes.results?.map(convertRawPolicy) || [];

        // 2. List Adjustment and convert
        const adjustmentListRes = await reportAdjustmentAPI.list({});
        const adjustmentList: AdjustmentData[] = adjustmentListRes.results?.map(convertRawAdjustment) || [];

        // 3. Group Adjustment by Policy
        const adjustmentsByPolicy: Record<string, AdjustmentData[]> = {};
        policyList.forEach((policy) => {
            adjustmentsByPolicy[policy.id] = adjustmentList.filter(
                (adj) => adj.policyId === policy.id,
            );
        });

        // 4. Store them
        advancedSettingsPageStore.setAdjustmentPolicyList(policyList);
        advancedSettingsPageStore.setAdjustmentListMap(adjustmentsByPolicy);
    } catch (error) {
        console.error(error);
    }
};

/* Event */
const handleClose = () => {
    advancedSettingsPageStore.setShowAdjustmentsOverlay(false);
};
const handleSave = async () => {
    advancedSettingsPageStore.setLoading(true);
    try {
        // const allData = advancedSettingsPageStore.getAdjustmentGroups();
        // await saveAdjustmentGroups(allData);
        advancedSettingsPageStore.setShowAdjustmentsOverlay(false);
    } catch (error) {
        console.error(error);
    } finally {
        advancedSettingsPageStore.setLoading(false);
    }
};

/* Watcher */
watch(() => advancedSettingsPageState.showAdjustmentsOverlay, (visible) => {
    if (visible) initForm();
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
                <advanced-settings-adjustment-group-form />
            </div>
            <template #footer>
                <div class="footer-wrapper">
                    <p-button style-type="transparent"
                              @click="handleClose"
                    >
                        {{ $t('COST_EXPLORER.ADVANCED_SETTINGS.CANCEL') }}
                    </p-button>
                    <p-button style-type="primary"
                              :disabled="!state.isAllValid"
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
