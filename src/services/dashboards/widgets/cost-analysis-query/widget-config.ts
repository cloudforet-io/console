import { CHART_TYPE } from '@/services/cost-explorer/cost-analysis/type';
import { GRANULARITY, GROUP_BY } from '@/services/dashboards/widgets/config';
import type { WidgetConfig } from '@/services/dashboards/widgets/config';

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
    widget_options_schema: {
        type: 'object',
        properties: {
            group_by: {
                type: 'string',
                enum: Object.values(GROUP_BY),
            },
            granularity: {
                type: 'string',
                enum: Object.values(GRANULARITY),
            },
            chart_type: {
                type: 'string',
                enum: Object.values(CHART_TYPE),
            },
            stacked: {
                type: 'boolean',
            },
        },
        required: ['group_by', 'granularity', 'chart_type'],
    },
};

export default costAnalysisQueryWidgetConfig;
