import { computed, reactive } from 'vue';

import { isEmpty } from 'lodash';
import { defineStore } from 'pinia';

import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';

import type { UserListPerUserGroupItemType } from '@/schema/identity/user-group/type';

export const useUserGroupUsersPageStore = defineStore('page-user-group-users', () => {
    const state = reactive({
        loading: true,
        usersPerUserGroup: [] as UserListPerUserGroupItemType[],
        selectedUser: {} as UserListPerUserGroupItemType,
        totalCount: 0,
        selectedIndices: [],
        pageStart: 1,
        pageLimit: 15,
        searchFilters: [] as ConsoleFilter[],
    });
    const getters = reactive({
        selectedUsers: computed((): UserListPerUserGroupItemType[] => {
            if (state.selectedIndices.length === 1 && isEmpty(state.selectedUser)) return [state.selectedUser];
            const users: UserListPerUserGroupItemType[] = [];
            state.selectedIndices.forEach((d:number) => {
                users.push(state.usersPerUserGroup[d]);
            });
            return users ?? [];
        }),
    });
    const actions = {
        reset() {
            state.loading = true;
            state.usersPerUserGroup = [] as UserListPerUserGroupItemType[];
            state.selectedUser = {} as UserListPerUserGroupItemType;
            state.totalCount = 0;
            state.selectedIndices = [];
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
