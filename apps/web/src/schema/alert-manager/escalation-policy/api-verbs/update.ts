import type { Tags } from '@/schema/_common/model';
import type {
    EscalationPolicyFinishConditionType,
    EscalationPolicyRepeatType,
    EscalationPolicyRulesType,
} from '@/schema/alert-manager/escalation-policy/type';

export interface EscalationPolicyUpdateParameters {
    escalation_policy_id: string;
    name?: string;
    rules?: EscalationPolicyRulesType[];
    repeat?: EscalationPolicyRepeatType;
    finish_condition?: EscalationPolicyFinishConditionType;
    tags?: Tags;
}
