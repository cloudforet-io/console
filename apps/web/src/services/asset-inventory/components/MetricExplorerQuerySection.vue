<script lang="ts" setup>
import {
    useElementSize,
} from '@vueuse/core';
import {
    computed, reactive, ref, watch,
} from 'vue';
import { useRoute } from 'vue-router/composables';

import {
    PButton, PPopover, PBadge, PTooltip, PIconButton,
} from '@spaceone/design-system';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { MetricRunParameters } from '@/schema/inventory/metric/api-verbs/run';

import ErrorHandler from '@/common/composables/error/errorHandler';

import MetricExplorerFiltersPopper from '@/services/asset-inventory/components/MetricExplorerFiltersPopper.vue';
import MetricExplorerGranularityDropdown from '@/services/asset-inventory/components/MetricExplorerGranularityDropdown.vue';
import MetricExplorerOperatorDropdown from '@/services/asset-inventory/components/MetricExplorerOperatorDropdown.vue';
import MetricExplorerPeriodDropdown from '@/services/asset-inventory/components/MetricExplorerPeriodDropdown.vue';
import { useMetricExplorerPageStore } from '@/services/asset-inventory/stores/metric-explorer-page-store';
import type { Granularity } from '@/services/asset-inventory/types/asset-analysis-type';


const route = useRoute();
const metricExplorerPageStore = useMetricExplorerPageStore();
const metricExplorerPageState = metricExplorerPageStore.state;

const filtersPopperRef = ref<any|null>(null);
const { height: filtersPopperHeight } = useElementSize(filtersPopperRef);

const state = reactive({
    currentMetricId: computed<string>(() => route.params.metricId),
    refreshing: false,
    filtersPopoverVisible: false,
    granularity: undefined as Granularity|undefined,
    selectedFiltersCount: computed(() => {
        let count = 0;
        Object.values(metricExplorerPageState.filters ?? {}).forEach((filterItems) => {
            count += filterItems.length;
        });
        return count;
    }),
});

/* Api */
const runMetric = async () => {
    await SpaceConnector.clientV2.inventory.metric.run<MetricRunParameters>({
        metric_id: state.currentMetricId,
    });
};

/* Event */
const handleClickFilter = () => {
    state.filtersPopoverVisible = !state.filtersPopoverVisible;
};
const handleClickRun = async () => {
    try {
        state.refreshing = true;
        await runMetric();
        metricExplorerPageStore.setRefreshMetricData(true);
    } catch (e) {
        ErrorHandler.handleError(e);
    } finally {
        state.refreshing = false;
    }
};

/* watch */
watch(() => route.params, async () => {
    state.filtersPopoverVisible = false;
});
</script>

<template>
    <div class="metric-explorer-query-section">
        <div class="filter-wrapper"
             :style="{ 'margin-bottom': `${filtersPopperHeight ? filtersPopperHeight+40 + 16: 16}px` }"
        >
            <div class="left-part">
                <metric-explorer-operator-dropdown />
                <metric-explorer-granularity-dropdown />
                <metric-explorer-period-dropdown />
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
                <span class="period-text">
                    {{ metricExplorerPageState.periodText }}
                </span>
                <p-tooltip :contents="$t('INVENTORY.METRIC_EXPLORER.UPDATE_WITH_THE_LATEST_DATA')"
                           position="bottom"
                >
                    <p-icon-button style-type="secondary"
                                   name="ic_renew"
                                   shape="square"
                                   :disabled="state.refreshing"
                                   @click="handleClickRun"
                    />
                </p-tooltip>
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
            .period-text {
                @apply text-label-md text-gray-700;
                font-weight: 400;
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
