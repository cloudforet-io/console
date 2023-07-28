<template>
    <div class="dashboard-refresh-dropdown">
        <p-icon-button class="left-icon-button"
                       name="ic_renew"
                       style-type="tertiary"
                       shape="square"
                       :disabled="refreshDisabled || loading"
                       :animation="loading ? 'reserve-spin' : undefined"
                       @click="handleRefresh"
        />
        <p-select-dropdown class="currency-select-dropdown"
                           :items="intervalOptionItems"
                           :selected="dashboardDetailState.settings.refresh_interval_option"
                           :read-only="loading"
                           :class="{ loading }"
                           menu-position="right"
                           @select="handleSelectRefreshIntervalOption"
        />
    </div>
</template>

<script lang="ts">
import { useDocumentVisibility } from '@vueuse/core';
import type { SetupContext } from 'vue';
import {
    computed, defineComponent, onUnmounted, reactive, toRefs, watch,
} from 'vue';
import type { TranslateResult } from 'vue-i18n';

import { PIconButton, PSelectDropdown } from '@spaceone/design-system';
import type { MenuItem } from '@spaceone/design-system/types/inputs/context-menu/type';

import { i18n } from '@/translations';

import type { RefreshIntervalOption } from '@/services/dashboards/config';
import { refreshIntervalOptionList, REFRESH_INTERVAL_OPTIONS_MAP } from '@/services/dashboards/config';
import { useDashboardDetailInfoStore } from '@/services/dashboards/store/dashboard-detail-info';

interface Props {
    dashboardId: string;
    readOnly: boolean;
    refreshDisabled: boolean;
    loading: boolean;
}

export default defineComponent<Props>({
    name: 'DashboardRefreshDropdown',
    components: {
        PIconButton,
        PSelectDropdown,
    },
    props: {
        dashboardId: {
            type: String,
            default: '',
        },
        readOnly: {
            type: Boolean,
            default: false,
        },
        refreshDisabled: {
            type: Boolean,
            default: false,
        },
        loading: {
            type: Boolean,
            default: false,
        },
    },
    setup(props, { emit }: SetupContext) {
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
                if (!refreshIntervalOptionList.includes(dashboardDetailState.settings.refresh_interval_option)) return undefined;
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

        return {
            ...toRefs(state),
            dashboardDetailState,
            handleSelectRefreshIntervalOption,
            handleRefresh,
        };
    },
});
</script>

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
