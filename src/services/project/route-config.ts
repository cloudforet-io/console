// eslint-disable-next-line import/no-cycle
import { MENU_ID } from '@/lib/menu/config';

export const PROJECT_ROUTE = Object.freeze({
    _NAME: MENU_ID.PROJECT,
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
