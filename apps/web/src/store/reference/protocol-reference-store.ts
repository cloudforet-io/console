import { asyncComputed } from '@vueuse/core';
import { computed, reactive } from 'vue';

import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { ProtocolListParameters } from '@/schema/notification/protocol/api-verbs/list';
import type { ProtocolModel } from '@/schema/notification/protocol/model';
import { store } from '@/store';

import type {
    ReferenceLoadOptions, ReferenceItem, ReferenceMap, ReferenceTypeInfo,
} from '@/store/modules/reference/type';

import { MANAGED_VARIABLE_MODEL_CONFIGS } from '@/lib/variable-models/managed';

import ErrorHandler from '@/common/composables/error/errorHandler';


export type ProtocolItem = Required<Pick<ReferenceItem<ProtocolModel>, 'key'|'label'|'name'>>;
export type ProtocolReferenceMap = ReferenceMap<ProtocolItem>;

const LOAD_TTL = 1000 * 60 * 60 * 3; // 3 hours
let lastLoadedTime = 0;

export const useProtocolReferenceStore = defineStore('protocol-reference', () => {
    const state = reactive({
        items: null as ProtocolReferenceMap | null,
    });

    const getters = reactive({
        protocolItems: asyncComputed<ProtocolReferenceMap>(async () => {
            if (store.getters['user/getCurrentGrantInfo'].scope === 'USER') return {};
            if (state.items === null) await load();
            return state.items ?? {};
        }, {}, { lazy: true }),
        protocolTypeInfo: computed<ReferenceTypeInfo>(() => ({
            type: MANAGED_VARIABLE_MODEL_CONFIGS.protocol.key,
            key: MANAGED_VARIABLE_MODEL_CONFIGS.protocol.idKey as string,
            name: MANAGED_VARIABLE_MODEL_CONFIGS.protocol.name,
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

