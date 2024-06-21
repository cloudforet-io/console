import { FORMAT_RULE_TYPE } from '@/common/modules/widgets/_constants/widget-field-constant';
import type { WidgetConfig } from '@/common/modules/widgets/types/widget-config-type';

import { indigo, red, yellow } from '@/styles/colors';


const progressCard: WidgetConfig = {
    widgetName: 'progressCard',
    meta: {
        title: 'Progress Card',
        sizes: ['sm'],
        defaultValidationConfig: {
            dataTarget: 'data_info',
            defaultMaxCount: 2,
        },
    },
    requiredFieldsSchema: {
        granularity: {},
        totalField: {
            options: {
                dataTarget: 'data_info',
            },
        },
        basisField: {
            options: {
                dataTarget: 'data_info',
            },
        },
        formatRules: {
            options: {
                formatRulesType: FORMAT_RULE_TYPE.percentThreshold,
                default: [{
                    threshold: 90,
                    color: yellow[500],
                },
                {
                    threshold: 100,
                    color: red[400],
                }],
                baseColor: indigo[100],
                description: 'COMMON.WIDGETS.FORMAT_RULES.PROGRESS_CARD_DESC',
            },
        },
    },
    optionalFieldsSchema: {
        comparison: {
            options: {
                toggle: true,
            },
        },
    },
};


export default progressCard;
