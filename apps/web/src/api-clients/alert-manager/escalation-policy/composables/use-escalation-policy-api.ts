import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { EscalationPolicyCreateParameters } from '@/api-clients/alert-manager/escalation-policy/schema/api-verbs/create';
import type { EscalationPolicyDeleteParameters } from '@/api-clients/alert-manager/escalation-policy/schema/api-verbs/delete';
import type { EscalationPolicyGetParameters } from '@/api-clients/alert-manager/escalation-policy/schema/api-verbs/get';
import type { EscalationPolicyListParameters } from '@/api-clients/alert-manager/escalation-policy/schema/api-verbs/list';
import type { EscalationPolicyUpdateParameters } from '@/api-clients/alert-manager/escalation-policy/schema/api-verbs/update';
import type { EscalationPolicyModel } from '@/api-clients/alert-manager/escalation-policy/schema/model';

export const useEscalationPolicyApi = () => {
    const actions = {
        create: SpaceConnector.clientV2.alertManager.escalationPolicy.create<EscalationPolicyCreateParameters, EscalationPolicyModel>,
        delete: SpaceConnector.clientV2.alertManager.escalationPolicy.delete<EscalationPolicyDeleteParameters>,
        get: SpaceConnector.clientV2.alertManager.escalationPolicy.get<EscalationPolicyGetParameters, EscalationPolicyModel>,
        list: SpaceConnector.clientV2.alertManager.escalationPolicy.list<EscalationPolicyListParameters, ListResponse<EscalationPolicyModel>>,
        update: SpaceConnector.clientV2.alertManager.escalationPolicy.update<EscalationPolicyUpdateParameters, EscalationPolicyModel>,
    };

    return {
        escalationPolicyAPI: actions,
    };
};

