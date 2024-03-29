
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
    COST_REPORT: {
        _NAME: 'cost-report',
    },
});

export const ROUTE_SCOPE = {
    EXCLUDE_AUTH: 'EXCLUDE_AUTH',
    USER: 'USER',
    WORKSPACE: 'WORKSPACE',
    DOMAIN: 'DOMAIN',
} as const;

export const CostReportDetailPath = '/cost-report-detail';
