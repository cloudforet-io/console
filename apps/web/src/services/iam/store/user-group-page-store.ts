import { computed, reactive } from 'vue';

import { isEmpty } from 'lodash';
import { defineStore } from 'pinia';

import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';

import type { UserGroupListItemType } from '@/schema/identity/user-group/type';

export const useUserGroupPageStore = defineStore('page-user-group', () => {
    const state = reactive({
        loading: true,
        userGroups: [] as UserGroupListItemType[],
        selectedUserGroup: {} as UserGroupListItemType,
        totalCount: 0,
        selectedIndices: [],
        pageStart: 1,
        pageLimit: 15,
        searchFilters: [] as ConsoleFilter[],
    });
    const getters = reactive({
        selectedUserGroups: computed((): UserGroupListItemType[] => {
            if (state.selectedIndices.length === 1 && !isEmpty(state.selectedUserGroup)) return [state.selectedUserGroup];
            const userGroups: UserGroupListItemType[] = [];
            state.selectedIndices.forEach((d:number) => {
                userGroups.push(state.userGroups[d]);
            });
            return userGroups ?? [];
        }),
    });
    const actions = {
        reset() {
            state.loading = true;
            state.userGroups = [] as UserGroupListItemType[];
            state.selectedUserGroup = {} as UserGroupListItemType;
            state.totalCount = 0;
            state.selectedIndices = [];
            state.pageStart = 1;
            state.pageLimit = 15;
            state.searchFilters = [] as ConsoleFilter[];
        },
        async listUserGroups() {
            //     TODO: api connect
        },
    };
    return {
        state,
        getters,
        ...actions,
    };
});
