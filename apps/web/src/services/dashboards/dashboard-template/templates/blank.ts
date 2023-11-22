import { computed, reactive } from 'vue';

import { DASHBOARD_LABEL } from '@/schema/dashboard/_constants/dashboard-constant';
import type { DashboardTemplate } from '@/schema/dashboard/_types/dashboard-type';
import { i18n } from '@/translations';

import { getDashboardVariablesSchema } from '@/services/dashboards/dashboard-template/helpers/dashboard-template-generator';
import type { DefaultDashboardPreviewTemplate } from '@/services/dashboards/dashboard-template/types/dashboard-template-type';

export const blankPreview: DefaultDashboardPreviewTemplate = reactive({
    name: 'Blank',
    labels: [],
    version: '1',
    description: {
        icon: 'ic_dashboard-template_blank',
        preview_image: '',
        text: computed(() => i18n.t('DASHBOARDS.CREATE.BLANK_DESC')),
    },
});

export const blankDashboard: DashboardTemplate = {
    ...blankPreview,
    settings: {
        date_range: {
            enabled: true,
        },
        refresh_interval_option: '5m',
    },
    variables_schema: getDashboardVariablesSchema(DASHBOARD_LABEL.BLANK),
    variables: {},
    layouts: [],
};
