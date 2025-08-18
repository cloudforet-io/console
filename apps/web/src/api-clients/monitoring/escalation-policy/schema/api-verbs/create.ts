import type { EscalationPolicyModel } from '@/api-clients/monitoring/escalation-policy/schema/model';
import type { EscalationPolicyRule, EscalationPolicyFinishCondition } from '@/api-clients/monitoring/escalation-policy/schema/type';

export interface EscalationPolicyCreateParameters {
    name: string;
    rules: EscalationPolicyRule[];
    repeat_count?: number;
    finish_condition?: EscalationPolicyFinishCondition;
    resource_group: EscalationPolicyModel['resource_group'];
    project_id?: string;
}
