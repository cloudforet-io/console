<template>
    <widget-frame :title="state.title"
                  :size="state.size"
                  :width="props.width"
    >
        <!-- TODO: implementation -->
    </widget-frame>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';

import WidgetFrame from '@/services/dashboards/widgets/_components/WidgetFrame.vue';
import type { WidgetProps } from '@/services/dashboards/widgets/config';
// eslint-disable-next-line import/no-cycle
import { useWidgetData } from '@/services/dashboards/widgets/use-widget-data';

const props = defineProps<WidgetProps>();
const state = useWidgetData(props);
</script>
