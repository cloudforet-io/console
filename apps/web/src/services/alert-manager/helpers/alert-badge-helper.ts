import { ALERT_STATE } from '@/schema/monitoring/alert/constants';

import { SCOPE } from '@/services/alert-manager/constants/alert-constant';


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
    if (scope === SCOPE.DOMAIN) return 'green200';
    return 'primary3';
};
