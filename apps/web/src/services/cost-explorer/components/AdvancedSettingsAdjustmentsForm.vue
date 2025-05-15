<script setup lang="ts">
import draggable from 'vuedraggable';

import {
    PButton, PIconButton, PSelectDropdown, PFieldTitle, PTextInput,
} from '@cloudforet/mirinae';

import { useAdvancedSettingsPageStore } from '@/services/cost-explorer/stores/advanced-settings-page-store';

const props = defineProps<{
    policyId: string;
}>();

const advancedSettingsPageStore = useAdvancedSettingsPageStore();
const advancedSettingsPageState = advancedSettingsPageStore.$state;

/* Event */
const handleAddAdjustmentRow = () => {
    advancedSettingsPageStore.addAdjustment(props.policyId);
};
const handleDeleteAdjustmentRow = (adjustmentId: string) => {
    if (!adjustmentId) return;
    advancedSettingsPageStore.deleteAdjustment(props.policyId, adjustmentId);
};
</script>

<template>
    <div class="advanced-settings-adjustment-form-adjustments">
        <div class="adjustment-row">
            <p-field-title size="sm"
                           color="gray"
            >
                {{ $t('COST_EXPLORER.ADVANCED_SETTINGS.TITLE') }}
            </p-field-title>
            <p-field-title size="sm"
                           color="gray"
            >
                {{ $t('COST_EXPLORER.ADVANCED_SETTINGS.PROVIDER') }}
            </p-field-title>
            <p-field-title size="sm"
                           color="gray"
            >
                {{ $t('COST_EXPLORER.ADVANCED_SETTINGS.ADJUSTMENT') }}
            </p-field-title>
            <p-field-title size="sm"
                           color="gray"
            >
                {{ $t('COST_EXPLORER.ADVANCED_SETTINGS.AMOUNT') }}
            </p-field-title>
            <p-field-title size="sm"
                           color="gray"
            >
                <span>{{ $t('COST_EXPLORER.ADVANCED_SETTINGS.DESCRIPTION') }}</span>
                <span class="text-gray-400 text-xs font-normal"> (optional)</span>
            </p-field-title>
        </div>
        <draggable :list="advancedSettingsPageState.adjustmentListMap[props.policyId]"
                   draggable=".draggable-item"
                   ghost-class="ghost"
        >
            <div v-for="(item, idx) in advancedSettingsPageState.adjustmentListMap[props.policyId]"
                 :key="`adjustment-row-${idx}`"
                 class="adjustment-row draggable-item"
            >
                <p-icon-button name="ic_drag-handle"
                               size="sm"
                               class="adjustment-row-drag-button"
                />
                <p-text-input v-model="item.name"
                              block
                />
                <p-select-dropdown v-model="item.provider"
                                   :menu="[]"
                                   block
                />
                <p-select-dropdown v-model="item.adjustment"
                                   :menu="[]"
                                   block
                />
                <p-text-input v-model="item.amount"
                              block
                              type="number"
                />
                <p-text-input v-model="item.description"
                              block
                />
                <p-icon-button name="ic_close"
                               size="sm"
                               class="adjustment-row-delete-button"
                               @click="handleDeleteAdjustmentRow(item.id)"
                />
            </div>
        </draggable>
        <p-button style-type="transparent"
                  icon-left="ic_plus_bold"
                  block
                  class="adjustment-footer"
                  @click="handleAddAdjustmentRow"
        >
            {{ $t('COST_EXPLORER.ADVANCED_SETTINGS.ADD_ADJUSTMENT') }}
        </p-button>
    </div>
</template>

<style scoped lang="postcss">
.advanced-settings-adjustment-form-adjustments {
    padding: 1rem;
    .adjustment-row {
        @apply grid grid-cols-5 gap-2 mb-1;
        position: relative;
        padding: 0.25rem 2rem;
        &.ghost {
            opacity: 0.5;
        }
        .adjustment-row-drag-button {
            @apply cursor-move;
            position: absolute;
            left: 0;
            top: 0.5rem;
            z-index: 1;
        }
        .adjustment-row-delete-button {
            position: absolute;
            right: 0;
            top: 0.5rem;
            z-index: 1;
        }
    }
    .adjustment-footer {
        @apply mt-4;
    }
}
</style>
