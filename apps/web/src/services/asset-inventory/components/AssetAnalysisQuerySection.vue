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

import AssetAnalysisFiltersPopper from '@/services/asset-inventory/components/AssetAnalysisFiltersPopper.vue';
import AssetAnalysisGranularityDropdown from '@/services/asset-inventory/components/AssetAnalysisGranularityDropdown.vue';
import AssetAnalysisOperatorDropdown from '@/services/asset-inventory/components/AssetAnalysisOperatorDropdown.vue';
import AssetAnalysisPeriodDropdown from '@/services/asset-inventory/components/AssetAnalysisPeriodDropdown.vue';
import { useAssetAnalysisPageStore } from '@/services/asset-inventory/stores/asset-analysis-page-store';
import type { Granularity } from '@/services/asset-inventory/types/asset-analysis-type';


const route = useRoute();
const assetAnalysisPageStore = useAssetAnalysisPageStore();
const assetAnalysisPageState = assetAnalysisPageStore.state;

const filtersPopperRef = ref<any|null>(null);
const { height: filtersPopperHeight } = useElementSize(filtersPopperRef);

const state = reactive({
    currentMetricId: computed<string>(() => route.params.metricId),
    filtersPopoverVisible: false,
    granularity: undefined as Granularity|undefined,
    selectedFiltersCount: computed(() => {
        let count = 0;
        Object.values(assetAnalysisPageState.filters ?? {}).forEach((filterItems) => {
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
        await runMetric();
        assetAnalysisPageStore.setRefreshMetricData(true);
    } catch (e) {
        ErrorHandler.handleError(e);
    }
};

/* watch */
watch(() => route.params, async () => {
    state.filtersPopoverVisible = false;
});
</script>

<template>
    <div class="asset-analysis-query-section">
        <div class="filter-wrapper"
             :style="{ 'margin-bottom': `${filtersPopperHeight ? filtersPopperHeight+40 + 16: 16}px` }"
        >
            <div class="left-part">
                <asset-analysis-operator-dropdown />
                <asset-analysis-granularity-dropdown />
                <asset-analysis-period-dropdown />
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
                        {{ $t('INVENTORY.ASSET_ANALYSIS.FILTERS') }}
                        <p-badge v-if="state.selectedFiltersCount"
                                 badge-type="subtle"
                                 :style-type="state.filtersPopoverVisible ? 'gray100' : 'gray200'"
                                 class="filters-badge"
                        >
                            {{ state.selectedFiltersCount }}
                        </p-badge>
                    </p-button>
                    <template #content>
                        <asset-analysis-filters-popper ref="filtersPopperRef"
                                                       :visible="state.filtersPopoverVisible"
                        />
                    </template>
                </p-popover>
            </div>
            <div class="right-part">
                <span class="period-text">
                    {{ assetAnalysisPageState.periodText }}
                </span>
                <p-tooltip :contents="$t('INVENTORY.ASSET_ANALYSIS.UPDATE_WITH_THE_LATEST_DATA')"
                           position="bottom"
                >
                    <p-icon-button style-type="secondary"
                                   name="ic_renew"
                                   shape="squre"
                                   :disabled="assetAnalysisPageState.refreshMetricData"
                                   @click="handleClickRun"
                    />
                </p-tooltip>
            </div>
        </div>
    </div>
</template>

<style lang="postcss" scoped>
.asset-analysis-query-section {
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
