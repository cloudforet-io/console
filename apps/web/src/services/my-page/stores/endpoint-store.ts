import { reactive, computed } from 'vue';

import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { EndpointListParameters, EndpointListResponse } from '@/api-clients/identity/endpoint/schema/api-verbs/list';
import type { EndpointModel } from '@/api-clients/identity/endpoint/schema/model';

import ErrorHandler from '@/common/composables/error/errorHandler';

export const useEndpointStore = defineStore('endpoint', () => {
    const state = reactive({
        hasLoaded: false,
        loading: false,
        endpoints: [] as EndpointModel[],
    });

    const getters = reactive({
        endpointLinks: computed<Record<string, string>>(() => {
            const endpoints = {};
            if (!state.endpoints) return endpoints;
            state.endpoints.forEach((data) => {
                const service = data.service;
                const link = data.endpoint;
                endpoints[service] = link;
            });
            return endpoints;
        }),
    });

    const actions = {
        listEndpoints: async () => {
            if (state.hasLoaded) return;
            state.loading = true;
            try {
                const { results } = await SpaceConnector.clientV2.identity.endpoint.list<EndpointListParameters, EndpointListResponse>();
                state.endpoints = results;
                state.hasLoaded = true;
            } catch (e) {
                ErrorHandler.handleError(e);
                state.endpoints = [];
            } finally {
                state.loading = false;
            }
        },
    };

    return {
        state,
        getters,
        ...actions,
    };
});
