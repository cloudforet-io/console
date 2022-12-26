<template>
    <widget-frame :title="state.title"
                  :size="state.size"
                  :width="props.width"
                  :error-mode="false"
    >
        <div class="cost-map">
            <div class="chart-wrapper">
                <p-data-loader class="chart-loader"
                               :loading="state.loading"
                               :data="state.data"
                               loader-type="skeleton"
                >
                    <div ref="chartContext"
                         class="chart"
                    />
                </p-data-loader>
            </div>
        </div>
    </widget-frame>
</template>

<script setup lang="ts">
import {
    computed,
    defineExpose,
    defineProps, nextTick, reactive, ref, toRefs,
} from 'vue';

// import { color } from '@amcharts/amcharts5';
import { PDataLoader } from '@spaceone/design-system';
import { random, range } from 'lodash';

import { useAmcharts5 } from '@/common/composables/amcharts5';
import { setTreemapLabelText } from '@/common/composables/amcharts5/tree-map-helper';

// import { palette } from '@/styles/colors';

import WidgetFrame from '@/services/dashboards/widgets/_components/WidgetFrame.vue';
import type { WidgetProps } from '@/services/dashboards/widgets/config';
import { GROUP_BY } from '@/services/dashboards/widgets/config';
import { useWidgetLifecycle } from '@/services/dashboards/widgets/use-widget-lifecycle';
// eslint-disable-next-line import/no-cycle
import { useWidgetState } from '@/services/dashboards/widgets/use-widget-state';
// import type { WidgetTheme } from '@/services/dashboards/widgets/view-config';

const SAMPLE_RAW_DATA = [{
    name: 'Root',
    value: 'Root',
    children: range(10).map((d) => ({
        project_id: `Project ${d + 1}`,
        value: random(100, 1000),
    })),
}];

const VALUE_FIELD_NAME = 'value';
const CATEGORY_FIELD_NAME = GROUP_BY.PROJECT;

const props = defineProps<WidgetProps>();

const chartContext = ref<HTMLElement | null>(null);
const {
    createTreeMapSeries,
    setChartColors,
    createTooltip, setTreemapTooltipText,
    disposeRoot, refreshRoot,
} = useAmcharts5(chartContext);

const state = reactive({
    ...toRefs(useWidgetState(props)),
    chartData: computed(() => {
        if (!state.data) return [];
        return state.data;
    }),
});

/* Api */
const fetchData = async () => new Promise((resolve) => {
    setTimeout(() => {
        resolve(SAMPLE_RAW_DATA);
    }, 1000);
});

const drawChart = (chartData) => {
    const seriesSettings = {
        valueField: VALUE_FIELD_NAME,
        categoryField: CATEGORY_FIELD_NAME,
        nodePaddingInner: 4,
    };
    const series = createTreeMapSeries(seriesSettings);
    series.rectangles.template.setAll({
        strokeWidth: 1,
    });

    setChartColors(series, state.colorSet);
    // Todo: add gradient background color
    // const themeColorName: WidgetTheme = props.theme ? props.theme : 'violet';
    // series.rectangles.template.adapters.add('fill', (value, target) => {
    //     const dataItem = target.dataItem;
    //     if (dataItem?.dataContext?.[VALUE_FIELD_NAME] === 'Root') {
    //         return color(palette.white);
    //     }
    //     if (dataItem?.dataContext?.[CATEGORY_FIELD_NAME]) {
    //         return color(palette[themeColorName][400]);
    //     }
    //     return color(palette[themeColorName][400]);
    // });

    const tooltip = createTooltip();
    series.set('tooltip', tooltip);
    setTreemapTooltipText(series, tooltip, state.options.currency, props.currencyRates);

    setTreemapLabelText(series);

    series.data.setAll(chartData);
};

const initWidget = async () => {
    state.loading = true;
    state.data = await fetchData();
    await nextTick();
    drawChart(state.data);
    state.loading = false;
};

const refreshWidget = async () => {
    state.loading = true;
    state.data = await fetchData();
    await nextTick();
    refreshRoot();
    drawChart(state.chartData);
    state.loading = false;
};

useWidgetLifecycle({
    disposeWidget: disposeRoot,
});

defineExpose({
    initWidget,
    refreshWidget,
});
</script>
<style lang="postcss" scoped>
.cost-map {
    padding: 0 1.25rem 1.25rem;
}

.chart-wrapper {
    @apply relative;
    width: 100%;
    height: 378px;

    .chart {
        height: 100%;
    }
}

.chart-loader {
    height: 100%;
}
</style>
