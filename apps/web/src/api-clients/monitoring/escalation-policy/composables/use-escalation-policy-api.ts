import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { EscalationPolicyCreateParameters } from '@/api-clients/monitoring/escalation-policy/schema/api-verbs/create';
import type { EscalationPolicyDeleteParameters } from '@/api-clients/monitoring/escalation-policy/schema/api-verbs/delete';
import type { EscalationPolicyGetParameters } from '@/api-clients/monitoring/escalation-policy/schema/api-verbs/get';
import type { EscalationPolicyListParameters } from '@/api-clients/monitoring/escalation-policy/schema/api-verbs/list';
import type { EscalationPolicySetDefaultParameters } from '@/api-clients/monitoring/escalation-policy/schema/api-verbs/set-default';
import type { EscalationPolicyUpdateParameters } from '@/api-clients/monitoring/escalation-policy/schema/api-verbs/update';
import type { EscalationPolicyModel } from '@/api-clients/monitoring/escalation-policy/schema/model';

export const useEscalationPolicyApi = () => {
    const actions = {
        create: SpaceConnector.clientV2.monitoring.escalationPolicy.create<EscalationPolicyCreateParameters, EscalationPolicyModel>,
        delete: SpaceConnector.clientV2.monitoring.escalationPolicy.delete<EscalationPolicyDeleteParameters>,
        get: SpaceConnector.clientV2.monitoring.escalationPolicy.get<EscalationPolicyGetParameters, EscalationPolicyModel>,
        list: SpaceConnector.clientV2.monitoring.escalationPolicy.list<EscalationPolicyListParameters, ListResponse<EscalationPolicyModel>>,
        setDefault: SpaceConnector.clientV2.monitoring.escalationPolicy.setDefault<EscalationPolicySetDefaultParameters, EscalationPolicyModel>,
        update: SpaceConnector.clientV2.monitoring.escalationPolicy.update<EscalationPolicyUpdateParameters, EscalationPolicyModel>,
    };
    return {
        escalationPolicyAPI: actions,
    };
};
