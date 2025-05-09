import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { AgentCreateParameters } from '@/api-clients/identity/agent/schema/api-verbs/create';
import type { AgentDeleteParameters } from '@/api-clients/identity/agent/schema/api-verbs/delete';
import type { AgentDisableParameters } from '@/api-clients/identity/agent/schema/api-verbs/disable';
import type { AgentEnableParameters } from '@/api-clients/identity/agent/schema/api-verbs/enable';
import type { AgentGetParameters } from '@/api-clients/identity/agent/schema/api-verbs/get';
import type { AgentListParameters } from '@/api-clients/identity/agent/schema/api-verbs/list';
import type { AgentRegenerateParameters } from '@/api-clients/identity/agent/schema/api-verbs/regenerate';
import type { AgentModel } from '@/api-clients/identity/agent/schema/model';

export const useAgentApi = () => {
    const actions = {
        create: SpaceConnector.clientV2.identity.agent.create<AgentCreateParameters, AgentModel>,
        delete: SpaceConnector.clientV2.identity.agent.delete<AgentDeleteParameters>,
        get: SpaceConnector.clientV2.identity.agent.get<AgentGetParameters, AgentModel>,
        list: SpaceConnector.clientV2.identity.agent.list<AgentListParameters, ListResponse<AgentModel>>,
        enable: SpaceConnector.clientV2.identity.agent.enable<AgentEnableParameters, AgentModel>,
        disable: SpaceConnector.clientV2.identity.agent.disable<AgentDisableParameters, AgentModel>,
        regenerate: SpaceConnector.clientV2.identity.agent.regenerate<AgentRegenerateParameters, AgentModel>,
    };

    return {
        agentAPI: actions,
    };
};
