<script lang="ts" setup>
import { reactive } from 'vue';

import { cloneDeep } from 'lodash';

import getRandomId from '@/lib/random-id-generator';

import { useProxyValue } from '@/common/composables/proxy-state';
import type { WidgetLegend } from '@/common/modules/widgets/types/widget-legend-typs';

import { gray } from '@/styles/colors';



const RANDOM_ID = getRandomId();
interface Props {
    legendList: WidgetLegend[];
    disableToggle?: boolean;
}
const props = defineProps<Props>();
const emit = defineEmits<{(e: 'update:legend-list', legendList: WidgetLegend[]): void}>();
const state = reactive({
    proxyLegendList: useProxyValue<WidgetLegend[]>('legendList', props, emit),
});


/* Event */
const handleToggleLegend = (legend: WidgetLegend) => {
    if (props.disableToggle) return;

    const _legendList = cloneDeep(state.proxyLegendList);
    const _legend = _legendList.find((l) => l.name === legend.name);
    if (!_legend) return;
    _legend.disabled = !_legend.disabled;
    state.proxyLegendList = [..._legendList];
};
</script>

<template>
    <div class="widget-custom-legend">
        <div v-for="legend in state.proxyLegendList"
             :key="`${RANDOM_ID}-${legend.name}`"
             class="widget-legend"
             :class="{ 'disabled': legend.disabled, 'disable-toggle': props.disableToggle }"
             @click="handleToggleLegend(legend)"
        >
            <span class="legend-circle"
                  :style="{ backgroundColor: legend.disabled ? gray[200] : legend.color }"
            />
            <span class="legend-text">{{ legend.name }}</span>
        </div>
    </div>
</template>

<style lang="postcss" scoped>
.widget-custom-legend {
    width: 100%;
    display: flex;
    gap: 1rem;
    overflow-x: auto;
    box-sizing: border-box;
    padding: 0 1rem 1rem 1rem;
    .widget-legend {
        display: flex;
        align-items: center;
        gap: 0.25rem;
        cursor: pointer;
        .legend-circle {
            @apply rounded-full;
            display: inline-flex;
            width: 0.625rem;
            height: 0.625rem;
        }
        .legend-text {
            @apply text-label-sm text-gray-900;
        }
        &.disabled {
            .legend-text {
                @apply text-gray-500;
            }
        }
        &.disable-toggle {
            cursor: default;
        }
    }
}
</style>
