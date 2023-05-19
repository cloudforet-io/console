<template>
    <widget-frame v-bind="widgetFrameProps"
                  class="severity-status-by-service"
    >
        <div class="data-container">
            <div class="chart-wrapper"
                 :style="{'grid-template-columns': `repeat(auto-fill, ${state.boxWidth-4}px)`}"
            >
                <div v-for="(data, idx) in state.sampleData"
                     :key="`box-${idx}`"
                     class="status-box"
                     :style="{'background-color': data.color}"
                >
                    <span class="text">{{ data.label }}</span>
                </div>
            </div>
            <div class="legend-wrapper">
                <div v-for="status in Object.values(SEVERITY_STATUS)"
                     :key="`status-${status.label}`"
                     class="legend"
                >
                    <div class="circle"
                         :style="{ 'background-color': status.color }"
                    />
                    <div class="text">
                        {{ status.label }}
                    </div>
                </div>
            </div>
        </div>
    </widget-frame>
</template>
<script setup lang="ts">
import type { ComputedRef } from 'vue';
import {
    computed, defineProps, reactive, toRefs,
} from 'vue';

import { green, red } from '@/styles/colors';

import WidgetFrame from '@/services/dashboards/widgets/_components/WidgetFrame.vue';
import type { WidgetProps } from '@/services/dashboards/widgets/_configs/config';
import { useWidgetFrameProps } from '@/services/dashboards/widgets/_hooks/use-widget-frame-props';
// eslint-disable-next-line import/no-cycle
import { useWidgetState } from '@/services/dashboards/widgets/_hooks/use-widget-state';

const SEVERITY_STATUS = {
    CRITICAL: { label: 'Critical', color: red[400] },
    HIGH: { label: 'High', color: red[300] },
    MEDIUM: { label: 'Medium', color: red[200] },
    LOW: { label: 'Low', color: red[100] },
    PASS: { label: 'Pass', color: green[500] },
};
const props = defineProps<WidgetProps>();
const state = reactive({
    ...toRefs(useWidgetState(props)),
    sampleData: computed(() => [...Array(20)].map(() => Object.values(SEVERITY_STATUS)[Math.floor(Math.random() * 5)])),
    boxWidth: computed<number>(() => {
        if (!props.width) return 112;
        const widgetPadding = 24;
        const widgetContentWidth = props.width - (widgetPadding * 2);
        if (props.width >= 990) return widgetContentWidth / 8;
        return widgetContentWidth / 7;
    }),
});
const widgetFrameProps:ComputedRef = useWidgetFrameProps(props, state);
</script>
<style lang="postcss" scoped>
.severity-status-by-service {
    .data-container {
        .chart-wrapper {
            display: grid;
            grid-auto-flow: row;
            gap: 0.25rem;
            .status-box {
                height: 4.5rem;
                font-weight: 500;
                padding: 0.5rem;
            }
        }
        .legend-wrapper {
            @apply text-gray-700 text-label-sm;
            display: flex;
            gap: 0.5rem;
            padding-top: 1rem;
            padding-bottom: 1.5rem;
            .legend {
                display: inline-flex;
                align-items: center;
            }
            .circle {
                @apply rounded-xl;
                width: 0.625rem;
                height: 0.625rem;
                margin-right: 0.25rem;
            }
        }
    }
}
</style>
