import { computed, reactive } from 'vue';

import type { CancelTokenSource } from 'axios';
import axios from 'axios';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { defineStore } from 'pinia';

import { LocalStorageAccessor } from '@cloudforet/core-lib/local-storage-accessor';
import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { NotificationListParameters } from '@/schema/notification/notification/api-verbs/list';
import type { NotificationModel } from '@/schema/notification/notification/model';

import { SIDEBAR_TYPE } from '@/store/display/constant';
import type {
    DisplayStoreState, SidebarProps, SidebarType,
    DisplayStoreGetters,
} from '@/store/display/type';
import { pinia } from '@/store/pinia';
import { useUserStore } from '@/store/user/user-store';


import ErrorHandler from '@/common/composables/error/errorHandler';


const verbose = false;

export const useDisplayStore = defineStore('display-store', () => {
    const userStore = useUserStore(pinia);

    const state = reactive<DisplayStoreState>({
        visibleSidebar: false,
        sidebarType: SIDEBAR_TYPE.info as SidebarType,
        isInitialized: false,
        uncheckedNotificationCount: 0,
        uncheckedNoticeCount: 0,
        isSignInFailed: false,
        signInFailedMessage: '',
        visibleMobileGuideModal: false,
        gnbNotificationLastReadTime: '',
    });

    const getters = reactive<DisplayStoreGetters>({
        hasUncheckedNotifications: computed<boolean>(() => !!(state.uncheckedNotificationCount && state.uncheckedNotificationCount > 0)),
        isHandbookVisible: computed<boolean>(() => state.visibleSidebar && (state.sidebarType === SIDEBAR_TYPE.handbook)),
        sidebarProps: computed<Partial<SidebarProps>>(() => {
            if (state.sidebarType === SIDEBAR_TYPE.info) {
                return {
                    styleType: 'primary',
                    disableButton: false,
                    size: 'md',
                    disableScroll: false,
                };
            }
            if (state.sidebarType === SIDEBAR_TYPE.handbook) {
                return {
                    styleType: 'secondary',
                    disableButton: false,
                    size: 'md',
                    disableScroll: true,
                };
            }
            if (state.sidebarType === SIDEBAR_TYPE.widget) {
                return {
                    styleType: 'primary',
                    disableButton: true,
                    size: 'md',
                    isFixedSize: true,
                    disableScroll: false,
                };
            }
            return { styleType: 'primary', disableButton: false, size: 'md' };
        }),
    });

    /* Mutations */
    const setVisibleSidebar = (val: boolean) => { state.visibleSidebar = val; };
    const setSidebarType = (val: SidebarType) => { state.sidebarType = val; };
    const setIsInitialized = (val: boolean) => { state.isInitialized = val; };
    const setUncheckedNotificationCount = (val: number) => { state.uncheckedNotificationCount = val; };
    const setIsSignInFailed = (val: boolean) => { state.isSignInFailed = val; };
    const setSignInFailedMessage = (val: string) => { state.signInFailedMessage = val; };
    const setVisibleMobileGuideModal = (val: boolean) => { state.visibleMobileGuideModal = val; };
    const setGnbNotificationLastReadTime = (val: string) => {
        state.gnbNotificationLastReadTime = val;
    };

    const mutations = {
        setVisibleSidebar,
        setSidebarType,
        setIsInitialized,
        setUncheckedNotificationCount,
        setIsSignInFailed,
        setSignInFailedMessage,
        setVisibleMobileGuideModal,
        setGnbNotificationLastReadTime,
    };

    /* Actions */
    const showHandbook = () => {
        state.sidebarType = SIDEBAR_TYPE.handbook;
        state.visibleSidebar = true;
    };
    const showInfo = () => {
        state.sidebarType = SIDEBAR_TYPE.info;
        state.visibleSidebar = true;
    };
    const showWidget = () => {
        state.sidebarType = SIDEBAR_TYPE.widget;
        state.visibleSidebar = true;
    };
    const fixedCheckNotificationFilter: ConsoleFilter = { k: 'is_read', v: false, o: '=' };
    const checkNotificationQueryHelper = new ApiQueryHelper().setCountOnly();
    const getNotificationListParam = (userId: string, currentTime: Dayjs, lastNotificationReadTime?: Dayjs) => {
        /* caution
         * Do not use iso string in api request here. */
        checkNotificationQueryHelper.setFilters([
            fixedCheckNotificationFilter,
            { k: 'created_at', v: currentTime.format('YYYY-MM-DD HH:mm:ss'), o: '<=t' },
            { k: 'user_id', v: userId, o: '=' },
        ]);

        const minimumCheckTime = currentTime.subtract(7, 'day');

        if (lastNotificationReadTime && lastNotificationReadTime.isAfter(minimumCheckTime)) {
            checkNotificationQueryHelper.addFilter(
                { k: 'created_at', v: lastNotificationReadTime.format('YYYY-MM-DD HH:mm:ss'), o: '>t' },
            );
        } else {
            checkNotificationQueryHelper.addFilter(
                { k: 'created_at', v: minimumCheckTime.format('YYYY-MM-DD HH:mm:ss'), o: '>=t' },
            );
        }

        return {
            query: checkNotificationQueryHelper.data,
        };
    };

    const updateGnbNotificationLastReadTime = (lastReadTime: string) => {
        state.gnbNotificationLastReadTime = lastReadTime;

        // set local storage
        const userId = userStore.state.userId || '';
        const settings = LocalStorageAccessor.getItem(userId) ?? {};
        const global = settings.global || {};
        LocalStorageAccessor.setItem(userId, {
            ...settings,
            global: {
                ...global,
                gnbNotificationLastReadTime: lastReadTime,
            },
        });
    };

    let notificationListApiToken: CancelTokenSource | undefined;
    const checkNotification = async (): Promise<void> => {
        if (notificationListApiToken) {
            if (verbose) console.debug('[CHECK NOTI]', ' pending...');
            return;
        }
        try {
            if (verbose) console.debug('[CHECK NOTI]', ' start');
            notificationListApiToken = axios.CancelToken.source();

            const currentTime = dayjs.tz(dayjs.utc(), userStore.state.timezone);
            const lastNotificationReadTimeStr = state.gnbNotificationLastReadTime;
            const lastNotificationReadTime = lastNotificationReadTimeStr ? dayjs(lastNotificationReadTimeStr).tz(userStore.state.timezone) : undefined;
            const param = getNotificationListParam(
                userStore.state.userId || '',
                currentTime,
                lastNotificationReadTime,
            );
            if (verbose) console.debug('[NOTI QUERY.FILTER]', param.query.filter);
            const { total_count } = await SpaceConnector.clientV2.notification.notification.list<NotificationListParameters, ListResponse<NotificationModel>>(param, {
                cancelToken: notificationListApiToken.token,
            });

            if (state.uncheckedNotificationCount !== total_count) {
                state.uncheckedNotificationCount = total_count;
            }
        } catch (e: any) {
            if (!axios.isCancel(e.axiosError)) {
                ErrorHandler.handleError(e);
            }
        } finally {
            notificationListApiToken = undefined;
            if (verbose) console.debug('[CHECK NOTI]', ' finished');
        }
    };

    let checkNotificationInterval: undefined|ReturnType<typeof setTimeout>;
    const stopCheckNotification = (): void => {
        if (notificationListApiToken) {
            if (verbose)console.debug('[NOTI API]', 'canceled');
            notificationListApiToken.cancel();
            notificationListApiToken = undefined;
        }

        if (checkNotificationInterval) {
            if (verbose)console.debug('[NOTI INTERVAL]', 'stopped');
            clearInterval(checkNotificationInterval);
            checkNotificationInterval = undefined;
        }
    };

    const startCheckNotification = (): void => {
        if (notificationListApiToken) {
            if (verbose)console.debug('[NOTI API]', 'previous canceled');
            notificationListApiToken.cancel();
            notificationListApiToken = undefined;
        }
        if (checkNotificationInterval) {
            if (verbose)console.debug('[NOTI INTERVAL]', 'previous stopped');
            clearInterval(checkNotificationInterval);
        } else {
            if (verbose) console.debug('[NOTI INTERVAL]', 'start');
            checkNotification();
        }

        checkNotificationInterval = setInterval(() => {
            checkNotification();
        }, 10000);
    };

    const initSettings = (): void => {
        const userId = userStore.state.userId || '';
        try {
            const settings = LocalStorageAccessor.getItem(userId);

            if (settings?.global) {
                state.gnbNotificationLastReadTime = settings.global.gnbNotificationLastReadTime;
            }
        } catch (e) {
            ErrorHandler.handleError(e);
            LocalStorageAccessor.removeItem(userId);
        }
    };


    const actions = {
        showHandbook,
        showInfo,
        showWidget,
        initSettings,
        stopCheckNotification,
        startCheckNotification,
        updateGnbNotificationLastReadTime,
    };

    return {
        state,
        getters,
        ...mutations,
        ...actions,
    };
});
