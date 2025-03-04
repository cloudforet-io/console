<script setup lang="ts">
import { onClickOutside } from '@vueuse/core';
import { computed, reactive, ref } from 'vue';

import { useMutation } from '@tanstack/vue-query';

import { PButton, PBadge, PPopover } from '@cloudforet/mirinae';

import type { PrivateDashboardModel } from '@/api-clients/dashboard/private-dashboard/schema/model';
import type { PublicDashboardModel } from '@/api-clients/dashboard/public-dashboard/schema/model';

import ErrorHandler from '@/common/composables/error/errorHandler';

import DashboardLabels from '@/services/dashboards/components/dashboard-detail/DashboardLabels.vue';
import { useDashboardDetailQuery } from '@/services/dashboards/composables/use-dashboard-detail-query';
import { useDashboardManageable } from '@/services/dashboards/composables/use-dashboard-manageable';
import { useDashboardDetailInfoStore } from '@/services/dashboards/stores/dashboard-detail-info-store';



interface Props {
    dashboardId: string;
}
const props = defineProps<Props>();

const labelPopoverRef = ref<HTMLElement|null>(null);
const dashboardDetailStore = useDashboardDetailInfoStore();
const dashboardDetailState = dashboardDetailStore.state;
/* Query */
const {
    dashboard,
    fetcher,
    keys,
    queryClient,
} = useDashboardDetailQuery({
    dashboardId: computed(() => dashboardDetailState.dashboardId),
});
const { isManageable } = useDashboardManageable({
    dashboardId: computed(() => dashboardDetailState.dashboardId),
});
const state = reactive({
    visible: false,
    dashboardLabels: computed<string[]>(() => dashboard.value?.labels || []),
    isDeprecatedDashboard: computed(() => dashboard.value?.version === '1.0'),
});

const handleUpdateLabels = async (labels: string[]) => {
    mutate({
        dashboard_id: props.dashboardId,
        labels,
    });
};

const { mutate } = useMutation(
    {
        mutationFn: fetcher.updateDashboardFn,
        onSuccess: (_dashboard: PublicDashboardModel|PrivateDashboardModel) => {
            const isPrivate = _dashboard.dashboard_id.startsWith('private');
            const dashboardQueryKey = isPrivate ? keys.privateDashboardGetQueryKey : keys.publicDashboardGetQueryKey;
            queryClient.invalidateQueries({ queryKey: dashboardQueryKey.value });
        },
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
