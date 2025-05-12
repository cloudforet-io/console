<script setup lang="ts">
import { computed, reactive } from 'vue';

import {
    PButton, POverlayLayout,
} from '@cloudforet/mirinae';

import AdvancedSettingsAdjustmentForm from '@/services/cost-explorer/components/AdvancedSettingsAdjustmentForm.vue';
import { useCostExplorerSettingsStore } from '@/services/cost-explorer/stores/cost-explorer-settings-store';

const costExplorerSettingsStore = useCostExplorerSettingsStore();
const costExplorerSettingsState = costExplorerSettingsStore.$state;

const state = reactive({
    loading: false,
    disableConfirmButton: computed<boolean>(() => {
        if (state.loading) return true;
        return false;
    }),
});

/* Event */
const handleClose = () => {
    costExplorerSettingsStore.setShowAdjustmentsOverlay(false);
};
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
                <advanced-settings-adjustment-form />
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
