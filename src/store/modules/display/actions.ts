import { Action } from 'vuex';
import dayjs from 'dayjs';
import { SIDEBAR_TYPE } from '@/store/modules/display/config';
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { ApiQueryHelper } from '@spaceone/console-core-lib/space-connector/helper';
import { DisplayState } from '@/store/modules/display/type';
import { QueryStoreFilter } from '@spaceone/console-core-lib/query/type';


export const showHandbook = ({ commit }): void => {
    commit('setVisibleSidebar', true);
    commit('setSidebarType', SIDEBAR_TYPE.handbook);
};

export const showInfo = ({ commit }): void => {
    commit('setSidebarType', SIDEBAR_TYPE.info);
    commit('setVisibleSidebar', true);
};

export const hideSidebar = ({ commit }): void => {
    commit('setVisibleSidebar', false);
};

export const startInitializing = ({ commit }): void => {
    commit('setIsInitialized', false);
};

export const finishInitializing = ({ commit }): void => {
    commit('setIsInitialized', true);
};

export const startDownloading = ({ commit }): void => {
    commit('setIsDownloaded', false);
};

export const finishDownloading = ({ commit }): void => {
    commit('setIsDownloaded', true);
};

export const showSignInErrorMessage = ({ commit }): void => {
    commit('setIsSignInFailed', true);
};

export const hideSignInErrorMessage = ({ commit }): void => {
    commit('setIsSignInFailed', false);
};


const fixedCheckNotificationFilter: QueryStoreFilter = { k: 'is_read', v: false, o: '=' };
const checkNotificationQueryHelper = new ApiQueryHelper().setCountOnly();
export const checkNotification: Action<DisplayState, any> = async ({
    commit, state, rootState, rootGetters,
}): Promise<void> => {
    try {
        const currentTime = dayjs();

        checkNotificationQueryHelper.setFilters([
            fixedCheckNotificationFilter,
            { k: 'created_at', v: currentTime.format('YYYY-MM-DD HH:mm:ss'), o: '<=t' },
            { k: 'user_id', v: rootState.user.userId, o: '=' },
        ]);

        const lastCheckedTime = rootGetters['settings/getItem']('last_checked_notification', '/gnb');
        const minimumCheckTime = currentTime.subtract(7, 'day');

        if (lastCheckedTime && dayjs(lastCheckedTime).isAfter(minimumCheckTime)) {
            checkNotificationQueryHelper.addFilter(
                { k: 'created_at', v: lastCheckedTime, o: '>t' },
            );
        } else {
            checkNotificationQueryHelper.addFilter(
                { k: 'created_at', v: minimumCheckTime.format('YYYY-MM-DD HH:mm:ss'), o: '>=t' },
            );
        }

        const { total_count } = await SpaceConnector.client.notification.notification.list({
            query: checkNotificationQueryHelper.data,
        });

        if (state.uncheckedNotificationCount !== total_count) commit('setUncheckedNotificationCount', total_count);
    } catch (e) {
        console.error(e);
    }
};

let checkNotificationInterval: number|undefined;
export const stopCheckNotification: Action<DisplayState, any> = ({ commit, dispatch }): void => {
    const lastCheckedTime = dayjs().format('YYYY-MM-DD HH:mm:ss');
    dispatch('settings/setItem', {
        key: 'last_checked_notification',
        value: lastCheckedTime,
        path: '/gnb',
    }, { root: true });

    commit('setUncheckedNotificationCount', 0);

    if (checkNotificationInterval) {
        clearInterval(checkNotificationInterval);
        checkNotificationInterval = undefined;
    }
};

export const startCheckNotification: Action<DisplayState, any> = ({ dispatch }): void => {
    if (checkNotificationInterval) {
        clearInterval(checkNotificationInterval);
    } else {
        dispatch('checkNotification');
    }

    checkNotificationInterval = setInterval(() => {
        dispatch('checkNotification');
    }, 10000);
};
