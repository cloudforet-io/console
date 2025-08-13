<script setup lang="ts">
import { computed, reactive } from 'vue';
import draggable from 'vuedraggable';

import {
    PButton, PIconButton, PCard, PSelectDropdown, PCheckbox, PButtonModal,
} from '@cloudforet/mirinae';
import type { SelectDropdownMenuItem } from '@cloudforet/mirinae/types/controls/dropdown/select-dropdown/type';

import { useResourceMenuHandlerMap } from '@/query/resource-query/resource-menu-handler';

import type { Currency } from '@/store/display/type';

import getRandomId from '@/lib/random-id-generator';

import AdvancedSettingsAdjustmentsForm from '@/services/cost-explorer/components/AdvancedSettingsAdjustmentsForm.vue';
import { useCostReportConfigQuery } from '@/services/cost-explorer/composables/use-cost-report-config-query';
import { useReportAdjustmentQuery } from '@/services/cost-explorer/composables/use-report-adjustment-query';
import { useAdvancedSettingsPageStore } from '@/services/cost-explorer/stores/advanced-settings-page-store';


const emit = defineEmits<{(e: 'sync-currency', policyIdList: string[]): void; }>();

const resourceMenuHandlerMap = useResourceMenuHandlerMap();

const advancedSettingsPageStore = useAdvancedSettingsPageStore();
const advancedSettingsPageState = advancedSettingsPageStore.$state;
const { costReportConfig } = useCostReportConfigQuery();
const { reportAdjustmentList } = useReportAdjustmentQuery();

const state = reactive({
    syncCurrencyModalVisible: false,
});

/* Computed */
const originCostReportConfigCurrency = computed<Currency|undefined>(() => costReportConfig.value?.currency);
const differentCurrencyPolicyIds = computed<string[]>(() => {
    const ids = reportAdjustmentList.value
        ?.filter((d) => d.currency !== originCostReportConfigCurrency.value)
        .map((d) => d.report_adjustment_policy_id) ?? [];
    return Array.from(new Set(ids));
});
const workspaceMenuHandler = computed(() => resourceMenuHandlerMap.workspace({
    menuFilters: [{
        k: 'is_dormant',
        v: false,
        o: '=',
    }],
}));

/* Event Handler */
const handleSelectWorkspace = (policyId: string, selected: SelectDropdownMenuItem[]) => {
    const targetPolicy = advancedSettingsPageState.adjustmentPolicyList.find((d) => d.id === policyId);
    if (targetPolicy) {
        advancedSettingsPageStore.updateAdjustmentPolicy(policyId, {
            ...targetPolicy,
            workspaceMenuItems: selected,
        });
    }
};
const handleUpdateIsAllWorkspaceSelected = (policyId: string) => {
    const targetPolicy = advancedSettingsPageState.adjustmentPolicyList.find((d) => d.id === policyId);
    const _isSelected = !targetPolicy?.isAllWorkspaceSelected;
    if (targetPolicy) {
        advancedSettingsPageStore.updateAdjustmentPolicy(policyId, {
            ...targetPolicy,
            ...(_isSelected ? { workspaceMenuItems: undefined } : {}),
            isAllWorkspaceSelected: _isSelected,
        });
    }
};
const handleAddAdjustmentPolicy = () => {
    const policyId = getRandomId();
    advancedSettingsPageStore.addAdjustmentPolicy(policyId);
};
const handleDeleteAdjustmentPolicy = (policyId: string) => {
    advancedSettingsPageStore.deleteAdjustmentPolicy(policyId);
};
const handleOpenSyncCurrencyModal = () => {
    state.syncCurrencyModalVisible = true;
};
const handleSyncCurrency = () => {
    emit('sync-currency', differentCurrencyPolicyIds.value);
    state.syncCurrencyModalVisible = false;
};
</script>

