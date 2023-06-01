<template>
    <widget-frame v-bind="widgetFrameProps"
                  class="severity-status-by-service"
                  @refresh="refreshWidget"
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
                <div v-for="status in SEVERITY_STATUS_MAP_VALUES"
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
    computed, defineExpose, defineProps, reactive, toRefs,
} from 'vue';

import dayjs from 'dayjs';

import type { DateRange } from '@/services/dashboards/config';
import WidgetFrame from '@/services/dashboards/widgets/_components/WidgetFrame.vue';
import type { WidgetProps, WidgetExpose } from '@/services/dashboards/widgets/_configs/config';
import { SEVERITY_STATUS_MAP } from '@/services/dashboards/widgets/_configs/view-config';
import { useWidgetFrameProps } from '@/services/dashboards/widgets/_hooks/use-widget-frame-props';
// eslint-disable-next-line import/no-cycle
import { useWidgetLifecycle } from '@/services/dashboards/widgets/_hooks/use-widget-lifecycle';
// eslint-disable-next-line import/no-cycle
import { useWidgetState } from '@/services/dashboards/widgets/_hooks/use-widget-state';


const DATE_FORMAT = 'YYYY-MM';
const SEVERITY_STATUS_MAP_VALUES = Object.values(SEVERITY_STATUS_MAP);
const props = defineProps<WidgetProps>();
const state = reactive({
    ...toRefs(useWidgetState(props)),
    dateRange: computed<DateRange>(() => ({
        start: dayjs.utc(state.settings?.date_range?.start).format(DATE_FORMAT),
        end: dayjs.utc(state.settings?.date_range?.end).format(DATE_FORMAT),
    })),
    sampleData: computed(() => [...Array(20)].map(() => Object.values(SEVERITY_STATUS_MAP)[Math.floor(Math.random() * 5)])),
    boxWidth: computed<number>(() => {
        if (!props.width) return 112;
        const widgetPadding = 24;
        const widgetContentWidth = props.width - (widgetPadding * 2);
        if (props.width >= 990) return widgetContentWidth / 8;
        return widgetContentWidth / 7;
    }),
});
const widgetFrameProps:ComputedRef = useWidgetFrameProps(props, state);

const fetchData = async () => {
    //
};
const initWidget = async () => {
    state.loading = true;
    state.data = await fetchData();
    state.loading = false;
    return state.data;
};
const refreshWidget = async () => {
    state.loading = true;
    state.data = await fetchData();
    state.loading = false;
    return state.data;
};

useWidgetLifecycle({
    disposeWidget: undefined,
    refreshWidget,
    props,
    state,
});
defineExpose<WidgetExpose>({
    initWidget,
    refreshWidget,
});
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
