import type { Action } from 'vuex';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { TrustedAccountListParameters } from '@/schema/identity/trusted-account/api-verbs/list';
import type { TrustedAccountModel } from '@/schema/identity/trusted-account/model';

import { REFERENCE_LOAD_TTL } from '@/store/modules/reference/config';
import type { TrustedAccountReferenceMap, TrustedAccountReferenceState } from '@/store/modules/reference/trusted-account/type';
import type { ReferenceLoadOptions } from '@/store/modules/reference/type';

import ErrorHandler from '@/common/composables/error/errorHandler';

let lastLoadedTime = 0;

export const load: Action<TrustedAccountReferenceState, any> = async ({ state, commit }, options: ReferenceLoadOptions): Promise<void|Error> => {
    const currentTime = new Date().getTime();

    if (
        ((options?.lazyLoad && state.items)
        || (lastLoadedTime !== 0 && currentTime - lastLoadedTime < REFERENCE_LOAD_TTL)
        ) && !options?.force
    ) return;

    try {
        const response = await SpaceConnector.clientV2.identity.trustedAccount.list<TrustedAccountListParameters, ListResponse<TrustedAccountModel>>({
            workspace_id: undefined,
            query: {
                only: ['trusted_account_id', 'name', 'resource_group'],
            },
        }, { timeout: 3000 });
        const trustedAccounts: TrustedAccountReferenceMap = {};

        (response.results ?? []).forEach((trustedAccountInfo: any): void => {
            trustedAccounts[trustedAccountInfo.trusted_account_id] = {
                key: trustedAccountInfo.trusted_account_id,
                label: trustedAccountInfo.name,
                name: trustedAccountInfo.name,
            };
        });

        commit('setTrustedAccounts', trustedAccounts);
        lastLoadedTime = currentTime;
    } catch (e) {
        ErrorHandler.handleError(e);
    }
};

export const sync: Action<TrustedAccountReferenceState, any> = ({ state, commit }, trustedAccountInfo): void => {
    const trustedAccounts: TrustedAccountReferenceMap = {
        ...state.items,
        [trustedAccountInfo.trusted_account_id]: {
            key: trustedAccountInfo.trusted_account_id,
            label: trustedAccountInfo.name,
            name: trustedAccountInfo.name,
        },
    };
    commit('setTrustedAccounts', trustedAccounts);
};
