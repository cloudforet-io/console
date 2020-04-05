<template>
    <p-widget-layout class="summary" :title="title" :padding="false">
        <router-link class="count" :to="to" :style="{
            color: color,
        }">
            {{ count | numbers }}
        </router-link>
        <p-dynamic-chart class="line-chart" :dataset="dataset" :loading="loading"
                         type="line"
                         :theme-props="themeProps"
        />
    </p-widget-layout>
</template>

<script lang="ts">
import { computed, defineComponent } from '@vue/composition-api';
import numeral from 'numeral';
import {
    serviceSummaryProps,
    ServiceSummaryPropsType,
} from '@/views/common/widgets/service-summary/ServiceSummary.toolset';
import PWidgetLayout from '@/components/organisms/layouts/widget-layout/WidgetLayout.vue'
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
    components: { PWidgetLayout, PDynamicChart },
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
    min-width: 216px;
    max-width: 446px;
}
.count {
    display: inline-block;
    line-height: 2.5rem;
    font-size: 2.5rem;
    font-weight: bold;
    margin-left: 1.5rem;
    border-bottom-width: 1px;
    border-color: transparent;
    &:hover {
        border-color: currentColor;
    }
}
.line-chart {
    height: 100px;
}
</style>
