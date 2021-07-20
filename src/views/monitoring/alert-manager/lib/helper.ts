import { ALERT_STATE, SCOPE } from '@/views/monitoring/alert-manager/lib/config';
import { store } from '@/store';

export const alertStateBadgeStyleTypeFormatter = (alertState) => {
    let style = '';
    switch (alertState) {
    case ALERT_STATE.TRIGGERED:
        style = 'red100';
        break;
    case ALERT_STATE.ACKNOWLEDGED:
        style = 'blue200';
        break;
    case ALERT_STATE.RESOLVED:
        style = 'gray200';
        break;
    case ALERT_STATE.ERROR:
        style = 'alert';
        break;
    default: style = '';
        break;
    }
    return style;
};

export const alertScopeBadgeStyleTypeFormatter = (scope) => {
    if (scope === SCOPE.global) return 'green200';
    return 'primary3';
};

export const triggeredByFormatter = value => store.state.resource.webhook.items[value]?.label
    || store.state.resource.user.items[value]?.label
    || value;
