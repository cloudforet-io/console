import type { Action } from 'vuex';

import { REFERENCE_LOAD_TTL } from '@/store/modules/reference/config';
import type { DashboardsReferenceMap } from '@/store/modules/reference/dashboards/type';
import type { ReferenceLoadOptions } from '@/store/modules/reference/type';

import ErrorHandler from '@/common/composables/error/errorHandler';

let lastLoadedTime = 0;

export const load: Action<any, any> = async ({ state, commit }, options: ReferenceLoadOptions): Promise<void|Error> => {
    const currentTime = new Date().getTime();

    if (
        ((options?.lazyLoad && state.items)
            || (lastLoadedTime !== 0 && currentTime - lastLoadedTime < REFERENCE_LOAD_TTL)
        ) && !options?.force
    ) return;
    lastLoadedTime = currentTime;

    try {
        // TODO: API
        // const response = {};
        const dashboards: DashboardsReferenceMap = {};

        commit('setDashboards', dashboards);
    } catch (e) {
        ErrorHandler.handleError(e);
    }
};

export const sync: Action<any, any> = ({ state, commit }, dashboardsInfo): void => {
    const dashboards: DashboardsReferenceMap = {
        ...state.items,
        [dashboardsInfo]: {

        },
    };
    commit('setDashboards', dashboards);
};
