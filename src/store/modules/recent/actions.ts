import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { RECENT_TYPE, RecentConfig, RecentState } from '@/store/modules/recent/type';
import { Action } from 'vuex';


const createRecent = async (itemType: RECENT_TYPE, itemId: string) => {
    try {
        await SpaceConnector.client.addOns.recent.create({
            type: itemType,
            id: itemId,
        });
    } catch (e) {
        ErrorHandler.handleError(e);
    }
};

export const addItem: Action<RecentState, any> = async ({ commit }, recent: RecentConfig): Promise<void> => {
    const itemType = recent.itemType;
    const itemId = recent.itemId;
    await createRecent(itemType, itemId);
    const recentCommitsByItemType = {
        [RECENT_TYPE.PROJECT]: 'addProjectItem',
        [RECENT_TYPE.PROJECT_GROUP]: 'addProjectGroupItem',
        [RECENT_TYPE.CLOUD_SERVICE]: 'addCloudServiceItem',
        [RECENT_TYPE.MENU]: 'addMenuItem',
    };
    commit(recentCommitsByItemType[itemType], recent);
};

interface RecentLoadPayload {
    itemType: RECENT_TYPE;
    limit?: number;
}
export const load: Action<RecentState, any> = async ({ commit }, payload: RecentLoadPayload): Promise<void|Error> => {
    const itemType = payload?.itemType;
    const { results } = await SpaceConnector.client.addOns.recent.list({
        type: itemType,
        limit: payload?.limit,
    });
    const recents: RecentConfig[] = results.map(d => ({
        itemType: d.data.type,
        itemId: d.data.id,
        updatedAt: d.updated_at,
    }));

    if (itemType) {
        const recentCommitsByItemType = {
            [RECENT_TYPE.PROJECT]: 'loadProjectItem',
            [RECENT_TYPE.PROJECT_GROUP]: 'loadProjectGroupItem',
            [RECENT_TYPE.CLOUD_SERVICE]: 'loadCloudServiceItem',
            [RECENT_TYPE.MENU]: 'loadMenuItem',
        };
        commit(recentCommitsByItemType[itemType], recents);
    } else {
        commit('loadAllItem', recents);
    }
};
