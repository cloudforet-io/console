<script setup lang="ts">
import draggable from 'vuedraggable';

import {
    PButton, PIconButton, PCard, PSelectDropdown,
} from '@cloudforet/mirinae';


import getRandomId from '@/lib/random-id-generator';

import AdvancedSettingsAdjustmentsForm from '@/services/cost-explorer/components/AdvancedSettingsAdjustmentsForm.vue';
import { useAdvancedSettingsPageStore } from '@/services/cost-explorer/stores/advanced-settings-page-store';


const advancedSettingsPageStore = useAdvancedSettingsPageStore();
const advancedSettingsPageState = advancedSettingsPageStore.$state;

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
                            <p-select-dropdown :menu="[]"
                                               style-type="transparent"
                                               :placeholder="$t('COST_EXPLORER.ADVANCED_SETTINGS.SELECT_WORKSPACE')"
                            />
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
