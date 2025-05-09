<script setup lang="ts">
import { computed, reactive, watch } from 'vue';
import draggable from 'vuedraggable';

import {
    PButton, PIconButton, POverlayLayout, PCard, PSelectDropdown, PFieldTitle, PTextInput,
} from '@cloudforet/mirinae';

import { useCostExplorerSettingsStore } from '@/services/cost-explorer/stores/cost-explorer-settings-store';

const costExplorerSettingsStore = useCostExplorerSettingsStore();
const costExplorerSettingsState = costExplorerSettingsStore.$state;

const state = reactive({
    loading: false,
    disableConfirmButton: computed<boolean>(() => {
        if (state.loading) return true;
        return false;
    }),
    adjustmentRows: [
        {
            id: 1,
            title: 'Adjustment 1',
            dataSource: 'Adjustment 1',
            adjustment: 'Adjustment 1',
            amount: 'Adjustment 1',
            description: 'Adjustment 1',
        },
    ],
});

const handleAddAdjustmentRow = () => {
    state.adjustmentRows.push({
        id: state.adjustmentRows.length + 1,
        title: '',
        dataSource: '',
        adjustment: '',
        amount: '',
        description: '',
    });
};

/* Api */

/* Event */
const handleClose = () => {
    costExplorerSettingsStore.setShowAdjustmentsOverlay(false);
};

watch(() => costExplorerSettingsState.showAdjustmentsOverlay, (visible) => {
    if (visible) {
        // initForm();
    } else {
        // initForm();
    }
});
</script>

<template>
    <div class="advanced-settings-set-adjustments-overlay">
        <p-overlay-layout :visible="costExplorerSettingsState.showAdjustmentsOverlay"
                          style-type="primary"
                          size="lg"
                          :title="$t('COST_EXPLORER.ADVANCED_SETTINGS.COST_REPORT_ADJUSTMENTS')"
                          @close="handleClose"
        >
            <div class="sidebar-contents">
                <div class="sidebar-contents-header">
                    <p-button style-type="tertiary"
                              icon-left="ic_plus_bold"
                              @click="handleClose"
                    >
                        {{ $t('COST_EXPLORER.ADVANCED_SETTINGS.ADD_ADJUSTMENT_GROUP') }}
                    </p-button>
                </div>
                <div class="sidebar-contents-body">
                    <p-card>
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
                                    <p-icon-button name="ic_delete" />
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
                            <draggable v-model="state.adjustmentRows"
                                       draggable=".draggable-item"
                                       ghost-class="ghost"
                            >
                                <div v-for="(item, idx) in state.adjustmentRows"
                                     :key="`adjustment-row-${item.id}-${idx}`"
                                     class="adjustment-row draggable-item"
                                >
                                    <p-icon-button name="ic_drag-handle"
                                                   size="sm"
                                                   class="adjustment-row-drag-button"
                                    />
                                    <p-text-input v-model="item.title"
                                                  block
                                    />
                                    <p-select-dropdown v-model="item.dataSource"
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
                    </p-card>
                </div>
            </div>
            <template #footer>
                <div class="footer-wrapper">
                    <p-button style-type="transparent"
                              @click="handleClose"
                    >
                        {{ $t('COST_EXPLORER.ADVANCED_SETTINGS.CANCEL') }}
                    </p-button>
                    <p-button style-type="primary"
                              :disabled="state.disableConfirmButton"
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

        .sidebar-contents-header {
            margin-bottom: 1rem;
        }
        .sidebar-contents-body {
            display: flex;
            flex-direction: column;
            width: 100%;
            gap: 1rem;
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
                }
                .adjustment-footer {
                    @apply mt-4;
                }
            }
        }
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
