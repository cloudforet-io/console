<script lang="ts" setup>
import {
    useElementSize,
} from '@vueuse/core';
import {
    computed, reactive, ref, watch,
} from 'vue';
import { useRoute } from 'vue-router/composables';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PButton, PPopover, PBadge, PTooltip, PIconButton,
} from '@cloudforet/mirinae';


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
                           boundary=".metric-explorer-query-section"
                           width="100%"
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
    position: relative;
    margin-top: 1.5rem;

    .filter-wrapper {
        @apply relative flex justify-between;
        align-items: flex-start;
        font-size: 0.875rem;
        gap: 0.5rem;
        .left-part {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            flex-wrap: wrap;
        }
        .right-part {
            display: flex;
            align-items: center;
            justify-content: flex-end;
            gap: 0.5rem;
            flex-wrap: wrap;
            flex-shrink: 0;
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
    }
}
</style>
