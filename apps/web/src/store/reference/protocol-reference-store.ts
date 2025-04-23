import { asyncComputed } from '@vueuse/core';
import { computed, reactive } from 'vue';

import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { ProtocolListParameters } from '@/schema/notification/protocol/api-verbs/list';
import type { ProtocolModel } from '@/schema/notification/protocol/model';

import { useAuthorizationStore } from '@/store/authorization/authorization-store';
import type {
    ReferenceItem, ReferenceLoadOptions, ReferenceMap, ReferenceTypeInfo,
} from '@/store/reference/type';

import ErrorHandler from '@/common/composables/error/errorHandler';


export type ProtocolItem = Required<Pick<ReferenceItem<ProtocolModel>, 'key'|'label'|'name'>>;
export type ProtocolReferenceMap = ReferenceMap<ProtocolItem>;

const LOAD_TTL = 1000 * 60 * 60 * 3; // 3 hours
let lastLoadedTime = 0;

export const useProtocolReferenceStore = defineStore('reference-protocol', () => {
    const authorizationStore = useAuthorizationStore();
    const state = reactive({
        items: null as ProtocolReferenceMap | null,
    });

    const getters = reactive({
        protocolItems: asyncComputed<ProtocolReferenceMap>(async () => {
            if (!authorizationStore.state.currentGrantInfo?.scope || authorizationStore.state.currentGrantInfo?.scope === 'USER') return {};
            if (state.items === null) await load();
            return state.items ?? {};
        }, {}, { lazy: true }),
        protocolTypeInfo: computed<ReferenceTypeInfo>(() => ({
            type: 'protocol',
            key: 'protocol_id',
            name: 'name',
            referenceMap: getters.protocolItems,
        })),
    });

    const load = async (options?: ReferenceLoadOptions) => {
        const currentTime = new Date().getTime();

        if (
            ((lastLoadedTime !== 0 && currentTime - lastLoadedTime < LOAD_TTL)
                || (options?.lazyLoad && state.items)
            ) && !options?.force
        ) return;

        const referenceMap: ProtocolReferenceMap = {};
        try {
            const response = await SpaceConnector.clientV2.notification.protocol.list<ProtocolListParameters, ListResponse<ProtocolModel>>({
                query: {
                    only: ['protocol_id', 'name'],
                },
            }, { timeout: 3000 });

            response.results?.forEach((protocolInfo): void => {
                referenceMap[protocolInfo.protocol_id] = {
                    key: protocolInfo.protocol_id,
                    label: protocolInfo.name,
                    name: protocolInfo.name,
                };
            });
            state.items = referenceMap;
            lastLoadedTime = currentTime;
        } catch (e) {
            ErrorHandler.handleError(e);
        }
    };

    const sync = async (protocolInfo: ProtocolModel) => {
        state.items = {
            ...state.items,
            [protocolInfo.protocol_id]: {
                key: protocolInfo.protocol_id,
                label: protocolInfo.name,
                name: protocolInfo.name,
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

