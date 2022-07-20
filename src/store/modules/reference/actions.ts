import type { Action } from 'vuex';

import type { ReferenceRootState } from '@/store/modules/reference/type';

export const loadAll: Action<ReferenceRootState, any> = async ({ dispatch, commit }): Promise<void|Error> => {
    commit('setIsAllLoaded', false);
    await Promise.allSettled([
        dispatch('cloudServiceType/load'),
        dispatch('collector/load'),
        dispatch('plugin/load'),
        dispatch('project/load'),
        dispatch('projectGroup/load'),
        dispatch('protocol/load'),
        dispatch('provider/load'),
        dispatch('region/load'),
        dispatch('secret/load'),
        dispatch('serviceAccount/load'),
        dispatch('user/load'),
        dispatch('webhook/load'),
    ]);
    commit('setIsAllLoaded', true);
};
