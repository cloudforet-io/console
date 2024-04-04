import type { ESCALATION_POLICY_FINISH_CONDITION } from '@/schema/monitoring/escalation-policy/constant';

export interface EscalationPolicyRule {
    notification_level: 'ALL'|'LV1'|'LV2'|'LV3'|'LV4'|'LV5';
    escalate_minutes?: number;
}

export type EscalationPolicyFinishCondition = typeof ESCALATION_POLICY_FINISH_CONDITION[keyof typeof ESCALATION_POLICY_FINISH_CONDITION];
