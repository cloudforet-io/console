<script setup lang="ts">
import { computed, reactive } from 'vue';

import { PButton, PBadge, PPopover } from '@cloudforet/mirinae';

import { useDashboardStore } from '@/store/dashboard/dashboard-store';

import ErrorHandler from '@/common/composables/error/errorHandler';

import DashboardLabels from '@/services/dashboards/components/DashboardLabels.vue';
import { useDashboardDetailInfoStore } from '@/services/dashboards/stores/dashboard-detail-info-store';

interface Props {
    dashboardId: string;
}
const props = defineProps<Props>();

const dashboardStore = useDashboardStore();
const dashboardDetailStore = useDashboardDetailInfoStore();
const dashboardDetailGetters = dashboardDetailStore.getters;
const dashboardDetailState = dashboardDetailStore.state;

const storeState = reactive({
    labelList: computed(() => dashboardDetailState.labels),
});

const state = reactive({
    visible: false,
});

const handleUpdateLabels = async (labels: string[]) => {
    try {
        await dashboardStore.updateDashboard(props.dashboardId, {
            labels,
        });
    } catch (e) {
        ErrorHandler.handleError(e);
    }
};
</script>

<template>
    <div class="dashboard-labels-button">
        <p-popover :is-visible.sync="state.visible"
                   tag="div"
                   position="bottom"
        >
            <p-button icon-left="ic_label"
                      style-type="tertiary"
                      class="label-button"
                      size="sm"
            >
                <div class="button-contents-wrapper">
                    <span class="button-text">{{ $t('Label') }}</span>
                    <p-badge v-if="storeState.labelList.length > 0"
                             style-type="gray200"
                             badge-type="subtle"
                    >
                        +{{ storeState.labelList.length }}
                    </p-badge>
                </div>
            </p-button>
            <template #content>
                <div class="content-wrapper">
                    <dashboard-labels :editable="!dashboardDetailGetters.isDeprecatedDashboard && !dashboardDetailGetters.disableManageButtons"
                                      @update-labels="handleUpdateLabels"
                    />
                </div>
            </template>
        </p-popover>
    </div>
</template>

<style lang="postcss" scoped>
.dashboard-labels-button {
    .label-button {
        .button-contents-wrapper {
            @apply inline-flex items-center;
            gap: 0.125rem;
            .button-text {
                @apply text-label-sm font-bold text-gray-900;
            }

            /* custom design-system component - p-badge */
            :deep(.p-badge) {
                @apply text-label-sm;
                height: 1rem;
                min-height: 1rem;
                padding: 0 0.375rem;
                line-height: unset;
            }
        }
    }
    .content-wrapper {
        min-width: 18rem;
        min-height: 4.6875rem;
    }

    /* custom design-system component - p-popover */
    :deep(.p-popover) {
        .popper-content-wrapper {
            min-height: 5.1875rem;
            min-width: 18rem;
            max-width: 28rem;
            max-height: 10.5rem;
            overflow: auto;
        }
    }
}
</style>
