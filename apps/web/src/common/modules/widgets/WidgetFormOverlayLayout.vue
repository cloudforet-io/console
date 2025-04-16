<script setup lang="ts">
import { watch } from 'vue';

import type { DashboardModel } from '@/api-clients/dashboard/_types/dashboard-type';

import WidgetFormOverlay from '@/common/modules/widgets/_components/WidgetFormOverlay.vue';
import { useWidgetContextStore } from '@/common/modules/widgets/_store/widget-context-store';

interface Props {
    dashboard?: DashboardModel;
}

const props = defineProps<Props>();

const widgetContextStore = useWidgetContextStore();


watch(() => props.dashboard, (dashboard) => {
    widgetContextStore.setDashboard(dashboard);
}, { immediate: true, deep: true });

</script>

<template>
    <widget-form-overlay />
</template>
