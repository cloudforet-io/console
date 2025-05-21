<script setup lang="ts">
import { computed } from 'vue';
import draggable from 'vuedraggable';

import {
    PButton, PIconButton, PCard, PSelectDropdown, PCheckbox,
} from '@cloudforet/mirinae';
import type { SelectDropdownMenuItem, AutocompleteHandler } from '@cloudforet/mirinae/types/controls/dropdown/select-dropdown/type';

import getRandomId from '@/lib/random-id-generator';
import { VariableModelFactory } from '@/lib/variable-models';
import {
    getVariableModelMenuHandler,
} from '@/lib/variable-models/variable-model-menu-handler';
import type {
    VariableModelMenuHandlerInfo,
} from '@/lib/variable-models/variable-model-menu-handler';

import AdvancedSettingsAdjustmentsForm from '@/services/cost-explorer/components/AdvancedSettingsAdjustmentsForm.vue';
import { useAdvancedSettingsPageStore } from '@/services/cost-explorer/stores/advanced-settings-page-store';

const advancedSettingsPageStore = useAdvancedSettingsPageStore();
const advancedSettingsPageState = advancedSettingsPageStore.$state;

const workspaceMenuHandler = computed<AutocompleteHandler>(() => {
    const variableModelInfo: VariableModelMenuHandlerInfo = {
        variableModel: new VariableModelFactory({ type: 'MANAGED', managedModelKey: 'workspace' }),
    };
    return getVariableModelMenuHandler([variableModelInfo]);
});

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
    </div>
</template>

<style scoped lang="postcss">
.advanced-settings-adjustment-group {
    display: flex;
    flex-direction: column;
    width: 100%;
    gap: 1rem;
    .sidebar-contents-header {
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
