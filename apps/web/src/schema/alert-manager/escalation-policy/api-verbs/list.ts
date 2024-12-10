import type { Query } from '@cloudforet/core-lib/space-connector/type';

import type { EscalationPolicyFinishConditionType } from '@/schema/alert-manager/escalation-policy/type';

export interface EscalationPolicyListParameters {
    query?: Query;
    escalation_policy_id?: string;
    name?: string;
    finish_condition?: EscalationPolicyFinishConditionType;
    service_id?: string;
}
