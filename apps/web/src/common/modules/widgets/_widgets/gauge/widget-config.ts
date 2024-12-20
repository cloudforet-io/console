import {
    _FORMAT_RULE_TYPE,
} from '@/common/modules/widgets/_constants/widget-field-constant';
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
        dateRange: {},
        dataField: {},
        min: {
            options: {
                default: 0,
            },
        },
        max: {
            options: {
                default: 100,
            },
        },
        formatRules: {
            options: {
                formatRulesType: _FORMAT_RULE_TYPE.percentThreshold,
                default: [{
                    number: 70,
                    color: yellow[500],
                },
                {
                    number: 100,
                    color: red[400],
                }],
                baseColor: indigo[100],
                description: 'COMMON.WIDGETS.FORMAT_RULES.GAUGE_DESC',
            },
        },
    },
    optionalFieldsSchema: {
        numberFormat: {},
        displayAnnotation: {},
    },
};


export default gauge;
