import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { ReferenceMap, ReferenceState } from '@/store/modules/reference/type';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { REFERENCE_LOAD_TTL } from '@/store/modules/reference/config';
import { Action } from 'vuex';

let lastLoadedTime = 0;

export const load = async ({ state, commit }, lazyLoad = false): Promise<void|Error> => {
    const currentTime = new Date().getTime();

    if (
        (lazyLoad && Object.keys(state.items).length > 0)
        || (lastLoadedTime !== 0 && currentTime - lastLoadedTime < REFERENCE_LOAD_TTL)
    ) return;
    lastLoadedTime = currentTime;

    try {
        const response = await SpaceConnector.client.identity.user.list({
            query: {
                only: ['user_id', 'name'],
            },
        }, { timeout: 3000 });
        const users: ReferenceMap = {};

        response.results.forEach((userInfo: any): void => {
            users[userInfo.user_id] = {
                label: userInfo.name ? `${userInfo.user_id} (${userInfo.name})` : userInfo.user_id,
                name: userInfo.name,
            };
        });

        commit('setUsers', users);
    } catch (e) {
        ErrorHandler.handleError(e);
    }
};

export const sync: Action<ReferenceState, any> = ({ state, commit }, userInfo): void => {
    const users = {
        ...state.items,
        [userInfo.user_id]: {
            label: userInfo.name ? `${userInfo.user_id} (${userInfo.name})` : userInfo.user_id,
            name: userInfo.name,
        },
    };
    commit('setUsers', users);
};
