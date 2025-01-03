import type { WidgetConfig } from '@/common/modules/widgets/types/widget-config-type';


const sankeyChart: WidgetConfig = {
    widgetName: 'sankeyChart',
    meta: {
        title: 'Sankey Chart',
        sizes: ['md'],
        defaultValidationConfig: {
            defaultMaxCount: 1,
        },
    },
    requiredFieldsSchema: {
        granularity: {},
        dateRange: {},
        dataField: {},
        sankeyDimensions: {
            options: {
                defaultMaxCount: 10,
                max: 31,
            },
        },
    },
    optionalFieldsSchema: {
        dateFormat: {
            options: {
                default: 'MMM DD, YYYY',
            },
        },
        numberFormat: {},
        tooltipNumberFormat: {},
        displaySeriesLabel: {
            options: {
                showFormatField: true,
            },
        },
        displayAnnotation: {},
    },
};


export default sankeyChart;
