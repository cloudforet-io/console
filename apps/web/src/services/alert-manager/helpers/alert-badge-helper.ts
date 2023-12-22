import { ALERT_STATE } from '@/schema/monitoring/alert/constants';
import { ESCALATION_POLICY_RESOURCE_GROUP } from '@/schema/monitoring/escalation-policy/constant';
import type { EscalationPolicyResourceGroup } from '@/schema/monitoring/escalation-policy/type';



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

export const alertScopeBadgeStyleTypeFormatter = (scope: EscalationPolicyResourceGroup) => {
    if (scope === ESCALATION_POLICY_RESOURCE_GROUP.WORKSPACE) return 'green200';
    return 'primary3';
};
