import type { RouteConfig } from 'vue-router';

import { EXTERNAL_PAGE_ROUTE } from '@/router/constant';

import AlertPublicDetailPage from '@/common/pages/AlertPublicDetailPage.vue';
import CostReportDetailPage from '@/common/pages/CostReportDetailPage.vue';

import { OPS_FLOW_ROUTE } from '@/services/ops-flow/routes/route-constant';

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
    {
        path: '/ops-flow-landing',
        name: EXTERNAL_PAGE_ROUTE.OPS_FLOW_LANDING._NAME,
        redirect: { name: OPS_FLOW_ROUTE.LANDING._NAME },
    },
];
