export const ERROR_ROUTE = Object.freeze({
    _NAME: 'error',
    EXPIRED_LINK: {
        _NAME: 'expired-link',
    },
});
export const ROOT_ROUTE = Object.freeze({
    _NAME: 'root',
    WORKSPACE: {
        _NAME: 'workspace',
    },
    ADMIN: {
        _NAME: 'admin',
    },
});

export const ROUTE_SCOPE = {
    EXCLUDE_AUTH: 'EXCLUDE_AUTH',
    USER: 'USER',
    WORKSPACE: 'WORKSPACE',
    DOMAIN: 'DOMAIN',
} as const;

export const CostReportDetailPath = '/cost-report-detail';

export const EXTERNAL_PAGE_ROUTE = {
    COST_REPORT_DETAIL: {
        _NAME: 'cost-report-detail',
    },
    ALERT_PUBLIC_DETAIL: {
        _NAME: 'alert-public-detail',
    },
} as const;

export const EXTERNAL_PAGES = [
    EXTERNAL_PAGE_ROUTE.COST_REPORT_DETAIL._NAME,
    EXTERNAL_PAGE_ROUTE.ALERT_PUBLIC_DETAIL._NAME,
];
