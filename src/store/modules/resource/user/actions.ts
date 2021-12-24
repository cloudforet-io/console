import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { ResourceMap } from '@/store/modules/resource/type';
import ErrorHandler from '@/common/composables/error/errorHandler';

export const load = async ({ state, commit }, lazyLoad = false): Promise<void|Error> => {
    if (lazyLoad && Object.keys(state.items).length > 0) return;
    try {
        const response = await SpaceConnector.client.identity.user.list({
            query: {
                only: ['user_id', 'name'],
            },
        }, { timeout: 2000 });
        const users: ResourceMap = {};

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
