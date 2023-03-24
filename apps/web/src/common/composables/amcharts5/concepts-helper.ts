import * as am5 from '@amcharts/amcharts5';
import type {
    IBulletSettings, ICircleSettings, Root, Circle,
} from '@amcharts/amcharts5';
import * as am5percent from '@amcharts/amcharts5/percent';

import { DEFAULT_DATE_FIELD_NAME, DEFAULT_DATE_FORMAT } from '@/common/composables/amcharts5/config';

import { gray, white } from '@/styles/colors';

export const createDataProcessor = (root: Root, settings?: am5.IDataProcessorSettings): am5.DataProcessor => am5.DataProcessor.new(root, {
    dateFormat: DEFAULT_DATE_FORMAT,
    dateFields: [DEFAULT_DATE_FIELD_NAME],
    ...settings,
});

export const createTooltip = (root: Root, settings?: am5.ITooltipSettings): am5.Tooltip => {
    const tooltip = am5.Tooltip.new(root, {
        getFillFromSprite: false,
        autoTextColor: false,
        ...settings,
    });
    tooltip.get('background')?.setAll({
        fill: am5.color(white),
        stroke: am5.color(gray[300]),
        fillOpacity: 0.9,
    });
    tooltip.label.setAll({
        text: `[${gray[700]}]{valueX}[/]`,
        fill: am5.color(gray[800]),
        fontSize: 12,
    });
    return tooltip;
};

export const createLegend = (root: Root, settings?: am5.ILegendSettings): am5.Legend => {
    const legend = am5.Legend.new(root, {
        layout: root.horizontalLayout,
        paddingTop: 4,
        useDefaultMarker: true,
        x: am5.percent(0),
        ...settings,
    });
    legend.labels.template.setAll({
        fontSize: 12,
        fill: am5.color(gray[700]),
    });
    legend.valueLabels.template.setAll({
        width: 0,
    });
    legend.markers.template.setAll({
        width: 10,
        height: 10,
    });
    legend.markerRectangles.template.setAll({
        cornerRadiusTL: 10,
        cornerRadiusTR: 10,
        cornerRadiusBL: 10,
        cornerRadiusBR: 10,
    });
    return legend;
};

export const createBullet = (root: Root, settings: IBulletSettings): am5.Bullet => am5.Bullet.new(root, {
    ...settings,
});

export const createCircle = (root: Root, settings: ICircleSettings, circleTemplate: am5.Template<Circle>): am5.Circle => am5.Circle.new(root, {
    ...settings,
}, circleTemplate);

export const toggleSeries = (chart: am5.SerialChart, index: number) => {
    if (chart instanceof am5percent.PieChart) {
        const series = chart.series?.getIndex(0);
        if (!series) return;

        const slice = series.slices.values[index];
        if (!slice || !slice.dataItem) return;

        if (slice.isHiding() || slice.isHidden()) {
            slice.dataItem.show();
        } else {
            slice.dataItem.hide();
        }
    } else {
        const series = chart.series?.getIndex(index);
        if (!series) return;
        if (series.isHiding() || series.isHidden()) {
            series.show();
        } else {
            series.hide();
        }
    }
};
