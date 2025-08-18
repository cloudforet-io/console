import type { ESCALATION_POLICY_FINISH_CONDITION } from '@/api-clients/alert-manager/escalation-policy/schema/constants';

export interface EscalationPolicyRule {
    notification_level: 'ALL'|'LV1'|'LV2'|'LV3'|'LV4'|'LV5';
    escalate_minutes?: number;
}

export type EscalationPolicyFinishCondition = typeof ESCALATION_POLICY_FINISH_CONDITION[keyof typeof ESCALATION_POLICY_FINISH_CONDITION];
