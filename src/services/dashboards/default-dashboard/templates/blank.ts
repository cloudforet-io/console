import type { DashboardConfig } from '@/services/dashboards/config';
import type { DefaultDashboardPreviewConfig } from '@/services/dashboards/default-dashboard/config';

export const blankPreview: DefaultDashboardPreviewConfig = {
    name: 'Blank',
    labels: [],
    version: '1',
    description: {
        icon: 'ic_dashboard-template_blank',
        preview_image: '',
        text: 'Build your own dashboard from scratch.',
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
    },
    variables_schema: {
        properties: {},
        order: [],
    },
    variables: {},
    layouts: [],
};
