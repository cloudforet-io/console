<script setup lang="ts">
import WidgetFrame from '@/common/modules/widgets/_components/WidgetFrame.vue';
import { useWidgetFrame } from '@/common/modules/widgets/_composables/use-widget/use-widget-frame';
import type {
    WidgetProps, WidgetEmit,
} from '@/common/modules/widgets/types/widget-display-type';


const props = defineProps<WidgetProps>();
const emit = defineEmits<WidgetEmit>();

const { widgetFrameProps, widgetFrameEventHandlers } = useWidgetFrame(props, emit);

// const state = reactive({
//     loading: false,
//     data: null as Response | null,
// });
</script>

<template>
    <widget-frame v-bind="widgetFrameProps"
                  v-on="widgetFrameEventHandlers"
    >
        <div class="chart">
            Progress Card
        </div>
    </widget-frame>
</template>

<style lang="postcss" scoped>
.chart {
    height: 100%;
}
</style>
