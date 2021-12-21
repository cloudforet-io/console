import {
    CategoryAxis, ValueAxis, ColumnSeries, LabelBullet, XYChart,
} from '@amcharts/amcharts4/charts';
import { DynamicField } from '@/data-display/dynamic/dynamic-field/type/field-schema';


export const getCategoryAxis = (nameOptions: DynamicField): CategoryAxis => {
    const categoryAxis = new CategoryAxis();
    categoryAxis.dataFields.category = nameOptions.key;
    if (categoryAxis.renderer) {
        categoryAxis.renderer.grid.template.location = 0;
        categoryAxis.renderer.minGridDistance = 1;
        categoryAxis.renderer.inversed = true;
        categoryAxis.renderer.grid.template.disabled = true;
    }

    return categoryAxis;
};

export const getValueAxis = (): ValueAxis => {
    const valueAxis = new ValueAxis();
    valueAxis.min = 0;

    return valueAxis;
};

const getLabelBullets = (): LabelBullet => {
    const labelBullet = new LabelBullet();
    labelBullet.label.horizontalCenter = 'left';
    labelBullet.label.dx = 10;
    labelBullet.label.text = "{values.valueX.workingValue.formatNumber('#.0as')}";
    labelBullet.locationX = 1;

    return labelBullet;
};

export const getColumnSeries = (chart: XYChart, nameOptions: DynamicField, valueOptions: DynamicField): ColumnSeries => {
    const series = new ColumnSeries();
    series.dataFields.categoryY = nameOptions.key;
    series.dataFields.valueX = valueOptions.key;
    series.tooltipText = '{valueX.value}';

    series.columns.template.strokeOpacity = 0;
    series.columns.template.column.cornerRadiusBottomRight = 5;
    series.columns.template.column.cornerRadiusTopRight = 5;
    series.columns.template.adapter.add('fill', (fill, target) => chart.colors.getIndex(target?.dataItem?.index ?? 0));

    series.bullets.push(getLabelBullets());
    return series;
};
