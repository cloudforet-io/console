import type { Tags } from '@/schema/_common/model';
import type { EscalationPolicyRule, EscalationPolicyFinishCondition, EscalationPolicyResourceGroup } from '@/schema/monitoring/escalation-policy/type';

export interface EscalationPolicyModel {
    escalation_policy_id: string;
    name: string;
    is_default: boolean;
    rules: EscalationPolicyRule[];
    repeat_count: number;
    finish_condition: EscalationPolicyFinishCondition;
    tags: Tags;
    resource_group: EscalationPolicyResourceGroup;
    project_id: string;
    workspace_id: string;
    domain_id: string;
    created_at: string;
}
