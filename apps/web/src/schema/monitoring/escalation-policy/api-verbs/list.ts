import type { Query } from '@cloudforet/core-lib/space-connector/type';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { EscalationPolicyModel } from '@/schema/monitoring/escalation-policy/model';
import type { EscalationPolicyFinishCondition } from '@/schema/monitoring/escalation-policy/type';

export interface EscalationPolicyListParameters {
    escalation_policy_id?: string;
    name?: string;
    is_default?: boolean;
    finish_condition?: EscalationPolicyFinishCondition;
    resource_group?: EscalationPolicyModel['resource_group'];
    project_id?: string;
    query?: Query;
}

export type EscalationPolicyListResponse = ListResponse<EscalationPolicyModel>;
