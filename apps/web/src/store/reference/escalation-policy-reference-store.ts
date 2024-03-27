import { asyncComputed } from '@vueuse/core';
import { computed, reactive } from 'vue';

import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { EscalationPolicyListParameters } from '@/schema/monitoring/escalation-policy/api-verbs/list';
import type { EscalationPolicyModel } from '@/schema/monitoring/escalation-policy/model';
// eslint-disable-next-line import/no-cycle
import { store } from '@/store';

import type {
    ReferenceLoadOptions, ReferenceItem, ReferenceMap, ReferenceTypeInfo,
} from '@/store/reference/type';

import ErrorHandler from '@/common/composables/error/errorHandler';


export type EscalationPolicyItem = Required<Pick<ReferenceItem<EscalationPolicyModel>, 'key'|'label'|'name'>>;
export type EscalationPolicyReferenceMap = ReferenceMap<EscalationPolicyItem>;

const LOAD_TTL = 1000 * 60 * 60 * 3; // 3 hours
let lastLoadedTime = 0;

export const useEscalationPolicyReferenceStore = defineStore('reference-escalation-policy', () => {
    const state = reactive({
        items: null as EscalationPolicyReferenceMap | null,
    });

    const getters = reactive({
        escalationPolicyItems: asyncComputed<EscalationPolicyReferenceMap>(async () => {
            if (store.getters['user/getCurrentGrantInfo'].scope !== 'WORKSPACE') return {};
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
        try {
            const response = await SpaceConnector.clientV2.monitoring.escalationPolicy.list<EscalationPolicyListParameters, ListResponse<EscalationPolicyModel>>({
                query: {
                    only: ['escalation_policy_id', 'name'],
                },
            }, { timeout: 3000 });

            response.results?.forEach((escalationPolicyInfo: EscalationPolicyModel): void => {
                referenceMap[escalationPolicyInfo.escalation_policy_id] = {
                    key: escalationPolicyInfo.escalation_policy_id,
                    label: escalationPolicyInfo.name,
                    name: escalationPolicyInfo.name,
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

