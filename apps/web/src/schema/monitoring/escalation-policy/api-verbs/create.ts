import type { EscalationPolicyModel } from '@/schema/monitoring/escalation-policy/model';
import type { EscalationPolicyRule, EscalationPolicyFinishCondition } from '@/schema/monitoring/escalation-policy/type';

export interface EscalationPolicyCreateParameters {
    name: string;
    rules: EscalationPolicyRule[];
    repeat_count?: number;
    finish_condition?: EscalationPolicyFinishCondition;
    resource_group: EscalationPolicyModel['resource_group'];
    project_id?: string;
}
