import type { NewWidgetConfig } from '@/common/modules/widgets/types/widget-config-type';


const numberCard: NewWidgetConfig = {
    widget_name: 'numberCard',
    meta: {
        title: 'Number Card',
        sizes: ['sm'],
        granularity: 'MONTHLY',
    },
    data_mapping_schema: {
        data_field: {
            label: 'Data Field',
        },
    },
    chart_options_schema: {
        comparison: {
            type: 'comparison',
            label: 'Comparison',
        },
        format_rules: {
            type: 'format_rules',
            label: 'Format Rules',
            fields: ['icon', 'color'],
        },
    },
};


export default numberCard;
