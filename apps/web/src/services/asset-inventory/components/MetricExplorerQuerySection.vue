<script lang="ts" setup>
import {
    useElementSize,
} from '@vueuse/core';
import {
    reactive, ref,
} from 'vue';

import {
    PButton, PPopover, PBadge, PIconButton,
} from '@spaceone/design-system';

import MetricExplorerFiltersPopper from '@/services/asset-inventory/components/MetricExplorerFiltersPopper.vue';
import MetricExplorerGranularityDropdown from '@/services/asset-inventory/components/MetricExplorerGranularityDropdown.vue';
import MetricExplorerOperatorDropdown from '@/services/asset-inventory/components/MetricExplorerOperatorDropdown.vue';
import MetricExplorerPeriodDropdown from '@/services/asset-inventory/components/MetricExplorerPeriodDropdown.vue';
import { useMetricExplorerPageStore } from '@/services/asset-inventory/stores/metric-explorer-page-store';
import type { Granularity } from '@/services/asset-inventory/types/metric-explorer-type';


const metricExplorerPageStore = useMetricExplorerPageStore();
const metricExplorerPageState = metricExplorerPageStore.state;

const filtersPopperRef = ref<any|null>(null);
const { height: filtersPopperHeight } = useElementSize(filtersPopperRef);

const state = reactive({
    filtersPopoverVisible: false,
    granularity: undefined as Granularity|undefined,
    selectedFiltersCount: 0,
    selectedPeriodLabel: '',
});

/* event */
const handleClickFilter = () => {
    state.filtersPopoverVisible = !state.filtersPopoverVisible;
};
const handleClickRefresh = () => {
    metricExplorerPageStore.setRefreshMetricData(true);
};
</script>

<template>
    <div class="metric-explorer-query-section">
        <div class="filter-wrapper"
             :style="{ 'margin-bottom': `${filtersPopperHeight ? filtersPopperHeight+40 + 16: 16}px` }"
        >
            <div class="left-part">
                <metric-explorer-operator-dropdown />
                <metric-explorer-granularity-dropdown />
                <metric-explorer-period-dropdown :selected-period-label.sync="state.selectedPeriodLabel" />
                <p-popover :is-visible.sync="state.filtersPopoverVisible"
                           :class="{ 'open': state.filtersPopoverVisible }"
                           ignore-outside-click
                           trigger="click"
                           relative-style
                           position="bottom-start"
                           class="filters-popover"
                >
                    <p-button style-type="tertiary"
                              class="filters-button"
                              icon-left="ic_filter"
                              @click="handleClickFilter"
                    >
                        {{ $t('INVENTORY.METRIC_EXPLORER.FILTERS') }}
                        <p-badge v-if="state.selectedFiltersCount"
                                 badge-type="subtle"
                                 :style-type="state.filtersPopoverVisible ? 'gray100' : 'gray200'"
                                 class="filters-badge"
                        >
                            {{ state.selectedFiltersCount }}
                        </p-badge>
                    </p-button>
                    <template #content>
                        <metric-explorer-filters-popper ref="filtersPopperRef"
                                                        :visible="state.filtersPopoverVisible"
                        />
                    </template>
                </p-popover>
            </div>
            <div class="right-part">
                <span class="period-label-text">{{ state.selectedPeriodLabel }}</span>
                <p-icon-button name="ic_renew"
                               style-type="tertiary"
                               shape="square"
                               :disabled="metricExplorerPageState.refreshMetricData"
                               @click="handleClickRefresh"
                />
            </div>
        </div>
    </div>
</template>

<style lang="postcss" scoped>
.metric-explorer-query-section {
    margin-top: 1.5rem;
    .filter-wrapper {
        @apply relative flex items-center justify-between;
        font-size: 0.875rem;
        .left-part {
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        .right-part {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            .period-label-text {
                @apply text-label-md text-gray-700;
            }
        }
        .filters-button {
            .filters-badge {
                margin-left: 0.25rem;
            }
        }

        /* custom design-system component - p-popover */
        :deep(.p-popover) {
            &.open {
                .p-button.filters-button {
                    @apply bg-gray-200;
                }
            }
            .popper {
                width: 100%;
                max-width: 100%;
                left: 2rem;
                transform: translate(0, 3rem) !important;
                .arrow {
                    left: 1.25rem !important;
                }
            }
        }
    }
}
</style>
