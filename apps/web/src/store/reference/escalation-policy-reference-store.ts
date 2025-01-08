import { asyncComputed } from '@vueuse/core';
import { computed, reactive } from 'vue';

import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { EscalationPolicyListParameters } from '@/schema/alert-manager/escalation-policy/api-verbs/list';
import type { EscalationPolicyModel } from '@/schema/alert-manager/escalation-policy/model';
import type { EscalationPolicyListParameters as EscalationPolicyListParametersV1 } from '@/schema/monitoring/escalation-policy/api-verbs/list';
import type { EscalationPolicyModel as EscalationPolicyModelV1 } from '@/schema/monitoring/escalation-policy/model';

import { useDomainStore } from '@/store/domain/domain-store';
import type {
    ReferenceLoadOptions, ReferenceItem, ReferenceMap, ReferenceTypeInfo,
} from '@/store/reference/type';
import { useUserStore } from '@/store/user/user-store';

import config from '@/lib/config';

import ErrorHandler from '@/common/composables/error/errorHandler';


export type EscalationPolicyItem = Required<Pick<ReferenceItem<EscalationPolicyModel>, 'key'|'label'|'name'|'data'>>;
export type EscalationPolicyReferenceMap = ReferenceMap<EscalationPolicyItem>;

const LOAD_TTL = 1000 * 60 * 60 * 3; // 3 hours
let lastLoadedTime = 0;

export const useEscalationPolicyReferenceStore = defineStore('reference-escalation-policy', () => {
    const userStore = useUserStore();
    const domainStore = useDomainStore();
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
        try {
            const isAlertManagerVersionV2 = (config.get('ADVANCED_SERVICE')?.alert_manager_v2 ?? []).includes(domainStore.state.domainId);
            const fetcher = isAlertManagerVersionV2
                ? SpaceConnector.clientV2.alertManager.escalationPolicy.list<EscalationPolicyListParameters, ListResponse<EscalationPolicyModel>>({
                    query: {
                        only: ['escalation_policy_id', 'name', 'service_id'],
                    },
                })
                : SpaceConnector.clientV2.monitoring.escalationPolicy.list<EscalationPolicyListParametersV1, ListResponse<EscalationPolicyModelV1>>({
                    query: {
                        only: ['escalation_policy_id', 'name', 'resource_group', 'project_id'],
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

