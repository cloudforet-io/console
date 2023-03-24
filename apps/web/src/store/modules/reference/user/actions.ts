import type { Action } from 'vuex';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { REFERENCE_LOAD_TTL } from '@/store/modules/reference/config';
import type { ReferenceLoadOptions } from '@/store/modules/reference/type';
import type { UserReferenceMap, UserReferenceState } from '@/store/modules/reference/user/type';

import ErrorHandler from '@/common/composables/error/errorHandler';

let lastLoadedTime = 0;

export const load: Action<UserReferenceState, any> = async ({ state, commit }, options: ReferenceLoadOptions): Promise<void|Error> => {
    const currentTime = new Date().getTime();

    if (
        ((options?.lazyLoad && state.items)
        || (lastLoadedTime !== 0 && currentTime - lastLoadedTime < REFERENCE_LOAD_TTL)
        ) && !options?.force
    ) return;
    lastLoadedTime = currentTime;

    try {
        const response = await SpaceConnector.client.identity.user.list({
            query: {
                only: ['user_id', 'name'],
            },
        }, { timeout: 3000 });
        const users: UserReferenceMap = {};

        response.results.forEach((userInfo: any): void => {
            users[userInfo.user_id] = {
                key: userInfo.user_id,
                label: userInfo.name ? `${userInfo.user_id} (${userInfo.name})` : userInfo.user_id,
                name: userInfo.name,
            };
        });

        commit('setUsers', users);
    } catch (e) {
        ErrorHandler.handleError(e);
    }
};

export const sync: Action<UserReferenceState, any> = ({ state, commit }, userInfo): void => {
    const users: UserReferenceMap = {
        ...state.items,
        [userInfo.user_id]: {
            key: userInfo.user_id,
            label: userInfo.name ? `${userInfo.user_id} (${userInfo.name})` : userInfo.user_id,
            name: userInfo.name,
        },
    };
    commit('setUsers', users);
};
