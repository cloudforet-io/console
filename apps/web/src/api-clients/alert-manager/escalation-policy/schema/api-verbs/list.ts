import type { Query } from '@cloudforet/core-lib/space-connector/type';

import type { EscalationPolicyFinishConditionType } from '@/api-clients/alert-manager/escalation-policy/schema/type';

export interface EscalationPolicyListParameters {
    query?: Query;
    escalation_policy_id?: string;
    name?: string;
    finish_condition?: EscalationPolicyFinishConditionType;
    service_id?: string;
}
