import { defineAsyncComponent } from 'vue';

import type { WidgetConfig } from '@/services/dashboards/widgets/_configs/config';
import { ASSET_GROUP_BY, GRANULARITY } from '@/services/dashboards/widgets/_configs/config';

const baseCountOfFindingsWidgetConfig: WidgetConfig = {
    widget_config_id: 'baseCountOfFindings',
    widget_component: defineAsyncComponent(() => import('@/services/dashboards/widgets/_base/base-count-of-findings/BaseCountOfFindingsWidget.vue')),
    scopes: ['WORKSPACE'],
    theme: {
        inherit: false,
    },
    sizes: ['lg', 'full'],
    options: {
        granularity: GRANULARITY.ACCUMULATED,
        asset_group_by: ASSET_GROUP_BY.REGION,
        pagination_options: {
            enabled: true,
            page_size: 8,
        },
    },
};

export default baseCountOfFindingsWidgetConfig;
