import { i18n } from '@/translations';

import type { DashboardConfig } from '@/services/dashboards/config';
import type { DefaultDashboardPreviewConfig } from '@/services/dashboards/default-dashboard/config';

export const blankPreview: DefaultDashboardPreviewConfig = {
    name: 'Blank',
    labels: [],
    version: '1',
    description: {
        icon: 'ic_dashboard-template_blank',
        preview_image: '',
        text: i18n.t('DASHBOARDS.CREATE.BLANK_DESC'),
    },
};

export const blankDashboard: DashboardConfig = {
    ...blankPreview,
    settings: {
        date_range: {
            enabled: true,
        },
        currency: {
            enabled: true,
        },
        refresh_interval_option: '5m',
    },
    variables_schema: {
        properties: {},
        order: [],
    },
    variables: {},
    layouts: [],
};
