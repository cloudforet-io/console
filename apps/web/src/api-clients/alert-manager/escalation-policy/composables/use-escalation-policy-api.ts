import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { EscalationPolicyCreateParameters } from '@/api-clients/alert-manager/escalation-policy/schema/api-verbs/create';
import type { EscalationPolicyDeleteParameters } from '@/api-clients/alert-manager/escalation-policy/schema/api-verbs/delete';
import type { EscalationPolicyGetParameters } from '@/api-clients/alert-manager/escalation-policy/schema/api-verbs/get';
import type { EscalationPolicyListParameters } from '@/api-clients/alert-manager/escalation-policy/schema/api-verbs/list';
import type { EscalationPolicyUpdateParameters } from '@/api-clients/alert-manager/escalation-policy/schema/api-verbs/update';
import type { EscalationPolicyModel } from '@/api-clients/alert-manager/escalation-policy/schema/model';
import { useResourceCacheSync } from '@/query/resource-query/shared/composable/use-resource-cache-sync';

export const useEscalationPolicyApi = () => {
    const { wrapResourceCacheRefresh } = useResourceCacheSync('alertManagerEscalationPolicy');

    const actions = {
        create: wrapResourceCacheRefresh(SpaceConnector.clientV2.alertManager.escalationPolicy.create<EscalationPolicyCreateParameters, EscalationPolicyModel>),
        delete: wrapResourceCacheRefresh(SpaceConnector.clientV2.alertManager.escalationPolicy.delete<EscalationPolicyDeleteParameters>),
        update: wrapResourceCacheRefresh(SpaceConnector.clientV2.alertManager.escalationPolicy.update<EscalationPolicyUpdateParameters, EscalationPolicyModel>),
        get: SpaceConnector.clientV2.alertManager.escalationPolicy.get<EscalationPolicyGetParameters, EscalationPolicyModel>,
        list: SpaceConnector.clientV2.alertManager.escalationPolicy.list<EscalationPolicyListParameters, ListResponse<EscalationPolicyModel>>,
    };

    return {
        escalationPolicyAPI: actions,
    };
};
