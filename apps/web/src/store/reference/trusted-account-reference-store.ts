import { asyncComputed } from '@vueuse/core';
import { computed, reactive } from 'vue';

import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { TrustedAccountListParameters } from '@/schema/identity/trusted-account/api-verbs/list';
import type { TrustedAccountModel } from '@/schema/identity/trusted-account/model';
// eslint-disable-next-line import/no-cycle
import { store } from '@/store';

import type {
    ReferenceLoadOptions, ReferenceItem, ReferenceMap, ReferenceTypeInfo,
} from '@/store/reference/type';

import ErrorHandler from '@/common/composables/error/errorHandler';


export type TrustedAccountItem = Required<Pick<ReferenceItem<TrustedAccountModel>, 'key'|'label'|'name'>>;
export type TrustedAccountReferenceMap = ReferenceMap<TrustedAccountItem>;

const LOAD_TTL = 1000 * 60 * 60 * 3; // 3 hours
let lastLoadedTime = 0;

export const useTrustedAccountReferenceStore = defineStore('trusted-account-reference', () => {
    const state = reactive({
        items: null as TrustedAccountReferenceMap | null,
    });

    const getters = reactive({
        trustedAccountItems: asyncComputed<TrustedAccountReferenceMap>(async () => {
            if (store.getters['user/getCurrentGrantInfo'].scope === 'USER') return {};
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
                    only: ['trusted_account_id', 'name', 'resource_group'],
                },
            }, { timeout: 3000 });

            response.results?.forEach((trustedAccountInfo: any): void => {
                referenceMap[trustedAccountInfo.trusted_account_id] = {
                    key: trustedAccountInfo.trusted_account_id,
                    label: trustedAccountInfo.name,
                    name: trustedAccountInfo.name,
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

