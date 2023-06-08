<template>
    <widget-frame v-bind="widgetFrameProps"
                  class="count-of-findings-widget"
                  @refresh="refreshWidget"
    >
        <div class="data-container">
            <div class="chart-wrapper">
                <p-data-loader class="chart-loader"
                               :loading="state.loading"
                               :data="state.data"
                               loader-type="skeleton"
                               :loader-backdrop-opacity="1"
                               show-data-from-scratch
                >
                    <div ref="chartContext"
                         class="chart"
                    />
                </p-data-loader>
            </div>
            <div class="table-pagination-wrapper">
                <p-text-pagination :this-page="state.thisPage"
                                   :disable-next-page="!state.showNextPage"
                                   @update:thisPage="handleUpdateThisPage"
                >
                    <template #default>
                        <span class="this-page">{{ state.thisPage }}</span>
                        <span v-if="state.showNextPage"> / ...</span>
                    </template>
                </p-text-pagination>
            </div>
        </div>
    </widget-frame>
</template>
<script setup lang="ts">
import type { ComputedRef } from 'vue';
import {
    computed, defineExpose, defineProps, nextTick, reactive, ref, toRefs,
} from 'vue';

import { percent, array } from '@amcharts/amcharts5';
import type * as am5xy from '@amcharts/amcharts5/xy';
import { PDataLoader, PTextPagination } from '@spaceone/design-system';
import dayjs from 'dayjs';
import { cloneDeep } from 'lodash';

import { getPageStart } from '@cloudforet/core-lib/component-util/pagination';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import { useAmcharts5 } from '@/common/composables/amcharts5';
import ErrorHandler from '@/common/composables/error/errorHandler';

import type { DateRange } from '@/services/dashboards/config';
import WidgetFrame from '@/services/dashboards/widgets/_components/WidgetFrame.vue';
import { COMPLIANCE_STATUS_MAP } from '@/services/dashboards/widgets/_configs/asset-config';
import type { WidgetExpose, WidgetProps } from '@/services/dashboards/widgets/_configs/config';
import { useWidgetFrameProps } from '@/services/dashboards/widgets/_hooks/use-widget-frame-props';
// eslint-disable-next-line import/no-cycle
import { useWidgetLifecycle } from '@/services/dashboards/widgets/_hooks/use-widget-lifecycle';
// eslint-disable-next-line import/no-cycle
import { useWidgetState } from '@/services/dashboards/widgets/_hooks/use-widget-state';
import countOfPassAndFailFindingsWidgetConfig
    from '@/services/dashboards/widgets/asset-widgets/count-of-pass-and-fail-findings/widget-config';
import type { Legend } from '@/services/dashboards/widgets/type';


interface Data {
    [groupBy: string]: string | any;
    pass_findings_count?: number;
    fail_findings_count?: number;
}
interface FullData {
    results: Data[];
    more: boolean;
}

const DATE_FORMAT = 'YYYY-MM';
const props = defineProps<WidgetProps>();

const chartContext = ref<HTMLElement | null>(null);
const chartHelper = useAmcharts5(chartContext);
const state = reactive({
    ...toRefs(useWidgetState<FullData>(props)),
    thisPage: 1,
    dateRange: computed<DateRange>(() => ({
        start: dayjs.utc(state.settings?.date_range?.start).format(DATE_FORMAT),
        end: dayjs.utc(state.settings?.date_range?.end).format(DATE_FORMAT),
    })),
    legends: computed<Legend[]>(() => {
        if (state.showPassFindings) {
            return [
                { name: 'pass_findings_count', label: COMPLIANCE_STATUS_MAP.PASS.label, color: COMPLIANCE_STATUS_MAP.PASS.color },
                { name: 'fail_findings_count', label: COMPLIANCE_STATUS_MAP.FAIL.label, color: COMPLIANCE_STATUS_MAP.FAIL.color },
            ];
        }
        return [
            { name: 'fail_findings_count', label: COMPLIANCE_STATUS_MAP.FAIL.label, color: COMPLIANCE_STATUS_MAP.FAIL.color },
        ];
    }),
    chartData: computed(() => cloneDeep(state.data?.results).reverse()),
    showPassFindings: computed(() => props.widgetConfigId === countOfPassAndFailFindingsWidgetConfig.widget_config_id),
    showNextPage: computed(() => !!state.data?.more),
});
const widgetFrameProps:ComputedRef = useWidgetFrameProps(props, state);

