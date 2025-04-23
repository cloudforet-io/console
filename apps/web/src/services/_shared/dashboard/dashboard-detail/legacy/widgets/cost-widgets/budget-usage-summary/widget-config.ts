import { GRANULARITY } from '@/api-clients/dashboard/_constants/widget-constant';
import type { WidgetConfig } from '@/api-clients/dashboard/_types/widget-type';

import { getWidgetOptionsSchema } from '@/services/_shared/dashboard/dashboard-detail/legacy/widgets/_helpers/widget-options-schema-generator';

const budgetUsageSummaryConfig: WidgetConfig = {
    widget_config_id: 'budgetUsageSummary',
    title: 'Budget Usage Summary',
    labels: ['Cost', 'Budget'],
    description: {
        translation_id: 'DASHBOARDS.WIDGET.BUDGET_USAGE_SUMMARY.DESC',
        preview_image: 'widget-img_budgetUsageSummary--thumbnail.png',
    },
    scopes: ['PROJECT', 'WORKSPACE'],
    theme: {
        inherit: true,
        inherit_count: 1,
    },
    sizes: ['sm', 'full'],
    options: {
        granularity: GRANULARITY.MONTHLY,
    },
    options_schema: getWidgetOptionsSchema([
        ['cost_data_source', { fixed: true, hidden: true }],
        ['filters.project_group', { fixed: true }],
        ['filters.project', { fixed: true }],
        'filters.provider',
    ]),
};

export default budgetUsageSummaryConfig;
