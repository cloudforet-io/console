import type { Tags } from '@/schema/_common/model';
import type { EscalationPolicyRule, EscalationPolicyFinishCondition } from '@/schema/monitoring/escalation-policy/type';

export interface EscalationPolicyUpdateParameters {
    escalation_policy_id: string;
    name?: string;
    rules?: EscalationPolicyRule[];
    repeat_count?: number;
    finish_condition?: EscalationPolicyFinishCondition;
    tags?: Tags;
}
