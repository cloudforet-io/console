import { asyncComputed } from '@vueuse/core';
import { computed, reactive } from 'vue';

import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { TrustedAccountListParameters } from '@/api-clients/identity/trusted-account/schema/api-verbs/list';
import type { TrustedAccountModel } from '@/api-clients/identity/trusted-account/schema/model';

import { useAuthorizationStore } from '@/store/authorization/authorization-store';
import type {
    ReferenceItem, ReferenceLoadOptions, ReferenceMap, ReferenceTypeInfo,
} from '@/store/reference/type';

import ErrorHandler from '@/common/composables/error/errorHandler';


export type TrustedAccountItem = Required<Pick<ReferenceItem<TrustedAccountModel>, 'key'|'label'|'name'|'data'>>;
export type TrustedAccountReferenceMap = ReferenceMap<TrustedAccountItem>;

const LOAD_TTL = 1000 * 60 * 60 * 3; // 3 hours
let lastLoadedTime = 0;

export const useTrustedAccountReferenceStore = defineStore('reference-trusted-account', () => {
    const authorizationStore = useAuthorizationStore();
    const state = reactive({
        items: null as TrustedAccountReferenceMap | null,
    });

    const getters = reactive({
        trustedAccountItems: asyncComputed<TrustedAccountReferenceMap>(async () => {
            if (!authorizationStore.state.currentGrantInfo?.scope || authorizationStore.state.currentGrantInfo?.scope === 'USER') return {};
            if (state.items === null) await load();
            return state.items ?? {};
        }, {}, { lazy: true }),
        trustedAccountTypeInfo: computed<ReferenceTypeInfo>(() => ({
            type: 'trusted_account',
            key: 'trusted_account_id',
            name: 'name',
            referenceMap: getters.trustedAccountItems,
        })),
    });

    const load = async (options?: ReferenceLoadOptions) => {
        const currentTime = new Date().getTime();

        if (
            ((lastLoadedTime !== 0 && currentTime - lastLoadedTime < LOAD_TTL)
                || (options?.lazyLoad && state.items)
            ) && !options?.force
        ) return;

        const referenceMap: TrustedAccountReferenceMap = {};
        try {
            const response = await SpaceConnector.clientV2.identity.trustedAccount.list<TrustedAccountListParameters, ListResponse<TrustedAccountModel>>({
                query: {
                    only: ['trusted_account_id', 'name', 'resource_group', 'schedule'],
                },
            }, { timeout: 3000 });

            response.results?.forEach((trustedAccountInfo: any): void => {
                referenceMap[trustedAccountInfo.trusted_account_id] = {
                    key: trustedAccountInfo.trusted_account_id,
                    label: trustedAccountInfo.name,
                    name: trustedAccountInfo.name,
                    data: trustedAccountInfo,
                };
            });
            state.items = referenceMap;
            lastLoadedTime = currentTime;
        } catch (e) {
            ErrorHandler.handleError(e);
        }
    };

    const sync = async (trustedAccountInfo: TrustedAccountModel) => {
        state.items = {
            ...state.items,
            [trustedAccountInfo.trusted_account_id]: {
                key: trustedAccountInfo.trusted_account_id,
                label: trustedAccountInfo.name,
                name: trustedAccountInfo.name,
                data: trustedAccountInfo,
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

