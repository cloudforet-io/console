import { computed, reactive } from 'vue';

import { isEmpty } from 'lodash';
import { defineStore } from 'pinia';

import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';

import type { UserGroupListItemType } from '@/api-clients/identity/user-group/schema/type';

export const useUserGroupUsersPageStore = defineStore('page-user-group-users', () => {
    const state = reactive({
        loading: true,
        usersPerUserGroup: [] as UserGroupListItemType[],
        selectedUser: {} as UserGroupListItemType,
        totalCount: 0,
        selectedIndices: [],
        pageStart: 1,
        pageLimit: 15,
        searchFilters: [] as ConsoleFilter[],
    });
    const getters = reactive({
        selectedUsers: computed((): UserGroupListItemType[] => {
            if (state.selectedIndices.length === 1 && isEmpty(state.selectedUser)) return [state.selectedUser];
            const users: UserGroupListItemType[] = [];
            state.selectedIndices.forEach((d:number) => {
                users.push(state.usersPerUserGroup[d]);
            });
            return users ?? [];
        }),
    });
    const actions = {
        reset() {
            state.loading = true;
            state.usersPerUserGroup = [] as UserGroupListItemType[];
            state.selectedUser = {} as UserGroupListItemType;
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
