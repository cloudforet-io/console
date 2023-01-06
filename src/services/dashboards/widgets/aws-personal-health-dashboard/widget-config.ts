import type { WidgetConfig } from '@/services/dashboards/widgets/_configs/config';

const awsPersonalHealthDashboardWidgetConfig: WidgetConfig = {
    widget_config_id: 'awsPersonalHealthDashboard',
    title: 'AWS Personal Health Dashboard',
    base_configs: [{ config_id: 'dashboardCommon' }],
    widget_component: () => ({
        component: import('@/services/dashboards/widgets/aws-personal-health-dashboard/AwsPersonalHealthDashboardWidget.vue'),
    }),
    labels: ['Assets'],
    description: {
        translation_id: 'DASHBOARDS.WIDGET.AWS_PERSONAL_HEALTH_DASHBOARD.DESC',
        preview_image: '',
    },
    scopes: ['PROJECT', 'WORKSPACE'],
    theme: {
        inherit: false,
    },
    sizes: ['lg', 'full'],
} as WidgetConfig;

export default awsPersonalHealthDashboardWidgetConfig;