const fetchData = async (): Promise<FullData> => {
    try {
        const apiQueryHelper = new ApiQueryHelper();
        apiQueryHelper
            .setFilters(state.consoleFilters)
            .addFilter({ k: 'ref_cloud_service_type.labels', v: 'Compliance', o: '=' });
        if (state.pageSize) apiQueryHelper.setPage(getPageStart(state.thisPage, state.pageSize), state.pageSize);
        let apiQuery: any = {
            group_by: [state.groupBy],
            fields: {
                fail_findings_count: {
                    key: 'data.stats.findings.fail',
                    operator: 'sum',
                },
            },
            sort: [{ key: 'fail_findings_count', desc: true }],
        };
        if (state.showPassFindings) {
            apiQuery = {
                ...apiQuery,
                fields: {
                    ...apiQuery.fields,
                    pass_findings_count: {
                        key: 'data.stats.findings.pass',
                        operator: 'sum',
                    },
                },
                select: {
                    [state.groupBy]: state.groupBy,
                    pass_findings_count: 'pass_findings_count',
                    fail_findings_count: 'fail_findings_count',
                    total_findings_count: {
                        operator: 'add',
                        fields: ['pass_findings_count', 'fail_findings_count'],
                    },
                },
                sort: [{ key: 'total_findings_count', desc: true }],
            };
        }
        return await SpaceConnector.clientV2.inventory.cloudService.analyze({
            query: {
                ...apiQuery,
                ...apiQueryHelper.data,
            },
        });
    } catch (e) {
        ErrorHandler.handleError(e);
        return { results: [], more: false };
    }
};
const drawChart = (chartData) => {
    if (!state.groupBy || !state.legends) return;
    const { chart, xAxis, yAxis } = chartHelper.createXYHorizontalChart();
    yAxis.set('categoryField', state.groupBy);
    yAxis.data.setAll(cloneDeep(chartData));

    const legend = chartHelper.createLegend({
        nameField: 'name',
        clickTarget: 'none',
    });
    chart.children.push(legend);

    state.legends.forEach((_legend) => {
        const seriesSettings: Partial<am5xy.IXYSeriesSettings> = {
            name: _legend.label,
            valueXField: _legend.name,
            categoryYField: state.groupBy,
            xAxis,
            yAxis,
            baseAxis: yAxis,
            stacked: true,
            fill: _legend.color,
            stroke: _legend.color,
        };
        const series = chartHelper.createXYColumnSeries(chart, seriesSettings);
        series.columns.template.setAll({
            height: 20,
        });
        series.bullets.push(() => {
            const label = chartHelper.createLabel({
                text: _legend.name,
                populateText: true,
                textAlign: 'end',
                centerY: percent(50),
                fontSize: 14,
            });
            return chartHelper.createBullet({
                locationX: 1,
                locationY: 0.5,
                sprite: label,
                dynamic: true,
            });
        });
        series.columns.template.onPrivate(('width'), (width, target) => {
            array.each(target?.dataItem?.bullets, (bullet) => {
                if (width && width < 30) {
                    bullet.get('sprite').hide();
                }
            });
        });
        const tooltip = chartHelper.createTooltip();
        tooltip.label.adapters.add('text', (text, target) => {
            let _text = '';
            let totalValue = 0;
            chart.series.each((s) => {
                const fieldName = s.get('valueYField') || s.get('valueXField') || '';
                const value = target.dataItem?.dataContext?.[fieldName];
                totalValue += value;
                _text += `\n[${s.get('stroke')?.toString()}; fontSize: 10px]●[/] [fontSize: 14px;}]${s.get('name')}:[/] [bold; fontSize: 14px]${value}[/]`;
            });
            _text = `Total: [bold; fontSize: 14px]${totalValue}[/]${_text}`;
            return _text;
        });
        series.set('tooltip', tooltip);
        chart.series.push(series);
        series.data.setAll(cloneDeep(chartData));
    });
    legend.data.setAll(chart.series.values);
};
const initWidget = async (data?: FullData): Promise<FullData> => {
    state.loading = true;
    state.data = data ?? await fetchData();
    await nextTick();
    if (chartHelper.root.value) drawChart(state.chartData);
    state.loading = false;
    return state.data;
};
const refreshWidget = async (thisPage = 1): Promise<FullData> => {
    state.loading = true;
    state.thisPage = thisPage;
    state.data = await fetchData();
    chartHelper.refreshRoot();
    await nextTick();
    if (chartHelper.root.value) drawChart(state.chartData);
    state.loading = false;
    return state.data;
};

const handleUpdateThisPage = (thisPage: number) => {
    state.thisPage = thisPage;
    refreshWidget(thisPage);
};

useWidgetLifecycle({
    disposeWidget: undefined,
    refreshWidget,
    props,
    state,
});
defineExpose<WidgetExpose<FullData>>({
    initWidget,
    refreshWidget,
});

</script>
<style lang="postcss" scoped>
.count-of-findings-widget {
    .data-container {
        display: flex;
        flex-direction: column;
        height: 100%;
        .chart-wrapper {
            height: 85%;
            margin-bottom: 1rem;
            .chart-loader {
                height: 100%;
                .chart {
                    height: 100%;
                }
            }
        }
        .table-pagination-wrapper {
            flex-shrink: 0;
            text-align: center;
            .this-page {
                font-weight: bold;
            }
        }
    }
}
</style>
