import { RESOURCE_GROUP } from '@/api-clients/_common/schema/constant';
import { ALERT_STATE } from '@/schema/monitoring/alert/constants';
import type { EscalationPolicyModel } from '@/schema/monitoring/escalation-policy/model';



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

export const alertResourceGroupBadgeStyleTypeFormatter = (resourceGroup: EscalationPolicyModel['resource_group']) => {
    if (resourceGroup === RESOURCE_GROUP.WORKSPACE) return 'green200';
    return 'primary3';
};
