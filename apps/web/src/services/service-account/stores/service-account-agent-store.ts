import { computed, reactive } from 'vue';

import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { AgentCreateParameters } from '@/api-clients/identity/agent/schema/api-verbs/create';
import type { AgentDeleteParameters } from '@/api-clients/identity/agent/schema/api-verbs/delete';
import type { AgentDisableParameters } from '@/api-clients/identity/agent/schema/api-verbs/disable';
import type { AgentEnableParameters } from '@/api-clients/identity/agent/schema/api-verbs/enable';
import type { AgentGetParameters } from '@/api-clients/identity/agent/schema/api-verbs/get';
import type { AgentRegenerateParameters } from '@/api-clients/identity/agent/schema/api-verbs/regenerate';
import type { AgentModel } from '@/api-clients/identity/agent/schema/model';

import ErrorHandler from '@/common/composables/error/errorHandler';

export const useServiceAccountAgentStore = defineStore('service-account-agent', () => {
    const state = reactive({
        loading: false,
        agentInfo: undefined as AgentModel|undefined,
    });

    const getters = reactive({
        currentAppToken: computed(() => state.agentInfo?.client_secret || ''),
        isAgentCreated: computed(() => !!state.agentInfo),
        isClusterConnected: computed(() => !!state.agentInfo?.last_accessed_at), // TODO: refactor with 5min
    });


    const actions = {
        createAgent: async (serviceAccountId: string, options: AgentModel['options']) => {
            state.loading = true;
            try {
                const response = await SpaceConnector.clientV2.identity.agent.create<AgentCreateParameters, AgentModel>({
                    service_account_id: serviceAccountId,
                    options,
                });
                setAgentInfo(response);
            } catch (e: any) {
                throw new Error('Agent Create Error', e);
            } finally {
                setTimeout(() => {
                    state.loading = false;
                }, 1000);
            }
        },
        getAgent: async (serviceAccountId: string) => {
            state.loading = true;
            try {
                const response = await SpaceConnector.clientV2.identity.agent.get<AgentGetParameters, AgentModel>({
                    service_account_id: serviceAccountId,
                });
                setAgentInfo(response);
            } catch (e) {
                setAgentInfo(undefined);
            } finally {
                setTimeout(() => {
                    state.loading = false;
                }, 1000);
            }
        },
        enableAgent: async (serviceAccountId: string) => {
            state.loading = true;
            try {
                const response = await SpaceConnector.clientV2.identity.agent.enable<AgentEnableParameters, AgentModel>({
                    service_account_id: serviceAccountId,
                });
                setAgentInfo(response);
                // TODO: maybe throw error and handle message in component
            } catch (e) {
                // TODO: maybe throw error and handle message in component
                ErrorHandler.handleError(e);
            } finally {
                setTimeout(() => {
                    state.loading = false;
                }, 1000);
            }
        },
        disableAgent: async (serviceAccountId: string) => {
            state.loading = true;
            try {
                const response = await SpaceConnector.clientV2.identity.agent.disable<AgentDisableParameters, AgentModel>({
                    service_account_id: serviceAccountId,
                });
                setAgentInfo(response);
                // TODO: maybe throw error and handle message in component
            } catch (e) {
                // TODO: maybe throw error and handle message in component
                ErrorHandler.handleError(e);
            } finally {
                setTimeout(() => {
                    state.loading = false;
                }, 1000);
            }
        },
        deleteAgent: async (serviceAccountId: string) => {
            state.loading = true;
            try {
                await SpaceConnector.clientV2.identity.agent.delete<AgentDeleteParameters, AgentModel>({
                    service_account_id: serviceAccountId,
                });
                setAgentInfo(undefined);
                // TODO: maybe throw error and handle message in component
            } catch (e) {
                // TODO: maybe throw error and handle message in component
                ErrorHandler.handleError(e);
            } finally {
                setTimeout(() => {
                    state.loading = false;
                }, 1000);
            }
        },
        regenerateAgent: async (serviceAccountId: string) => {
            state.loading = true;
            try {
                const response = await SpaceConnector.clientV2.identity.agent.regenerate<AgentRegenerateParameters, AgentModel>({
                    service_account_id: serviceAccountId,
                });
                setAgentInfo(response);
                // TODO: maybe throw error and handle message in component
            } catch (e) {
                // TODO: maybe throw error and handle message in component
                ErrorHandler.handleError(e);
            } finally {
                setTimeout(() => {
                    state.loading = false;
                }, 1000);
            }
        },
    };
    const setAgentInfo = (agentInfo: AgentModel|undefined) => {
        state.agentInfo = agentInfo;
    };

    const mutations = {
        setAgentInfo,
    };


    return {
        state,
        getters,
        ...actions,
        ...mutations,
    };
});
