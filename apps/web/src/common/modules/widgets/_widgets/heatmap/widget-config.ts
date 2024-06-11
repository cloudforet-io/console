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
                defaultMaxCount: 10,
                max: 10,
            },
        },
        groupBy: {
            options: {
                dataTarget: 'labels_info',
                defaultMaxCount: 7,
                max: 14,
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
