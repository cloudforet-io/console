export const PROJECT_ROUTE = Object.freeze({
    _NAME: 'projectMain',
    DETAIL: {
        _NAME: 'projectDetail',
        TAB: {
            _NAME: 'projectTab',
            SUMMARY: { _NAME: 'projectSummary' },
            MEMBER: { _NAME: 'projectMember' },
            ALERT: {
                _NAME: 'projectAlert',
                ALERT: { _NAME: 'projectAlertList' },
                WEBHOOK: { _NAME: 'projectWebhook' },
                MAINTENANCE_WINDOW: { _NAME: 'projectMaintenanceWindow' },
                SETTINGS: { _NAME: 'projectSettings' },
            },
            NOTIFICATIONS: {
                _NAME: 'projectNotifications',
                ADD: { _NAME: 'addProjectNotification' },
            },
            TAG: { _NAME: 'projectTag' },
        },
        EVENT_RULE: { _NAME: 'projectEventRule' },
    },
});
