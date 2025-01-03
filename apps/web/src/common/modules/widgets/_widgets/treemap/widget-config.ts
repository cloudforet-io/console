import type { WidgetConfig } from '@/common/modules/widgets/types/widget-config-type';


const treemap: WidgetConfig = {
    widgetName: 'treemap',
    meta: {
        title: 'Treemap',
        sizes: ['md', 'full'],
        defaultValidationConfig: {
            defaultMaxCount: 1,
        },
    },
    requiredFieldsSchema: {
        granularity: {},
        dateRange: {},
        dataField: {},
        categoryBy: {
            options: {
                dataTarget: 'labels_info',
                defaultMaxCount: 20,
                max: 30,
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
        displaySeriesLabel: {},
        displayAnnotation: {},
    },
};


export default treemap;
