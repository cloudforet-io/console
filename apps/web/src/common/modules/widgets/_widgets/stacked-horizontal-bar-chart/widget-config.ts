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
            },
        },
        stackBy: {
            options: {
                dataTarget: 'label_field',
            },
        },
    },
    optionalFieldsSchema: {
        legend: {},
    },
};


export default stackedHorizontalBarChart;
