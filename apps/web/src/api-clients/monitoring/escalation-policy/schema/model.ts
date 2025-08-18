import type { Tags } from '@/api-clients/_common/schema/model';
import type { ResourceGroupType } from '@/api-clients/_common/schema/type';
import type { EscalationPolicyRule, EscalationPolicyFinishCondition } from '@/api-clients/monitoring/escalation-policy/schema/type';

export interface EscalationPolicyModel {
    escalation_policy_id: string;
    name: string;
    is_default: boolean;
    rules: EscalationPolicyRule[];
    repeat_count: number;
    finish_condition: EscalationPolicyFinishCondition;
    tags: Tags;
    resource_group: Extract<ResourceGroupType, 'WORKSPACE'|'PROJECT'>;
    project_id: string;
    workspace_id: string;
    domain_id: string;
    created_at: string;
}
