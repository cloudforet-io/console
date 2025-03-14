import { computed, reactive } from 'vue';

import { defineStore } from 'pinia';

import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';

import type { NotificationChannelListPerUserGroupItemType } from '@/api-clients/identity/user-group/schema/type';

export const useUserGroupNotificationChannelPageStore = defineStore('page-user-group-notification-channel', () => {
    const state = reactive({
        loading: true,
        notificationChannels: [] as NotificationChannelListPerUserGroupItemType[],
        selectedNotificationChannel: {} as NotificationChannelListPerUserGroupItemType,
        selectedIndices: [0],
        totalCount: 0,
        pageStart: 1,
        pageLimit: 15,
        searchFilters: [] as ConsoleFilter[],
    });
    const getters = reactive({
        selectedNotificationChannel: computed((): NotificationChannelListPerUserGroupItemType[] => {
            const notificationChannels: NotificationChannelListPerUserGroupItemType[] = [];
            state.selectedIndices.forEach((d: number) => {
                notificationChannels.push(state.notificationChannels[d]);
            });
            return notificationChannels ?? [];
        }),
    });
    const actions = {
        reset() {
            state.loading = true;
            state.notificationChannels = [] as NotificationChannelListPerUserGroupItemType[];
            state.selectedNotificationChannel = {} as NotificationChannelListPerUserGroupItemType;
            state.selectedIndices = [];
            state.totalCount = 0;
            state.pageStart = 1;
            state.pageLimit = 15;
            state.searchFilters = [] as ConsoleFilter[];
        },
    };
    return {
        state,
        getters,
        ...actions,
    };
});
