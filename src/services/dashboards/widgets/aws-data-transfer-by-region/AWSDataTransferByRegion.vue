<template>
    <widget-frame v-bind="widgetFrameProps"
                  class="aws-data-transfer-by-region"
                  @refresh="refreshWidget"
    >
        <template #header-right>
            <widget-frame-header-dropdown :items="state.selectorItems"
                                          :selected="state.selectedSelectorType"
                                          @select="handleSelectSelectorType"
            />
        </template>
        <div class="content-wrapper">
            <p-data-loader class="chart-loader"
                           :loading="state.loading"
                           :data="state.data"
                           loader-type="skeleton"
                           show-data-from-scratch
            >
                <div ref="chartContext"
                     class="chart"
                />
            </p-data-loader>
            <widget-data-table :loading="state.loading"
                               :fields="state.tableFields"
                               :items="state.data?.results"
                               :currency="state.currency"
                               :currency-rates="props.currencyRates"
                               :all-reference-type-info="props.allReferenceTypeInfo"
                               :this-page="state.thisPage"
                               :show-next-page="state.data?.more"
                               @update:thisPage="handleUpdateThisPage"
            />
        </div>
    </widget-frame>
</template>

<script setup lang="ts">
import type { ComputedRef } from 'vue';
import {
    computed, defineExpose, defineProps, nextTick, reactive, ref, toRefs,
} from 'vue';

import type { Circle } from '@amcharts/amcharts5';
import { Template } from '@amcharts/amcharts5';
import { PDataLoader } from '@spaceone/design-system';
import dayjs from 'dayjs';

import { getPageStart } from '@cloudforet/core-lib/component-util/pagination';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import { useAmcharts5 } from '@/common/composables/amcharts5';
import ErrorHandler from '@/common/composables/error/errorHandler';

import type { DateRange } from '@/services/dashboards/config';
import type { Field } from '@/services/dashboards/widgets/_components/type';
import WidgetDataTable from '@/services/dashboards/widgets/_components/WidgetDataTable.vue';
import WidgetFrame from '@/services/dashboards/widgets/_components/WidgetFrame.vue';
import WidgetFrameHeaderDropdown from '@/services/dashboards/widgets/_components/WidgetFrameHeaderDropdown.vue';
import type { WidgetExpose, WidgetProps } from '@/services/dashboards/widgets/_configs/config';
import { GROUP_BY_ITEM_MAP } from '@/services/dashboards/widgets/_configs/view-config';
import { sortTableData } from '@/services/dashboards/widgets/_helpers/widget-table-helper';
import { useWidgetFrameProps } from '@/services/dashboards/widgets/_hooks/use-widget-frame-props';
import { useWidgetLifecycle } from '@/services/dashboards/widgets/_hooks/use-widget-lifecycle';
// eslint-disable-next-line import/no-cycle
import { useWidgetState } from '@/services/dashboards/widgets/_hooks/use-widget-state';
import type { CostAnalyzeDataModel } from '@/services/dashboards/widgets/type';


type Data = CostAnalyzeDataModel['results'];
interface FullData {
    results: Data;
    more: boolean;
}

const USAGE_SOURCE_UNIT = 'GB';
// const USAGE_TYPE_LABEL_MAP: Record<Extract<UsageType, 'data-transfer.out'|'data-transfer.in'|'data-transfer.etc'>, TranslateResult> = {
//     'data-transfer.out': 'Transfer-out',
//     'data-transfer.in': 'Transfer-in',
//     'data-transfer.etc': 'etc.',
// };

const chartContext = ref<HTMLElement|null>(null);
const chartHelper = useAmcharts5(chartContext);
const props = defineProps<WidgetProps>();
const state = reactive({
    ...toRefs(useWidgetState<FullData>(props)),
    fieldsKey: computed<string>(() => (state.selectedSelectorType === 'cost' ? 'usd_cost' : 'usage_quantity')),
    tableFields: computed<Field[]>(() => {
        const textOptions: Field['textOptions'] = {
            type: state.fieldsKey === 'usd_cost' ? 'cost' : 'size',
            sourceUnit: USAGE_SOURCE_UNIT,
        };
        return [
            GROUP_BY_ITEM_MAP[state.groupBy],
            { name: `${state.fieldsKey}_sum.0.value`, label: 'Transfer-out', textOptions },
            { name: `${state.fieldsKey}_sum.1.value`, label: 'Transfer-in', textOptions },
            { name: `${state.fieldsKey}_sum.2.value`, label: 'etc.', textOptions },
        ];
    }),
    thisPage: 1,
    dateRange: computed<DateRange>(() => ({
        start: dayjs.utc(state.settings?.date_range?.start).format('YYYY-MM'),
        end: dayjs.utc(state.settings?.date_range?.end).format('YYYY-MM'),
    })),
});
const widgetFrameProps:ComputedRef = useWidgetFrameProps(props, state);

