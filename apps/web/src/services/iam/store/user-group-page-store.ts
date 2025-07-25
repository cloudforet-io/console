// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { computed, reactive } from 'vue';

import { isEmpty } from 'lodash';
import { defineStore } from 'pinia';

import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';

import type { UserGroupChannelModel } from '@/api-clients/alert-manager/user-group-channel/schema/model';
import type { UserGroupListItemType } from '@/api-clients/identity/user-group/schema/type';

import type { ModalState } from '@/services/iam/types/user-group-type';
import type { UserListItemType } from '@/services/iam/types/user-type';

interface UserGroupPageState {
    loading: boolean;
    userGroups: UserGroupListItemType[];
    selectedUserGroup: UserGroupListItemType | undefined;
    totalCount: number;
    selectedIndices: number[];
    searchFilters: ConsoleFilter[];
    users: {
        list: UserListItemType[];
        totalCount: number;
        selectedIndices: number[];
        searchFilters: ConsoleFilter[];
    }
    userGroupChannels: {
        list?: UserGroupChannelModel[];
        pageStart: number;
        pageLimit: number;
        selectedIndices: number[];
        searchFilters: ConsoleFilter[];
    }
    modal: ModalState;
    selectedUserGroupIds: string[];
}

export const useUserGroupPageStore = defineStore('page-user-group', () => {
    const state = reactive<UserGroupPageState>({
        loading: true,
        userGroups: [],
        selectedUserGroup: undefined,
        totalCount: 0,
        selectedIndices: [],
        searchFilters: [],
        users: {
            list: [],
            pageStart: 1,
            pageLimit: 15,
            totalCount: 0,
            selectedIndices: [],
            searchFilters: [],
        },
        userGroupChannels: {
            list: [],
            pageStart: 1,
            pageLimit: 15,
            selectedIndices: [],
            searchFilters: [],
        },
        modal: {
            type: '',
            title: '',
            themeColor: 'primary',
        },
        selectedUserGroupIds: [],
    });
    const mutations = {
        setSelectedUserIdx(index: number[]) {
            state.users.selectedIndices = index;
        },
        setUserGroup(userGroups: UserGroupListItemType[]) {
            state.userGroups = userGroups;
        },
        selectedUserGroupChannelIdx(index: number[]) {
            state.userGroupChannels.selectedIndices = index;
        },
        setSelectedUserGroupChannel(list: UserGroupChannelModel[]) {
            state.userGroupChannels.list = list;
        },
        setSelectedUserGroupIds(ids: string[]) {
            state.selectedUserGroupIds = ids;
        },
        setSelectedIndices(indices: number[]) {
            state.selectedIndices = indices;
        },
        setSelectedUserGroupUsers(users: UserListItemType[]) {
            state.users.list = users;
        },
    };
    const getters = reactive({
        selectedUserGroups: computed<UserGroupListItemType[]>((): UserGroupListItemType[] => {
            if (state.selectedIndices.length === 1 && !isEmpty(state.selectedUserGroup)) return [state.selectedUserGroup];
            const userGroups: UserGroupListItemType[] = [];
            state.selectedIndices.forEach((d:number) => {
                userGroups.push(state.userGroups[d]);
            });
            return userGroups ?? [];
        }),
        selectedUserGroupChannel: computed(() => {
            const userGroupChannels: UserGroupChannelModel[] = [];
            state.userGroupChannels.selectedIndices.forEach((index) => {
                const channel = state.userGroupChannels.list[index];
                if (channel) userGroupChannels.push(channel);
            });
            return userGroupChannels ?? [];
        }),
        selectedUserGroupUsers: computed(() => {
            const users: UserListItemType[] = [];
            state.users.selectedIndices.forEach((index) => {
                const user = state.users.list[index];
                if (user) users.push(user);
            });
            return users ?? [];
        }),
    });
    const actions = {
        reset() {
            state.loading = true;
            state.userGroups = [];
            state.selectedUserGroup = undefined;
            state.totalCount = 0;
            state.selectedIndices = [];
            state.searchFilters = [];
            state.users = {
                list: [],
                totalCount: 0,
                selectedIndices: [],
                searchFilters: [],
            };
            state.userGroupChannels = {
                list: [],
                pageStart: 1,
                pageLimit: 15,
                selectedIndices: [],
                searchFilters: [],
            };
            state.modal = {
                type: '',
                title: '',
                themeColor: 'primary',
            };
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
        ...mutations,
        ...actions,
    };
});
