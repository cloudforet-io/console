import type { Tags } from '@/api-clients/_common/schema/model';
import type {
    EscalationPolicyFinishConditionType,
    EscalationPolicyRepeatType,
    EscalationPolicyRulesType,
} from '@/api-clients/alert-manager/escalation-policy/schema/type';

export interface EscalationPolicyModel {
    escalation_policy_id: string;
    name: string;
    rules: EscalationPolicyRulesType[];
    repeat: EscalationPolicyRepeatType;
    finish_condition: EscalationPolicyFinishConditionType;
    tags: Tags;
    service_id: string;
    workspace_id: string;
    domain_id: string;
    created_at: string;
    updated_at: string;
}