<template>
    <div class="advanced-settings-adjustment-group">
        <div class="sidebar-contents-header">
            <p-button style-type="secondary"
                      icon-left="ic_plus_bold"
                      @click="handleAddAdjustmentPolicy"
            >
                {{ $t('COST_EXPLORER.ADVANCED_SETTINGS.ADD_ADJUSTMENT_GROUP') }}
            </p-button>
            <p-button v-if="differentCurrencyPolicyIds.length > 0"
                      style-type="negative-primary"
                      icon-left="ic_warning-filled"
                      size="sm"
                      @click="handleOpenSyncCurrencyModal"
            >
                {{ $t('COST_EXPLORER.ADVANCED_SETTINGS.SYNC_EXCHANGE_RATE') }}
            </p-button>
        </div>
        <draggable :list="advancedSettingsPageState.adjustmentPolicyList"
                   draggable=".draggable-item-group"
                   ghost-class="ghost"
        >
            <p-card v-for="(adjustmentPolicy, aIdx) in advancedSettingsPageState.adjustmentPolicyList"
                    :key="`adjustment-policy-${aIdx}`"
                    class="draggable-item-group"
            >
                <template #header>
                    <div class="adjustment-group-header">
                        <div class="left-part">
                            <p-icon-button name="ic_drag-handle"
                                           size="sm"
                            />
                            {{ $t('COST_EXPLORER.ADVANCED_SETTINGS.WORKSPACE') }}:
                            <p-select-dropdown size="sm"
                                               is-filterable
                                               :handler="workspaceMenuHandler"
                                               :selected="adjustmentPolicy.workspaceMenuItems"
                                               menu-position="left"
                                               multi-selectable
                                               show-select-marker
                                               use-fixed-menu-style
                                               :placeholder="$t('COST_EXPLORER.ADVANCED_SETTINGS.SELECT_WORKSPACE')"
                                               :disabled="!!adjustmentPolicy.isAllWorkspaceSelected"
                                               :page-size="10"
                                               @update:selected="handleSelectWorkspace(adjustmentPolicy.id, $event)"
                            />
                            <p-checkbox
                                :selected="adjustmentPolicy.isAllWorkspaceSelected"
                                class="ml-2 min-w-40"
                                @change="handleUpdateIsAllWorkspaceSelected(adjustmentPolicy.id)"
                            >
                                {{ $t('COMMON.NAVIGATIONS.TOP_BAR.ALL_WORKSPACE') }}
                            </p-checkbox>
                        </div>
                        <div class="right-part">
                            <p-icon-button name="ic_delete"
                                           @click="handleDeleteAdjustmentPolicy(adjustmentPolicy.id)"
                            />
                        </div>
                    </div>
                </template>
                <advanced-settings-adjustments-form :policy-id="adjustmentPolicy.id" />
            </p-card>
        </draggable>
        <p-button-modal class="sync-currency-modal"
                        size="sm"
                        theme-color="alert"
                        :visible.sync="state.syncCurrencyModalVisible"
                        :header-title="$t('COST_EXPLORER.ADVANCED_SETTINGS.SYNC_EXCHANGE_RATE')"
                        @confirm="handleSyncCurrency"
        >
            <template #body>
                <div class="whitespace-pre-line">
                    {{ $t('COST_EXPLORER.ADVANCED_SETTINGS.SYNC_EXCHANGE_RATE_MODAL_DESC') }}
                </div>
            </template>
        </p-button-modal>
    </div>
</template>

<style scoped lang="postcss">
.advanced-settings-adjustment-group {
    display: flex;
    flex-direction: column;
    width: 100%;
    gap: 1rem;
    .sidebar-contents-header {
        @apply flex items-center justify-between;
        margin-bottom: 1rem;
    }
    .draggable-item-group {
        margin-bottom: 1rem;
    }
    .adjustment-group-header {
        @apply flex items-center justify-between;
        .left-part {
            @apply flex items-center gap-1;
        }
    }
}
</style>
