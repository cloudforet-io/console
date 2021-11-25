import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';

import config from '@/lib/config';
import { gray } from '@/styles/colors';
import { Legend } from '@/services/billing/cost-management/widgets/composables/dynamic-chart/type';
import { PieChart } from '@amcharts/amcharts4/charts';


const createSeries = (chart, legends: Legend[]) => {
    const series = chart.series.push(new am4charts.PieSeries());
    series.dataFields.value = 'value';
    series.dataFields.category = 'category';
    series.slices.template.stroke = am4core.color('white');
    series.slices.template.strokeOpacity = 1;
    series.labels.template.adapter.add('text', (text, target) => {
        if (target.dataItem && target.dataItem.category) {
            const label = legends.find(d => d.name === target.dataItem.category)?.label;
            return label || text;
        }
        return text;
    });
    series.labels.template.fontSize = 12;
    series.labels.template.fill = am4core.color(gray[900]);
    series.labels.template.bent = true;

    series.slices.template.togglable = false;
    series.slices.template.clickable = false;
    series.slices.template.tooltipText = '{category}: [bold]{value} ({value.percent.formatNumber(\'#.0\')}%)[/]';
    series.tooltip.label.fontSize = 10;

    // series.labels.template.maxWidth = 100;
    // series.labels.template.wrap = true;

    const slice = series.slices.template;
    slice.states.getKey('hover').properties.scale = 1;

    return series;
};

export default (data, chartContainer, valueOptions, categoryOptions): PieChart => {
    const chart = am4core.create(chartContainer, am4charts.PieChart);
    if (!config.get('AMCHARTS_LICENSE.ENABLED')) chart.logo.disabled = true;
    chart.paddingLeft = -5;
    chart.paddingBottom = -10;
    chart.data = data;
    chart.responsive.enabled = true;
    chart.innerRadius = am4core.percent(57);

    createSeries(chart, categoryOptions.legends);

    return chart;
};
