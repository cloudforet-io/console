import { computed, reactive } from 'vue';

import { isEmpty } from 'lodash';
import { defineStore } from 'pinia';

import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';

import type { UserGroupListItemType } from '@/schema/identity/user-group/type';

import type { ModalState } from '@/services/iam/types/user-group-type';

interface iState {
    loading: boolean;
    userGroups: UserGroupListItemType[];
    selectedUserGroup: UserGroupListItemType;
    totalCount: number;
    selectedIndices: number[];
    pageStart: number;
    pageLimit: number;
    searchFilters: ConsoleFilter[];
    modal: ModalState;
}

export const useUserGroupPageStore = defineStore('page-user-group', () => {
    const state = reactive<iState>({
        loading: true,
        userGroups: [],
        selectedUserGroup: {},
        totalCount: 0,
        selectedIndices: [],
        pageStart: 1,
        pageLimit: 15,
        searchFilters: [],
        modal: {
            type: '',
            title: '',
            themeColor: 'primary',
        },
    });
    const getters = reactive({
        selectedUserGroups: computed<UserGroupListItemType[]>((): UserGroupListItemType[] => {
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
            state.userGroups = [];
            state.selectedUserGroup = {};
            state.totalCount = 0;
            state.selectedIndices = [];
            state.pageStart = 1;
            state.pageLimit = 15;
            state.searchFilters = [];
            state.modal = {
                type: '',
                title: '',
                themeColor: 'primary',
            };
        },
        async listUserGroups() {
            //     TODO: api connect
        },
        updateModalSettings({
            type, title, themeColor,
        }: ModalState) {
            state.modal = {
                ...state.modal,
                type,
                title,
                themeColor,
            };
        },
    };
    return {
        state,
        getters,
        ...actions,
    };
});
