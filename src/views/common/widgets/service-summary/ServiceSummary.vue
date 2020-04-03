<template>
    <p-pane-layout>
        <p class="title">
            {{ title }}
        </p>
        <router-link class="count" :to="to" />
    </p-pane-layout>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api';
import { serviceSummaryProps } from '@/views/common/widgets/service-summary/ServiceSummary.toolset';
import PPaneLayout from '@/components/molecules/layouts/pane-layout/PaneLayout.vue';
import PLineChart from '@/components/organisms/charts/line-chart/LineChart.vue';

export default defineComponent({
    name: 'ServiceSummary',
    components: { PPaneLayout, PLineChart },
    props: serviceSummaryProps,
    setup() {
        return {};
    },
});
</script>

<style lang="postcss" scoped>

</style>
