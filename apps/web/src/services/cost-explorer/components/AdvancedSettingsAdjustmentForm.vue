<script setup lang="ts">
import { reactive, watch } from 'vue';
import draggable from 'vuedraggable';

import cloneDeep from 'lodash/cloneDeep';

import {
    PButton, PIconButton, PCard, PSelectDropdown, PFieldTitle, PTextInput,
} from '@cloudforet/mirinae';

import getRandomId from '@/lib/random-id-generator';

import { useCostExplorerSettingsStore } from '@/services/cost-explorer/stores/cost-explorer-settings-store';

interface AdjustmentData {
    id: string;
    name: string;
    provider: string;
    adjustment: string;
    amount: number;
    description?: string;
}

interface AdjustmentGroup {
    id: string;
    name: string;
}

const costExplorerSettingsStore = useCostExplorerSettingsStore();
const costExplorerSettingsState = costExplorerSettingsStore.$state;

const state = reactive({
    adjustmentGroupList: [] as AdjustmentGroup[],
    adjustmentDataListMap: {} as Record<string, AdjustmentData[]>,
});

const handleAddAdjustmentGroup = () => {
    const groupId = getRandomId();
    state.adjustmentGroupList.push({
        id: groupId,
        name: '',
    });
    state.adjustmentDataListMap[groupId] = [];
};
const handleAddAdjustmentRow = (groupId: string) => {
    if (!groupId) return;
    state.adjustmentDataListMap[groupId].push({
        id: getRandomId(),
        name: '',
        provider: '',
        adjustment: '',
        amount: 0,
        description: '',
    });
    state.adjustmentDataListMap = cloneDeep(state.adjustmentDataListMap);
};

const handleDeleteAdjustmentRow = (groupId: string, adjustmentId: string) => {
    if (!adjustmentId || !groupId) return;
    state.adjustmentDataListMap[groupId] = state.adjustmentDataListMap[groupId].filter((item) => item.id !== adjustmentId);
};

const handleDeleteAdjustmentGroup = (id?: string) => {
    if (!id) return;
    state.adjustmentGroupList = state.adjustmentGroupList.filter((item) => item.id !== id);
    delete state.adjustmentDataListMap[id];
};

/* Api */

/* Event */

watch(() => costExplorerSettingsState.showAdjustmentsOverlay, (visible) => {
    if (visible) {
        // initForm();
    } else {
        // initForm();
    }
});
</script>

<template>
    <div class="advanced-settings-adjustment-group">
        <div class="sidebar-contents-header">
            <p-button style-type="secondary"
                      icon-left="ic_plus_bold"
                      @click="handleAddAdjustmentGroup"
            >
                {{ $t('COST_EXPLORER.ADVANCED_SETTINGS.ADD_ADJUSTMENT_GROUP') }}
            </p-button>
        </div>
        <draggable :list="state.adjustmentGroupList"
                   draggable=".draggable-item-group"
                   ghost-class="ghost"
        >
            <p-card v-for="(adjustmentGroup, aIdx) in state.adjustmentGroupList"
                    :key="`adjustment-group-${aIdx}`"
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
                                           @click="handleDeleteAdjustmentGroup(adjustmentGroup.id)"
                            />
                        </div>
                    </div>
                </template>
                <div class="adjustment-group-body">
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
                    <draggable :list="state.adjustmentDataListMap[adjustmentGroup.id]"
                               draggable=".draggable-item"
                               ghost-class="ghost"
                    >
                        <div v-for="(item, idx) in state.adjustmentDataListMap[adjustmentGroup.id]"
                             :key="`adjustment-row-${adjustmentGroup.id}-${idx}`"
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
                                           @click="handleDeleteAdjustmentRow(adjustmentGroup.id, item.id)"
                            />
                        </div>
                    </draggable>
                    <p-button style-type="transparent"
                              icon-left="ic_plus_bold"
                              block
                              class="adjustment-footer"
                              @click="handleAddAdjustmentRow(adjustmentGroup.id)"
                    >
                        {{ $t('COST_EXPLORER.ADVANCED_SETTINGS.ADD_ADJUSTMENT') }}
                    </p-button>
                </div>
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
    .adjustment-group-body {
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
}
</style>
