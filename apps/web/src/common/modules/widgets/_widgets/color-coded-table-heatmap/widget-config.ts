import { _FORMAT_RULE_TYPE } from '@/common/modules/widgets/_constants/widget-field-constant';
import type { WidgetConfig } from '@/common/modules/widgets/types/widget-config-type';


const colorCodedTableHeatmap: WidgetConfig = {
    widgetName: 'colorCodedTableHeatmap',
    meta: {
        title: 'Color-coded Table Heatmap',
        sizes: ['md', 'full'],
        defaultValidationConfig: {
            defaultMaxCount: 1,
        },
    },
    requiredFieldsSchema: {
        granularity: {},
        dateRange: {},
        xAxis: {
            options: {
                dataTarget: 'labels_info',
                defaultMaxCount: 6,
                max: 31,
            },
        },
        dataField: {},
        formatRules: {
            options: {
                formatRulesType: _FORMAT_RULE_TYPE.textNumberTreshold,
                description: 'COMMON.WIDGETS.ADVANCED_FORMAT_RULES.COLOR_CODED_TABLE_HEATMAP_DESC',
            },
        },
    },
    optionalFieldsSchema: {
        numberFormat: {},
        displayAnnotation: {},
    },
};


export default colorCodedTableHeatmap;
