<script setup lang="ts">
import { onClickOutside } from '@vueuse/core';
import { computed, reactive, ref } from 'vue';

import { PButton, PBadge, PPopover } from '@cloudforet/mirinae';


import ErrorHandler from '@/common/composables/error/errorHandler';

import { useDashboardUpdateAction } from '@/services/dashboard-shared/core/actions/use-dashboard-update-action';
import { useDashboardManageable } from '@/services/dashboard-shared/core/composables/use-dashboard-manageable';
import DashboardLabels from '@/services/dashboard-shared/dashboard-detail/components/DashboardLabels.vue';
import { useDashboardGetQuery } from '@/services/dashboard-shared/dashboard-detail/composables/use-dashboard-get-query';



interface Props {
    dashboardId: string;
}
const props = defineProps<Props>();

const labelPopoverRef = ref<HTMLElement|null>(null);
/* Query */
const {
    dashboard,
} = useDashboardGetQuery({
    dashboardId: computed(() => props.dashboardId),
});
const { isManageable } = useDashboardManageable({
    dashboardId: computed(() => props.dashboardId),
});
const state = reactive({
    visible: false,
    dashboardLabels: computed<string[]>(() => dashboard.value?.labels || []),
    isDeprecatedDashboard: computed(() => dashboard.value?.version === '1.0'),
});

const handleUpdateLabels = async (labels: string[]) => {
    updateDashboard({
        dashboard_id: props.dashboardId,
        labels,
    });
};

const { mutate: updateDashboard } = useDashboardUpdateAction(
    {
        dashboardId: computed(() => props.dashboardId),
        onError: (e) => {
            ErrorHandler.handleError(e);
        },
    },
);

onClickOutside(labelPopoverRef, () => { state.visible = false; });
</script>

<template>
    <div class="dashboard-labels-button">
        <p-popover ref="labelPopoverRef"
                   :is-visible.sync="state.visible"
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
                    <p-badge v-if="state.dashboardLabels.length > 0"
                             style-type="gray200"
                             badge-type="subtle"
                    >
                        +{{ state.dashboardLabels.length }}
                    </p-badge>
                </div>
            </p-button>
            <template #content>
                <div class="content-wrapper">
                    <dashboard-labels :editable="!state.isDeprecatedDashboard && isManageable"
                                      :dashboard-id="props.dashboardId"
                                      @update-labels="handleUpdateLabels"
                    />
                </div>
            </template>
        </p-popover>
    </div>
</template>

<style lang="postcss" scoped>
.dashboard-labels-button {
    line-height: 1;
    .label-button {
        .button-contents-wrapper {
            @apply inline-flex items-center;
            gap: 0.125rem;
            .button-text {
                @apply text-label-sm font-bold text-gray-900;
            }

            /* custom design-system component - p-badge */
            :deep(.p-badge) {
                @apply text-label-sm font-normal;
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
        .floating-content-wrapper {
            min-height: 5.1875rem;
            min-width: 18rem;
            max-width: 28rem;
            max-height: 10.5rem;
            overflow: auto;
        }
    }
}
</style>
