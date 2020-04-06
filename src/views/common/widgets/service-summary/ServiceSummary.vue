<template>
    <p-pane-layout class="summary">
        <p class="title">
            {{ title }}
        </p>
        <router-link class="count" :to="to">
            {{ count }}
        </router-link>
        <p-line-chart class="line-chart" :dataset="data" :loading="loading"
                      :gradient-height="100" :colors="[color]"
        />
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
.summary {
    display: inline-flex;
    flex-direction: column;
    min-width: 216px;
    width: 100%;
    max-width: 446px;
    .title {
        font-size: 1.125rem;
        text-transform: uppercase;
        font-weight: bold;
        margin-top: 1.625rem;
        margin-left: 1.5rem;
    }
    .count {
        font-size: 2.5rem;
        line-height: 2.5rem;
        font-weight: bold;
        margin-top: 1rem;
        margin-left: 1.5rem;
    }
    .line-chart {
        height: 100px;
    }
}
</style>
