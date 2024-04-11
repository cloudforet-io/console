import { computed, reactive } from 'vue';

import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { AgentCreateParameters } from '@/schema/identity/agent/api-verbs/create';
import type { AgentGetParameters } from '@/schema/identity/agent/api-verbs/get';
import type { AgentModel } from '@/schema/identity/agent/model';

import ErrorHandler from '@/common/composables/error/errorHandler';

export const useServiceAccountAgentStore = defineStore('service-account-agent', () => {
    const state = reactive({
        agentInfo: undefined as AgentModel|undefined,
    });

    const getters = reactive({
        currentAppToken: computed(() => state.agentInfo?.client_secret || ''),
        isClusterConnected: computed(() => !!state.agentInfo?.last_accessed_at), // TODO: refactor with 5min
    });


    const actions = {
        createAgent: async (serviceAccountId: string, options: AgentModel['options']) => {
            try {
                const response = await SpaceConnector.clientV2.identity.agent.create<AgentCreateParameters, AgentModel>({
                    service_account_id: serviceAccountId,
                    options,
                });
                state.agentInfo = response;
            } catch (e) {
                throw new Error('Agent Create Error');
            }
        },
        getAgent: async (serviceAccountId: string) => {
            try {
                const response = await SpaceConnector.clientV2.identity.agent.get<AgentGetParameters, AgentModel>({
                    service_account_id: serviceAccountId,
                });
                state.agentInfo = response;
            } catch (e) {
                ErrorHandler.handleError(e);
            }
        },
    };


    return {
        state,
        getters,
        ...actions,
    };
});
