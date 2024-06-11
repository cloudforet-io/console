<script setup lang="ts">
import {
    reactive,
} from 'vue';

import {
    PDataLoader,
} from '@spaceone/design-system';

import type { ListResponse } from '@/schema/_common/api-verbs/list';

import WidgetFrame from '@/common/modules/widgets/_components/WidgetFrame.vue';
import { useWidgetFrame } from '@/common/modules/widgets/_composables/use-widget/use-widget-frame';
import type {
    WidgetProps, WidgetEmit,
} from '@/common/modules/widgets/types/widget-display-type';


type Data = ListResponse<{
    [key: string]: string|number;
}>;

const props = defineProps<WidgetProps<Data>>();
const emit = defineEmits<WidgetEmit>();

const { widgetFrameProps, widgetFrameEventHandlers } = useWidgetFrame(props, emit);

const state = reactive({
    loading: false,
    data: null as Data | null,
});
</script>

<template>
    <widget-frame v-bind="widgetFrameProps"
                  v-on="widgetFrameEventHandlers"
    >
        <p-data-loader class="chart-loader"
                       :loading="state.loading"
                       loader-type="skeleton"
                       disable-empty-case
                       :loader-backdrop-opacity="1"
                       show-data-from-scratch
        >
            <div class="chart">
                Table
            </div>
        </p-data-loader>
    </widget-frame>
</template>

<style lang="postcss" scoped>
.chart-loader {
    height: 100%;
    .chart {
        height: 100%;
    }
}
</style>
