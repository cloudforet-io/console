import type { WidgetConfig } from '@/common/modules/widgets/types/widget-config-type';

import { indigo, red, yellow } from '@/styles/colors';


const gauge: WidgetConfig = {
    widgetName: 'gauge',
    meta: {
        title: 'Gauge',
        sizes: ['md'],
    },
    requiredFieldsSchema: {
        granularity: {},
        dataField: {},
        min: {
            options: {
                default: 3,
            },
        },
        max: {
            options: {
                default: 3,
            },
        },
        formatRules: {
            options: {
                default: [{
                    threshold: 90,
                    color: yellow[500],
                },
                {
                    threshold: 100,
                    color: red[400],
                }],
                baseColor: indigo[100],
                description: 'COMMON.WIDGETS.FORMAT_RULES.GAUGE_DESC',
            },
        },
    },
    optionalFieldsSchema: {
    },
};


export default gauge;
