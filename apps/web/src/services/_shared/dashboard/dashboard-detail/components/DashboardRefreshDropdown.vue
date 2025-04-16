<script lang="ts" setup>
import { useDocumentVisibility } from '@vueuse/core';
import {
    computed, onUnmounted, reactive, watch,
} from 'vue';
import type { TranslateResult } from 'vue-i18n';

import { useMutation, useQueryClient } from '@tanstack/vue-query';

import { PIconButton, PSelectDropdown } from '@cloudforet/mirinae';
import type { MenuItem } from '@cloudforet/mirinae/types/controls/context-menu/type';

import { REFRESH_INTERVAL_OPTIONS_MAP } from '@/api-clients/dashboard/_constants/dashboard-constant';
import type { RefreshIntervalOption } from '@/api-clients/dashboard/_types/dashboard-type';
import type { PrivateDashboardModel } from '@/api-clients/dashboard/private-dashboard/schema/model';
import type { PublicDashboardModel } from '@/api-clients/dashboard/public-dashboard/schema/model';
import { i18n } from '@/translations';

import { useDashboardManageable } from '@/services/_shared/dashboard/core/composables/_internal/use-dashboard-manageable';
import { useDashboardGetQuery } from '@/services/_shared/dashboard/dashboard-detail/composables/use-dashboard-get-query';
import { useDashboardDetailInfoStore } from '@/services/_shared/dashboard/dashboard-detail/stores/dashboard-detail-info-store';


const REFRESH_INTERVAL_OPTIONS = Object.keys(REFRESH_INTERVAL_OPTIONS_MAP);

interface Props {
    dashboardId?: string;
    disableInterval?: boolean;
    loading?: boolean;
}
const props = withDefaults(defineProps<Props>(), {
    dashboardId: '',
    disableInterval: false,
    loading: false,
});
const emit = defineEmits<{(e: 'refresh'): void;
}>();

const dashboardDetailStore = useDashboardDetailInfoStore();
const dashboardDetailState = dashboardDetailStore.state;

/* Query */
const {
    dashboard, keys, fetcher,
} = useDashboardGetQuery({
    dashboardId: computed(() => props.dashboardId),
});
const queryClient = useQueryClient();
const { getDashboardManageable } = useDashboardManageable();
const dashboardManageable = computed(() => getDashboardManageable(dashboard.value));

const state = reactive({
    intervalOptionList: computed<{label: TranslateResult; value: RefreshIntervalOption}[]>(() => [
        { label: i18n.t('DASHBOARDS.CUSTOMIZE.REFRESH_OFF'), value: 'off' },
        { label: i18n.t('DASHBOARDS.CUSTOMIZE.REFRESH_INTERVAL_15S'), value: '15s' },
        { label: i18n.t('DASHBOARDS.CUSTOMIZE.REFRESH_INTERVAL_30S'), value: '30s' },
        { label: i18n.t('DASHBOARDS.CUSTOMIZE.REFRESH_INTERVAL_1M'), value: '1m' },
        { label: i18n.t('DASHBOARDS.CUSTOMIZE.REFRESH_INTERVAL_5M'), value: '5m' },
        { label: i18n.t('DASHBOARDS.CUSTOMIZE.REFRESH_INTERVAL_10M'), value: '10m' },
        { label: i18n.t('DASHBOARDS.CUSTOMIZE.REFRESH_INTERVAL_30M'), value: '30m' },
        { label: i18n.t('DASHBOARDS.CUSTOMIZE.REFRESH_INTERVAL_1H'), value: '1h' },
    ]),
    intervalOptionItems: computed<MenuItem[]>(() => state.intervalOptionList.map((interval) => ({
        type: 'item',
        name: interval.value,
        label: interval.label,
    }))),
    intervalDuration: computed<number|undefined>(() => {
        if (!dashboardDetailState.options?.refresh_interval_option) return undefined;
        if (!REFRESH_INTERVAL_OPTIONS.includes(dashboardDetailState.options.refresh_interval_option)) return undefined;
        return REFRESH_INTERVAL_OPTIONS_MAP[dashboardDetailState.options.refresh_interval_option];
    }),
});

