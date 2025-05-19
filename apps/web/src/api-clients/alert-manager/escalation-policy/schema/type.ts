import type {
    ESCALATION_POLICY_FINISH_CONDITION,
    ESCALATION_POLICY_STATE,
} from '@/schema/alert-manager/escalation-policy/constants';

export type EscalationPolicyStateType = typeof ESCALATION_POLICY_STATE[keyof typeof ESCALATION_POLICY_STATE];
export type EscalationPolicyFinishConditionType = typeof ESCALATION_POLICY_FINISH_CONDITION[keyof typeof ESCALATION_POLICY_FINISH_CONDITION];

export type EscalationPolicyRepeatType = {
    state: EscalationPolicyStateType;
    count: number;
};

export type EscalationPolicyRulesType = {
    channels: string[];
    escalate_minutes: number;
};
