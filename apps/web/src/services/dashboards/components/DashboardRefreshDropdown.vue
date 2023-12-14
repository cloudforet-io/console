<script lang="ts" setup>
import { useDocumentVisibility } from '@vueuse/core';
import {
    computed, onUnmounted, reactive, watch,
} from 'vue';
import type { TranslateResult } from 'vue-i18n';

import { PIconButton, PSelectDropdown } from '@spaceone/design-system';
import type { MenuItem } from '@spaceone/design-system/types/inputs/context-menu/type';

import { REFRESH_INTERVAL_OPTIONS_MAP } from '@/schema/dashboard/_constants/dashboard-constant';
import type { RefreshIntervalOption } from '@/schema/dashboard/_types/dashboard-type';
import { i18n } from '@/translations';

import { useDashboardDetailInfoStore } from '@/services/dashboards/stores/dashboard-detail-info-store';

const REFRESH_INTERVAL_OPTIONS = Object.keys(REFRESH_INTERVAL_OPTIONS_MAP);

interface Props {
    dashboardId?: string;
    readOnly?: boolean;
    refreshDisabled?: boolean;
    loading?: boolean;
}
const props = withDefaults(defineProps<Props>(), {
    dashboardId: '',
    readOnly: false,
    refreshDisabled: false,
    loading: false,
});
const emit = defineEmits<{(e: 'refresh'): void;
}>();

const dashboardDetailStore = useDashboardDetailInfoStore();
const dashboardDetailState = dashboardDetailStore.$state;

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
        if (!REFRESH_INTERVAL_OPTIONS.includes(dashboardDetailState.settings.refresh_interval_option)) return undefined;
        return REFRESH_INTERVAL_OPTIONS_MAP[dashboardDetailState.settings.refresh_interval_option];
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
    dashboardDetailStore.$patch((_state) => {
        _state.settings.refresh_interval_option = option;
    });
    if (props.refreshDisabled) return;
    clearRefreshInterval();
    executeRefreshInterval();
};

watch([() => props.dashboardId, () => props.loading], ([dashboardId, loading], prev) => {
    if (!dashboardId || props.refreshDisabled) {
        clearRefreshInterval();
        return;
    }

    if (dashboardId !== prev[0] || loading) {
        clearRefreshInterval();
    }
    if (!loading) {
        if (props.refreshDisabled) return;
        executeRefreshInterval();
    }
});


const documentVisibility = useDocumentVisibility();
watch(documentVisibility, (visibility) => {
    if (visibility === 'hidden') {
        clearRefreshInterval();
    } else if (!props.refreshDisabled) executeRefreshInterval();
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
                       shape="square"
                       :disabled="props.refreshDisabled || props.loading"
                       :animation="props.loading ? 'reserve-spin' : undefined"
                       @click="handleRefresh"
        />
        <p-select-dropdown class="currency-select-dropdown"
                           :menu="state.intervalOptionItems"
                           :selected="dashboardDetailState.settings.refresh_interval_option"
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

    .currency-select-dropdown {
        min-width: unset;
    }

    /* custom design-system component - p-select-dropdown */
    :deep(.currency-select-dropdown) {
        .dropdown-button {
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
