import { ADVANCED_FORMAT_RULE_TYPE } from '@/common/modules/widgets/_constants/widget-field-constant';
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
                defaultIndex: 0,
                excludeDateField: true,
            },
        },
        advancedFormatRules: {
            options: {
                formatRulesType: ADVANCED_FORMAT_RULE_TYPE.field,
                description: 'COMMON.WIDGETS.ADVANCED_FORMAT_RULES.COLOR_CODED_HEATMAP_DESC',
            },
        },
    },
    optionalFieldsSchema: {
        displayAnnotation: {},
    },
};


export default colorCodedHeatmap;
