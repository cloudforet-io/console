// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { computed, reactive } from 'vue';

import { isEmpty } from 'lodash';
import { defineStore } from 'pinia';

import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { UserGroupChannelModel } from '@/api-clients/alert-manager/user-group-channel/schema/model';
import type { UserGroupGetParameters } from '@/api-clients/identity/user-group/schema/api-verbs/get';
import type { UserGroupListParameters } from '@/api-clients/identity/user-group/schema/api-verbs/list';
import type { UserGroupModel } from '@/api-clients/identity/user-group/schema/model';
import type { UserGroupListItemType } from '@/api-clients/identity/user-group/schema/type';
import type { WorkspaceUserListParameters } from '@/api-clients/identity/workspace-user/schema/api-verbs/list';
import type { WorkspaceUserModel } from '@/api-clients/identity/workspace-user/schema/model';

import ErrorHandler from '@/common/composables/error/errorHandler';

import type { ModalState } from '@/services/iam/types/user-group-type';
import type { UserListItemType } from '@/services/iam/types/user-type';

interface UserGroupPageState {
    loading: boolean;
    userGroups: UserGroupListItemType[];
    selectedUserGroup: UserGroupListItemType | undefined;
    totalCount: number;
    selectedIndices: number[];
    pageStart: number;
    pageLimit: number;
    searchFilters: ConsoleFilter[];
    users: {
        list: UserListItemType[];
        pageStart: number;
        pageLimit: number;
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
}

export const useUserGroupPageStore = defineStore('page-user-group', () => {
    const state = reactive<UserGroupPageState>({
        loading: true,
        userGroups: [],
        selectedUserGroup: undefined,
        totalCount: 0,
        selectedIndices: [],
        pageStart: 1,
        pageLimit: 15,
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
    });
    const mutations = {
        selectedUserGroupChannelIdx(index: number[]) {
            state.userGroupChannels.selectedIndices = index;
        },
        setSelectedUserGroupChannel(list: UserGroupChannelModel[]) {
            state.userGroupChannels.list = list;
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
            if (state.userGroupChannels.selectedIndices.length > 0) {
                userGroupChannels.push(state.userGroupChannels.list[state.userGroupChannels.selectedIndices[0]]);
            }
            return userGroupChannels ?? [];
        }),
    });
    const actions = {
        reset() {
            state.loading = true;
            state.userGroups = [];
            state.selectedUserGroup = undefined;
            state.totalCount = 0;
            state.selectedIndices = [];
            state.pageStart = 1;
            state.pageLimit = 15;
            state.searchFilters = [];
            state.users = {
                list: [],
                pageStart: 1,
                pageLimit: 15,
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
        async listUserGroups(params: UserGroupListParameters) {
            try {
                const { results = [], total_count = 0 } = await SpaceConnector.clientV2.identity.userGroup.list<UserGroupListParameters, ListResponse<UserGroupModel>>(params);

                state.userGroups = results || [];
                state.totalCount = total_count ?? 0;
            } catch (e) {
                ErrorHandler.handleError(e, true);
                state.userGroups = [];
                state.totalCount = 0;
                throw e;
            }
        },
        async getUserGroup(params: UserGroupGetParameters) {
            try {
                const response = await SpaceConnector.clientV2.identity.userGroup.get<UserGroupGetParameters, UserGroupModel>(params);
                state.selectedUserGroup = response;
            } catch (e) {
                ErrorHandler.handleError(e, true);
                state.userGroups = [];
                state.totalCount = 0;
                throw e;
            }
        },
        async listUsers(params: WorkspaceUserListParameters) {
            try {
                const response = await SpaceConnector.clientV2.identity.workspaceUser.list<WorkspaceUserListParameters, ListResponse<WorkspaceUserModel>>(params);
                state.users.list = response.results || [];
            } catch (e) {
                ErrorHandler.handleError(e, true);
            }
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