/* Api */
const fetchData = async (): Promise<FullData> => {
    try {
        const apiQueryHelper = new ApiQueryHelper();
        apiQueryHelper.setFilters([
            { k: 'usage_type', v: ['data-transfer.out', 'data-transfer.in', 'data-transfer.etc'], o: '' },
            { k: 'product', v: 'AWSDataTransfer', o: '=' },
            { k: 'usage_type', v: null, o: '!=' },
        ]);
        const query: any = {
            granularity: state.granularity,
            group_by: [state.groupBy, 'usage_type'],
            start: state.dateRange.start,
            end: state.dateRange.end,
            fields: {
                usd_cost_sum: {
                    key: 'usd_cost',
                    operator: 'sum',
                },
                usage_quantity_sum: {
                    key: 'usage_quantity',
                    operator: 'sum',
                },
            },
            field_group: ['usage_type'],
            sort: [{ key: '_total_usd_cost_sum', desc: true }],
            ...apiQueryHelper.data,
        };
        if (state.pageSize) {
            query.page = { start: getPageStart(state.thisPage, state.pageSize), limit: state.pageSize };
        }
        const { results, more } = await SpaceConnector.clientV2.costAnalysis.cost.analyze({ query });
        return { results: sortTableData(results, 'usage_type'), more };
    } catch (e) {
        ErrorHandler.handleError(e);
        return { results: [], more: false };
    }
};

const drawChart = () => {
    const chart = chartHelper.createMapChart();
    const polygonSeries = chartHelper.createMapPolygonSeries();
    chart.series.push(polygonSeries);
    const pointSeries = chartHelper.createMapPointSeries({
        calculateAggregates: true,
        valueField: 'value',
        // polygonIdField: 'usage_quantity',
    });
    chart.series.push(pointSeries);
    chartHelper.setChartColors(chart, state.colorSet); // TODO: not working...

    const circleTemplate = Template.new({}) as Template<Circle>;
    pointSeries.bullets.push(() => {
        const circle = chartHelper.createCircle({
            radius: 5,
            // fill: color(0xff621f), // TODO: must change dynamically
            fillOpacity: 0.6,
            templateField: 'circleSettings',
        }, circleTemplate);
        return chartHelper.createBullet({
            sprite: circle,
            dynamic: true,
        });
    });
    pointSeries.set('heatRules', [{
        target: circleTemplate,
        min: 5,
        max: 20,
        key: 'radius',
        dataField: 'value',
    }]);

    pointSeries.data.setAll(state.data);
};

const initWidget = async (data?: FullData): Promise<FullData> => {
    state.loading = true;
    state.data = data ?? await fetchData();
    await nextTick();
    chartHelper.clearChildrenOfRoot();
    drawChart();
    state.loading = false;
    return state.data;
};
const refreshWidget = async (thisPage = 1): Promise<FullData> => {
    state.loading = true;
    state.thisPage = thisPage;
    state.data = await fetchData();
    await nextTick();
    chartHelper.clearChildrenOfRoot();
    drawChart();
    state.loading = false;
    return state.data;
};

/* Event */
const handleSelectSelectorType = (selected: string) => {
    state.selectedSelectorType = selected;
    initWidget();
};
const handleUpdateThisPage = (thisPage: number) => {
    state.thisPage = thisPage;
    refreshWidget(thisPage);
};

useWidgetLifecycle({
    disposeWidget: chartHelper.disposeRoot,
});

defineExpose<WidgetExpose<FullData>>({
    initWidget,
    refreshWidget,
});
</script>
<style lang="postcss" scoped>
.aws-data-transfer-by-region {
    .content-wrapper {
        height: 11.5rem;
        .chart-loader {
            height: 100%;
            .chart {
                height: 100%;
            }
        }
    }
}
</style>
