import { CHART_TYPE, GRANULARITY } from '@/api-clients/dashboard/_constants/widget-constant';
import type { WidgetConfig } from '@/api-clients/dashboard/_types/widget-type';

import { getWidgetOptionsSchema } from '@/services/_shared/dashboard/dashboard-detail/legacy/widgets/_helpers/widget-options-schema-generator';


const budgetStatusWidgetConfig: WidgetConfig = {
    widget_config_id: 'budgetStatus',
    title: 'Budget Status',
    labels: ['Cost', 'Budget'],
    description: {
        translation_id: 'DASHBOARDS.WIDGET.BUDGET_STATUS.DESC',
        preview_image: 'widget-img_budgetStatus--thumbnail.png',
    },
    scopes: ['PROJECT', 'WORKSPACE'],
    theme: {
        inherit: false,
    },
    sizes: ['sm'],
    options: {
        chart_type: CHART_TYPE.WAFFLE,
        granularity: GRANULARITY.MONTHLY,
    },
    options_schema: getWidgetOptionsSchema([
        ['cost_data_source', { fixed: true, hidden: true }],
        ['filters.project_group', { fixed: true }],
        ['filters.project', { fixed: true }],
        'filters.provider',
    ]),
};

export default budgetStatusWidgetConfig;
