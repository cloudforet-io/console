<template>
    <p-pane-layout class="summary">
        <p class="title">
            {{ title }}
        </p>
        <router-link class="count" :to="to" :style="{color: color}">
            {{ count | numbers }}
        </router-link>
        <p-dynamic-chart class="line-chart" :dataset="dataset" :loading="loading"
                         type="line"
                         :theme-props="themeProps"
        />
    </p-pane-layout>
</template>

<script lang="ts">
import { computed, defineComponent } from '@vue/composition-api';
import numeral from 'numeral';
import {
    serviceSummaryProps,
    ServiceSummaryPropsType,
} from '@/views/common/widgets/service-summary/ServiceSummary.toolset';
import PPaneLayout from '@/components/molecules/layouts/pane-layout/PaneLayout.vue';
import PDynamicChart from '@/components/organisms/charts/dynamic-chart/DynamicChart.vue';
import { lineDefaultThemeProps } from '@/components/organisms/charts/dynamic-chart/themes/line-chart';
import { ChartData } from '@/components/organisms/charts/dynamic-chart/DynamicChart.toolset';

export default defineComponent({
    name: 'ServiceSummary',
    filters: {
        numbers(val) {
            return val < 1000 ? val : numeral(val).format('0.0a');
        },
    },
    components: { PPaneLayout, PDynamicChart },
    props: serviceSummaryProps,
    setup(props: ServiceSummaryPropsType) {
        return {
            themeProps: computed(() => ({
                ...lineDefaultThemeProps,
                colors: [props.color],
            })),
            count: computed(() => props.data[props.data.length - 1]),
            dataset: computed(() => [new ChartData(props.title, props.data)]),
        };
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
        font-family: theme('fontFamily.sans');
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
