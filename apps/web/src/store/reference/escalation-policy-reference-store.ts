// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { asyncComputed } from '@vueuse/core';
import { computed, reactive } from 'vue';

import { defineStore } from 'pinia';

import APIClientManager from '@/api-clients/api-client-manager';
import type { EscalationPolicyModel } from '@/schema/alert-manager/escalation-policy/model';
import type { EscalationPolicyModel as EscalationPolicyModelV1 } from '@/schema/monitoring/escalation-policy/model';

import type {
    ReferenceLoadOptions, ReferenceItem, ReferenceMap, ReferenceTypeInfo,
} from '@/store/reference/type';
import { useUserStore } from '@/store/user/user-store';


import ErrorHandler from '@/common/composables/error/errorHandler';

export type EscalationPolicyItem = Required<Pick<ReferenceItem<EscalationPolicyModel>, 'key'|'label'|'name'|'data'>>;
export type EscalationPolicyReferenceMap = ReferenceMap<EscalationPolicyItem>;

const LOAD_TTL = 1000 * 60 * 60 * 3; // 3 hours
let lastLoadedTime = 0;

export const useEscalationPolicyReferenceStore = defineStore('reference-escalation-policy', () => {
    const userStore = useUserStore();
    const state = reactive({
        items: null as EscalationPolicyReferenceMap | null,
    });

    const getters = reactive({
        escalationPolicyItems: asyncComputed<EscalationPolicyReferenceMap>(async () => {
            if (userStore.state.currentGrantInfo?.scope !== 'WORKSPACE') return {};
            if (state.items === null) await load();
            return state.items ?? {};
        }, {}, { lazy: true }),
        secretTypeInfo: computed<ReferenceTypeInfo>(() => ({
            type: 'escalation_policy',
            key: 'escalation_policy_id',
            name: 'Escalation Policy',
            referenceMap: getters.escalationPolicyItems,
        })),
    });

    const load = async (options?: ReferenceLoadOptions) => {
        const currentTime = new Date().getTime();

        if (
            ((lastLoadedTime !== 0 && currentTime - lastLoadedTime < LOAD_TTL)
                || (options?.lazyLoad && state.items)
            ) && !options?.force
        ) return;

        const referenceMap: EscalationPolicyReferenceMap = {};
        const alertManagerClient = APIClientManager.alertManager;
        if (!alertManagerClient) return;
        try {
            const fetcher = alertManagerClient.endpoint.escalationPolicy.list({
                query: {
                    only: alertManagerClient.version === 'V1' ? ['escalation_policy_id', 'name', 'resource_group', 'project_id'] : ['escalation_policy_id', 'name', 'service_id'],
                },
            });

            const response = await fetcher;

            response.results?.forEach((escalationPolicyInfo: EscalationPolicyModel|EscalationPolicyModelV1): void => {
                referenceMap[escalationPolicyInfo.escalation_policy_id] = {
                    key: escalationPolicyInfo.escalation_policy_id,
                    label: escalationPolicyInfo.name,
                    name: escalationPolicyInfo.name,
                    data: escalationPolicyInfo,
                };
            });
            state.items = referenceMap;
            lastLoadedTime = currentTime;
        } catch (e) {
            ErrorHandler.handleError(e);
        }
    };

    const sync = async (escalationPolicyInfo: EscalationPolicyModel) => {
        state.items = {
            ...state.items,
            [escalationPolicyInfo.escalation_policy_id]: {
                key: escalationPolicyInfo.escalation_policy_id,
                label: escalationPolicyInfo.name,
                name: escalationPolicyInfo.name,
                data: escalationPolicyInfo,
            },
        };
    };

    const flush = () => {
        state.items = null;
        lastLoadedTime = 0;
    };

    const actions = {
        load,
        sync,
        flush,
    };

    return {
        state,
        getters,
        ...actions,
    };
});

