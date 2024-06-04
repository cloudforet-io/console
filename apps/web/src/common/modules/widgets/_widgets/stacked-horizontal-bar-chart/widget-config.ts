import type { WidgetConfig } from '@/common/modules/widgets/types/widget-config-type';


const stackedHorizontalBarChart: WidgetConfig = {
    widgetName: 'stackedHorizontalBarChart',
    meta: {
        title: 'Stacked Horizontal Bar Chart',
        sizes: ['full'],
    },
    requiredFieldsSchema: {
        dataField: {
            label: 'Data Field',
        },
        yAxisField: {
            label: 'Y-Axis Field',
            options: {
                dataTarget: 'label_field',
            },
        },
        stackBy: {
            label: 'Stack By',
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
