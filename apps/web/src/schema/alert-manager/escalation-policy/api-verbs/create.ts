import type { Tags } from '@/schema/_common/model';
import type {
    EscalationPolicyFinishConditionType,
    EscalationPolicyRepeatType,
    EscalationPolicyRulesType,
} from '@/schema/alert-manager/escalation-policy/type';

export interface EscalationPolicyCreateParameters {
    name: string;
    rules: EscalationPolicyRulesType[];
    repeat?: EscalationPolicyRepeatType;
    finish_condition?: EscalationPolicyFinishConditionType;
    tags?: Tags;
    service_id: string;
}
