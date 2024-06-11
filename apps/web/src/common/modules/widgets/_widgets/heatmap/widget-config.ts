import { FORMAT_RULE_TYPE } from '@/common/modules/widgets/configs/widget-field-config';
import type { WidgetConfig } from '@/common/modules/widgets/types/widget-config-type';


const heatmap: WidgetConfig = {
    widgetName: 'heatmap',
    meta: {
        title: 'Heatmap',
        sizes: ['md', 'full'],
    },
    requiredFieldsSchema: {
        granularity: {},
        xAxis: {
            options: {
                dataTarget: 'labels_info',
                default: 10,
                max: 10,
            },
        },
        groupBy: {
            options: {
                dataTarget: 'labels_info',
                default: 7,
                max: 14,
                multiSelectable: false,
            },
        },
        formatRules: {
            options: {
                formatRulesType: FORMAT_RULE_TYPE.nameAndThreshold,
            },
        },
    },
    optionalFieldsSchema: {
    },
};


export default heatmap;
