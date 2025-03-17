import { computed, reactive } from 'vue';

import { defineStore } from 'pinia';

import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';

import type { UserGroupListItemType } from '@/api-clients/identity/user-group/schema/type';

export const useUserGroupNotificationChannelPageStore = defineStore('page-user-group-notification-channel', () => {
    const state = reactive({
        loading: true,
        notificationChannels: [] as UserGroupListItemType[],
        selectedNotificationChannel: {} as UserGroupListItemType,
        selectedIndices: [0],
        totalCount: 0,
        pageStart: 1,
        pageLimit: 15,
        searchFilters: [] as ConsoleFilter[],
    });
    const getters = reactive({
        selectedNotificationChannel: computed((): UserGroupListItemType[] => {
            const notificationChannels: UserGroupListItemType[] = [];
            state.selectedIndices.forEach((d: number) => {
                notificationChannels.push(state.notificationChannels[d]);
            });
            return notificationChannels ?? [];
        }),
    });
    const actions = {
        reset() {
            state.loading = true;
            state.notificationChannels = [] as UserGroupListItemType[];
            state.selectedNotificationChannel = {} as UserGroupListItemType;
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
