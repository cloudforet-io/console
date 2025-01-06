import { FORMAT_RULE_TYPE } from '@/common/modules/widgets/_constants/widget-field-constant';
import type { WidgetConfig } from '@/common/modules/widgets/types/widget-config-type';


const colorCodedHeatmap: WidgetConfig = {
    widgetName: 'colorCodedHeatmap',
    meta: {
        title: 'Color-coded Heatmap',
        sizes: ['full'],
        defaultValidationConfig: {
            defaultMaxCount: 2,
        },
    },
    requiredFieldsSchema: {
        granularity: {},
        dateRange: {},
        dataField: {},
        groupBy: {
            options: {
                dataTarget: 'labels_info',
                hideCount: true,
                excludeDateField: true,
            },
        },
        formatRules: {
            options: {
                dataTarget: 'labels_info',
                useField: true,
                formatRulesType: FORMAT_RULE_TYPE.textThreshold,
                description: 'COMMON.WIDGETS.ADVANCED_FORMAT_RULES.COLOR_CODED_HEATMAP_DESC',
            },
        },
    },
    optionalFieldsSchema: {
        displayAnnotation: {},
    },
};


export default colorCodedHeatmap;
