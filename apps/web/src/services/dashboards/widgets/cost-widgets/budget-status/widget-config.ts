import { CHART_TYPE, GRANULARITY } from '@/schema/dashboard/_constants/widget-constant';
import type { WidgetConfig } from '@/schema/dashboard/_types/widget-type';

import { getWidgetOptionsSchema } from '@/services/dashboards/widgets/_helpers/widget-options-schema-generator';


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
        'cost_data_source',
        'filters.provider',
        'filters.project',
    ]),
};

export default budgetStatusWidgetConfig;