let refreshIntervalFunction: ReturnType<typeof setInterval> | null;

const clearRefreshInterval = () => {
    if (refreshIntervalFunction) {
        clearInterval(refreshIntervalFunction);
        refreshIntervalFunction = null;
    }
};
const executeRefreshInterval = () => {
    if (!state.intervalDuration) {
        clearRefreshInterval();
        return;
    }
    refreshIntervalFunction = setInterval(() => {
        if (props.loading) {
            clearRefreshInterval();
            executeRefreshInterval(); // do not emit refresh to wait for previous data. pass to next tick.
        } else {
            emit('refresh');
        }
    }, state.intervalDuration);
};

const handleSelectRefreshIntervalOption = (option) => {
    dashboardDetailStore.setOptions({
        ...dashboardDetailState.options,
        refresh_interval_option: option,
    });
    clearRefreshInterval();
    executeRefreshInterval();

    if (dashboardManageable.value) {
        mutate({
            dashboard_id: props.dashboardId,
            options: {
                ...(dashboard.value?.options || {}),
                refresh_interval_option: option,
            },
        });
    }
};

const { mutate } = useMutation(
    {
        mutationFn: fetcher.updateDashboardFn,
        onSuccess: (_dashboard: PublicDashboardModel|PrivateDashboardModel) => {
            const isPrivate = _dashboard.dashboard_id.startsWith('private');
            const dashboardQueryKey = isPrivate ? keys.privateDashboardGetQueryKey : keys.publicDashboardGetQueryKey;
            queryClient.invalidateQueries({ queryKey: dashboardQueryKey.value });
        },
    },
);

watch([() => props.dashboardId, () => props.loading], ([dashboardId, loading], prev) => {
    if (!dashboardId) {
        clearRefreshInterval();
        return;
    }

    if (dashboardId !== prev[0] || loading) {
        clearRefreshInterval();
    }
    if (!loading) {
        executeRefreshInterval();
    }
});


const documentVisibility = useDocumentVisibility();
watch(documentVisibility, (visibility) => {
    if (visibility === 'hidden') {
        clearRefreshInterval();
    } else {
        executeRefreshInterval();
    }
}, { immediate: true });

onUnmounted(() => {
    clearRefreshInterval();
});

const handleRefresh = () => {
    emit('refresh');
};
</script>

<template>
    <div class="dashboard-refresh-dropdown">
        <p-icon-button class="left-icon-button"
                       name="ic_renew"
                       style-type="tertiary"
                       size="sm"
                       shape="square"
                       :disabled="props.loading"
                       :animation="props.loading ? 'reserve-spin' : undefined"
                       @click="handleRefresh"
        />
        <p-select-dropdown class="interval-select-dropdown"
                           size="sm"
                           :menu="state.intervalOptionItems"
                           :selected="dashboardDetailState.options.refresh_interval_option"
                           :disabled="props.disableInterval"
                           :read-only="props.loading"
                           :class="{ loading: props.loading }"
                           menu-position="right"
                           @select="handleSelectRefreshIntervalOption"
        />
    </div>
</template>

<style lang="postcss" scoped>
.dashboard-refresh-dropdown {
    @apply inline-flex items-center;

    /* custom design-system component - p-icon-button */
    :deep(.left-icon-button) {
        border-top-right-radius: 0;
        border-bottom-right-radius: 0;
        border-right: 0;
        &.tertiary.disabled {
            @apply bg-gray-100 border-gray-300;
        }
    }

    .interval-select-dropdown {
        min-width: unset;
    }

    /* custom design-system component - p-select-dropdown */
    :deep(.interval-select-dropdown) {
        .dropdown-button {
            height: 1.5rem;
            border-top-left-radius: 0;
            border-bottom-left-radius: 0;
        }
        .p-context-menu {
            min-width: 6.5rem;
        }
        &.loading {
            .dropdown-button {
                @apply bg-gray-100;
            }
        }
    }
}

</style>
