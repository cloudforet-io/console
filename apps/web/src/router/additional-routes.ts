import type { RouteConfig } from 'vue-router';

import { ROOT_ROUTE } from '@/router/constant';

import CostReportDetailPage from '@/common/pages/CostReportDetailPage.vue';

export const additionalRoutes: RouteConfig[] = [
    {
        path: 'cost-report-detail',
        name: ROOT_ROUTE.COST_REPORT._NAME,
        props: (route) => ({
            accessToken: route.query.sso_access_token,
            costReportId: route.query.cost_report_id,
            language: route.query.language,
        }),
        component: CostReportDetailPage,
    },
];
