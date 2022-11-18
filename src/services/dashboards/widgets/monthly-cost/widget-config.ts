import type { WidgetConfig } from '@/services/dashboards/widgets/type';

const monthlyCostWidgetConfig: WidgetConfig = {
    widget_config_id: 'monthlyCost',
    widget_component: 'MonthlyCost',
    title: 'Monthly Cost',
    labels: ['Cost'],
    description: {
        translation_id: 'DASHBOARDS.WIDGET.MONTHLY_COST.DESC',
        preview_image: 'tn--Month-to-Date_Spend.png',
    },
    scopes: ['DOMAIN', 'PROJECT', 'WORKSPACE'],
    theme: {
        inherit: true,
        inherit_count: 1,
    },
    sizes: ['sm'],
};

export default monthlyCostWidgetConfig;
