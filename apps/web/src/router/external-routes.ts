import type { RouteConfig } from 'vue-router';

import { EXTERNAL_PAGE_ROUTE } from '@/router/constant';

import AlertPublicDetailPage from '@/common/pages/AlertPublicDetailPage.vue';
import CostReportDetailPage from '@/common/pages/CostReportDetailPage.vue';

export const externalRoutes: RouteConfig[] = [
    {
        path: '/cost-report-detail',
        name: EXTERNAL_PAGE_ROUTE.COST_REPORT_DETAIL._NAME,
        props: (route) => ({
            accessToken: route.query.sso_access_token,
            costReportId: route.query.cost_report_id,
            language: route.query.language,
        }),
        component: CostReportDetailPage,
    },
    {
        path: '/alert-public-detail',
        name: EXTERNAL_PAGE_ROUTE.ALERT_PUBLIC_DETAIL._NAME,
        props: (route) => ({
            alertUrl: route.query.monitoring_url,
        }),
        component: AlertPublicDetailPage,
    },
];
