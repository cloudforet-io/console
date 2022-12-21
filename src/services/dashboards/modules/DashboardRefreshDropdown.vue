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
                           :items="intervalItems"
                           :selected="interval"
                           :read-only="loading"
                           :class="{ loading }"
                           menu-position="right"
                           @select="handleSelectInterval"
        />
    </div>
</template>

<script lang="ts">
import type { PropType } from 'vue';
import {
    computed, defineComponent, reactive, toRefs, watch,
} from 'vue';
import type { TranslateResult } from 'vue-i18n';

import { PIconButton, PSelectDropdown } from '@spaceone/design-system';
import type { MenuItem } from '@spaceone/design-system/dist/src/inputs/context-menu/type';

import { i18n } from '@/translations';

import { useProxyValue } from '@/common/composables/proxy-state';

import type { RefreshInterval } from '@/services/dashboards/config';
import { refreshIntervalList, REFRESH_INTERVAL_OPTIONS_MAP } from '@/services/dashboards/config';

interface Props {
    readOnly: boolean;
    refreshDisabled: boolean;
    interval: RefreshInterval;
    loading: boolean;
}

export default defineComponent<Props>({
    name: 'DashboardRefreshDropdown',
    components: {
        PIconButton,
        PSelectDropdown,
    },
    props: {
        readOnly: {
            type: Boolean,
            default: false,
        },
        refreshDisabled: {
            type: Boolean,
            default: false,
        },
        interval: {
            type: String as PropType<RefreshInterval>,
            default: refreshIntervalList[0],
        },
        loading: {
            type: Boolean,
            default: false,
        },
    },
    setup(props, { emit }) {
        const state = reactive({
            interval: useProxyValue('interval', props, emit),
            intervalList: computed<{label: TranslateResult; value: RefreshInterval}[]>(() => [
                { label: i18n.t('DASHBOARDS.CUSTOMIZE.REFRESH_OFF'), value: 'off' },
                { label: i18n.t('DASHBOARDS.CUSTOMIZE.REFRESH_INTERVAL_15S'), value: '15s' },
                { label: i18n.t('DASHBOARDS.CUSTOMIZE.REFRESH_INTERVAL_30S'), value: '30s' },
                { label: i18n.t('DASHBOARDS.CUSTOMIZE.REFRESH_INTERVAL_1M'), value: '1m' },
                { label: i18n.t('DASHBOARDS.CUSTOMIZE.REFRESH_INTERVAL_5M'), value: '5m' },
                { label: i18n.t('DASHBOARDS.CUSTOMIZE.REFRESH_INTERVAL_10M'), value: '10m' },
                { label: i18n.t('DASHBOARDS.CUSTOMIZE.REFRESH_INTERVAL_30M'), value: '30m' },
                { label: i18n.t('DASHBOARDS.CUSTOMIZE.REFRESH_INTERVAL_1H'), value: '1h' },
            ]),
            intervalItems: computed<MenuItem[]>(() => state.intervalList.map((interval) => ({
                type: 'item',
                name: interval.value,
                label: interval.label,
            }))),
        });

        const handleSelectInterval = (interval) => {
            state.interval = interval;
        };
        let intervalFunction: NodeJS.Timeout | null;

        const executeInterval = () => {
            if (refreshIntervalList.includes(props.interval) && !intervalFunction) {
                intervalFunction = setInterval(() => {
                    if (props.loading) {
                        if (intervalFunction) {
                            clearInterval(intervalFunction);
                            intervalFunction = null;
                        }
                    } else {
                        emit('refresh');
                    }
                }, REFRESH_INTERVAL_OPTIONS_MAP[props.interval]);
            }
        };

        watch(() => props.loading, (loading) => {
            if (loading) {
                if (intervalFunction) {
                    clearInterval(intervalFunction);
                    intervalFunction = null;
                }
            } else {
                executeInterval();
            }
        });

        executeInterval();

        const handleRefresh = () => {
            emit('refresh');
        };

        return {
            ...toRefs(state),
            handleSelectInterval,
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
