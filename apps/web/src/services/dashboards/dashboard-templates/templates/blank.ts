import { computed, reactive } from 'vue';

import { i18n } from '@/translations';

import type { DashboardTemplate } from '@/services/dashboards/config';
import { DASHBOARD_LABEL } from '@/services/dashboards/constants/dashboard-constants';
import type { DefaultDashboardPreviewTemplate } from '@/services/dashboards/dashboard-templates/config';
import { getDashboardVariablesSchema } from '@/services/dashboards/dashboard-templates/helper';

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
