import type { WidgetConfig } from '@/services/dashboards/widgets/_configs/config';
import { getWidgetOptionsSchema } from '@/services/dashboards/widgets/_helpers/widget-schema-helper';

const costAnalysisQueryWidgetConfig: WidgetConfig = {
    widget_config_id: 'costAnalysisQuery',
    widget_component: () => ({
        component: import('@/services/dashboards/widgets/cost-analysis-query/CostAnalysisQueryWidget.vue'),
    }),
    title: 'Cost Analysis Query',
    labels: ['Cost'],
    description: {
    },
    scopes: ['PROJECT', 'WORKSPACE'],
    theme: {
        inherit: true,
    },
    sizes: ['xl', 'full'],
    options_schema: {
        schema: {
            type: 'object',
            properties: {
                ...getWidgetOptionsSchema('group_by'),
                // granularity: {
                //     type: 'string',
                //     enum: Object.values(GRANULARITY),
                // },
                // chart_type: {
                //     type: 'string',
                //     enum: Object.values(CHART_TYPE),
                // },
                // stacked: {
                //     type: 'boolean',
                // },
            },
            // required: ['group_by', 'granularity', 'chart_type'],
        },
    },
};

export default costAnalysisQueryWidgetConfig;
