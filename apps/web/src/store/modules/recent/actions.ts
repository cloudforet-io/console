import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import type { Action } from 'vuex';


import type { RecentConfig, RecentState, RecentType } from '@/store/modules/recent/type';
import {
    RECENT_TYPE,
} from '@/store/modules/recent/type';

import ErrorHandler from '@/common/composables/error/errorHandler';

const createRecent = async (itemType: RecentType, itemId: string) => {
    try {
        await SpaceConnector.client.addOns.recent.visit.create({
            type: itemType,
            id: itemId,
        });
    } catch (e) {
        ErrorHandler.handleError(e);
    }
};

const addCommitsByItemType = {
    [RECENT_TYPE.PROJECT]: 'addProjectItem',
    [RECENT_TYPE.PROJECT_GROUP]: 'addProjectGroupItem',
    [RECENT_TYPE.CLOUD_SERVICE]: 'addCloudServiceItem',
    [RECENT_TYPE.DASHBOARD]: 'addDashboardItem',
    [RECENT_TYPE.MENU]: 'addMenuItem',
};
export const addItem: Action<RecentState, any> = async ({ commit }, recent: RecentConfig): Promise<void> => {
    const itemType = recent.itemType;
    const itemId = recent.itemId;
    await createRecent(itemType, itemId);
    commit(addCommitsByItemType[itemType], recent);
};

interface RecentLoadPayload {
    itemType: RecentType;
    limit?: number;
}
const setCommitsByItemType = {
    [RECENT_TYPE.PROJECT]: 'setProjectItems',
    [RECENT_TYPE.PROJECT_GROUP]: 'setProjectGroupItems',
    [RECENT_TYPE.CLOUD_SERVICE]: 'setCloudServiceItems',
    [RECENT_TYPE.DASHBOARD]: 'setDashboardItems',
    [RECENT_TYPE.MENU]: 'setMenuItems',
};
export const load: Action<RecentState, any> = async ({ commit }, payload: RecentLoadPayload): Promise<void|Error> => {
    const itemType = payload?.itemType;
    const { results } = await SpaceConnector.client.addOns.recent.visit.list({
        type: itemType,
        limit: payload?.limit,
    });
    const recents: RecentConfig[] = results.map((d) => ({
        itemType: d.data.type,
        itemId: d.data.id,
        updatedAt: d.updated_at,
    }));

    if (itemType) {
        commit(setCommitsByItemType[itemType], recents);
    } else {
        commit('loadAllItem', recents);
    }
};
