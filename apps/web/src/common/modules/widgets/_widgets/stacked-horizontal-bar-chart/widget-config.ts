import type { WidgetConfig } from '@/common/modules/widgets/types/widget-config-type';


const stackedHorizontalBarChart: WidgetConfig = {
    widgetName: 'stackedHorizontalBarChart',
    meta: {
        title: 'Stacked Horizontal Bar Chart',
        sizes: ['full'],
    },
    requiredFieldsSchema: {
        dataField: {},
        yAxis: {
            options: {
                dataTarget: 'label_field',
                default: 4,
                max: 8,
            },
        },
        stackBy: {
            options: {
                dataTarget: 'label_field',
                default: 5,
                max: 10,
            },
        },
    },
    optionalFieldsSchema: {
        legend: {},
    },
};


export default stackedHorizontalBarChart;
