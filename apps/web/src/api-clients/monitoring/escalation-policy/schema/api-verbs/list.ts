import type { Query } from '@cloudforet/core-lib/space-connector/type';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { EscalationPolicyModel } from '@/api-clients/monitoring/escalation-policy/schema/model';
import type { EscalationPolicyFinishCondition } from '@/api-clients/monitoring/escalation-policy/schema/type';

export interface EscalationPolicyListParameters {
    query?: Query;
    escalation_policy_id?: string;
    name?: string;
    is_default?: boolean;
    finish_condition?: EscalationPolicyFinishCondition;
    resource_group?: EscalationPolicyModel['resource_group'];
    project_id?: string;
}

export type EscalationPolicyListResponse = ListResponse<EscalationPolicyModel>;
