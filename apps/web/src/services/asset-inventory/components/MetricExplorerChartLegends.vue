<script lang="ts" setup>
import {
    computed, defineEmits, reactive, watch,
} from 'vue';

import {
    PTextButton, PSelectDropdown, PStatus, PDataLoader,
} from '@spaceone/design-system';
import { cloneDeep } from 'lodash';

import { useProxyValue } from '@/common/composables/proxy-state';

import { BASIC_CHART_COLORS, MASSIVE_CHART_COLORS, DISABLED_LEGEND_COLOR } from '@/styles/colorsets';

import { CHART_TYPE } from '@/services/asset-inventory/constants/metric-explorer-constant';
import { useMetricExplorerPageStore } from '@/services/asset-inventory/stores/metric-explorer-page-store';
import type { Legend } from '@/services/asset-inventory/types/metric-explorer-type';


interface Props {
    loading: boolean;
    legends: Legend[];
    more?: boolean;
}
const props = withDefaults(defineProps<Props>(), {
    loading: false,
    more: false,
});
const emit = defineEmits<{(e: 'toggle-series', index: number): void;
    (e: 'hide-all-series'): void;
    (e: 'show-all-series'): void;
}>();

const metricExplorerPageStore = useMetricExplorerPageStore();
const metricExplorerPageState = metricExplorerPageStore.state;
const metricExplorerPageGetters = metricExplorerPageStore.getters;

const state = reactive({
    proxyLegends: useProxyValue('legends', props, emit),
    showHideAll: computed(() => props.legends.some((legend) => !legend.disabled)),
    disableLegendToggle: computed<boolean>(() => [CHART_TYPE.TREEMAP, CHART_TYPE.COLUMN].includes(metricExplorerPageState.selectedChartType)),
    chartGroupByMenuItems: computed(() => metricExplorerPageGetters.refinedMetricLabelKeys
        .filter((d) => metricExplorerPageState.selectedGroupByList.includes(d.key))
        .map((d) => ({ name: d.key, label: d.name }))),
});

/* Util */
const getLegendIconColor = (index) => {
    const legend = props.legends[index];
    if (legend?.disabled) return DISABLED_LEGEND_COLOR;
    if (legend?.color) return legend.color;
    if (props.legends.length <= BASIC_CHART_COLORS.length) return BASIC_CHART_COLORS[index % BASIC_CHART_COLORS.length];
    return MASSIVE_CHART_COLORS[index];
};
const getLegendTextColor = (index) => {
    const legend = props.legends[index];
    if (legend?.disabled) return DISABLED_LEGEND_COLOR;
    return null;
};

/* Event */
const handleToggleSeries = (index) => {
    if (state.disableLegendToggle) return;
    const _legends = cloneDeep(props.legends);
    _legends[index].disabled = !_legends[index]?.disabled;
    state.proxyLegends = _legends;
    emit('toggle-series', index);
};
const handleToggleAllLegends = () => {
    const _legends = cloneDeep(props.legends);
    if (state.showHideAll) {
        _legends.forEach((d) => {
            d.disabled = true;
        });
        emit('hide-all-series');
    } else {
        _legends.forEach((d) => {
            d.disabled = false;
        });
        emit('show-all-series');
    }
    state.proxyLegends = _legends;
};
const handleChartGroupByItem = (groupBy?: string) => {
    metricExplorerPageStore.setSelectedChartGroupBy(groupBy);
};

/* Watcher */
watch(() => metricExplorerPageState.selectedGroupByList, (after) => {
    if (!after.length) {
        metricExplorerPageStore.setSelectedChartGroupBy(undefined);
    } else if (!after.filter((d) => d === metricExplorerPageState.selectedChartGroupBy).length) {
        metricExplorerPageStore.setSelectedChartGroupBy(after[0]);
    }
});
</script>

<template>
    <div class="metric-explorer-chart-legends">
        <p-select-dropdown :menu="state.chartGroupByMenuItems"
                           :selected="metricExplorerPageState.selectedChartGroupBy"
                           :disabled="!metricExplorerPageState.selectedGroupByList.length"
                           class="group-by-select-dropdown"
                           @select="handleChartGroupByItem"
        />
        <p-data-loader :loading="loading"
                       :data="legends"
                       class="legend-wrapper"
        >
            <p v-if="props.more"
               class="too-many-text"
            >
                {{ $t('INVENTORY.METRIC_EXPLORER.SHOWING_TOP_15') }}
            </p>
            <div v-for="(legend, idx) in legends"
                 :key="`legend-${legend.name}-${idx}`"
                 class="legend"
                 :class="{ 'disable-toggle' : state.disableLegendToggle }"
                 @click="handleToggleSeries(idx)"
            >
                <p-status :text="legend.label"
                          :icon-color="getLegendIconColor(idx)"
                          :text-color="getLegendTextColor(idx)"
                />
            </div>
            <template #no-data>
                <span class="text-paragraph-md">{{ $t('INVENTORY.METRIC_EXPLORER.NO_ITEMS') }}</span>
            </template>
        </p-data-loader>
        <p-text-button size="md"
                       :disabled="!legends.length || state.disableLegendToggle"
                       @click="handleToggleAllLegends"
        >
            {{ state.showHideAll ? $t('INVENTORY.METRIC_EXPLORER.HIDE_ALL') : $t('INVENTORY.METRIC_EXPLORER.SHOW_ALL') }}
        </p-text-button>
    </div>
</template>

<style lang="postcss" scoped>
.metric-explorer-chart-legends {
    .group-by-select-dropdown {
        width: 100%;
        margin-bottom: 0.5rem;
    }
    .legend-wrapper {
        height: 23.5rem;
        overflow-y: auto;
        padding: 0.5rem 0;

        .too-many-text {
            @apply text-gray-400;
            font-size: 0.75rem;
            padding: 0 0.5rem 0.5rem 0.5rem;
        }
        .legend {
            height: 1.5rem;
            display: flex;
            align-items: center;
            font-size: 0.875rem;
            cursor: pointer;
            padding: 0 0.5rem;

            &:hover {
                @apply bg-gray-100;
            }
            &.disabled {
                @apply text-gray-300;
            }
            &.disable-toggle {
                cursor: default;
            }

            /* custom design-system component - p-status */
            :deep(.p-status) {
                .text {
                    white-space: nowrap;
                }
            }
        }
    }
}

/* custom design-system component - p-data-loader */
:deep(.p-data-loader) {
    .no-data-wrapper {
        max-height: 19.25rem;
    }
}
</style>
