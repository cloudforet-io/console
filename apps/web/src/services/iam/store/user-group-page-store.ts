import { computed, reactive } from 'vue';

import { isEmpty } from 'lodash';
import { defineStore } from 'pinia';

import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { UserGroupChannelListParameters } from '@/schema/alert-manager/user-group-channel/api-verbs/list';
import type { UserGroupChannelModel } from '@/schema/alert-manager/user-group-channel/model';
import type { UserGroupGetParameters } from '@/schema/identity/user-group/api-verbs/get';
import type { UserGroupListParameters } from '@/schema/identity/user-group/api-verbs/list';
import type { UserGroupModel } from '@/schema/identity/user-group/model';
import type { UserGroupListItemType } from '@/schema/identity/user-group/type';
import type { WorkspaceUserListParameters } from '@/schema/identity/workspace-user/api-verbs/list';
import type { WorkspaceUserModel } from '@/schema/identity/workspace-user/model';

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
        list: UserGroupChannelModel[];
        pageStart: number;
        pageLimit: number;
        totalCount: number;
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
            totalCount: 0,
            selectedIndices: [],
            searchFilters: [],
        },
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
                totalCount: 0,
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

                // TODO: need test after getting real data
                const userGroupIdToChannelMap = await this.fetchUserGroupChannels(results.map((result) => result.user_group_id));

                state.userGroups = results.map((item) => ({
                    ...item,
                    notification_channel: userGroupIdToChannelMap[item.user_group_id] || [],
                })) || [];
                state.totalCount = total_count ?? 0;
                state.selectedIndices = [];
            } catch (e) {
                ErrorHandler.handleError(e, true);
                state.userGroups = [];
                state.totalCount = 0;
                throw e;
            }
        },
        async fetchUserGroupChannels(userGroupIds: string[]) {
            const userGroupChannelPromises = userGroupIds.map(async (userGroupId) => {
                const { results = [] } = await SpaceConnector.clientV2.alertManager.userGroupChannel.list<UserGroupChannelListParameters, ListResponse<UserGroupChannelModel>>({
                    user_group_id: userGroupId,
                });
                return { userGroupId, userGroupChannels: results };
            });

            const results = await Promise.all(userGroupChannelPromises);
            return results.reduce((acc, { userGroupId, userGroupChannels }) => {
                acc[userGroupId] = userGroupChannels;
                return acc;
            }, {} as Record<string, any>);
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
        async listUserGroupChannels(params: UserGroupChannelListParameters) {
            try {
                const response = await SpaceConnector.clientV2.alertManager.userGroupChannel.list<UserGroupChannelListParameters, ListResponse<UserGroupChannelModel>>(params);
                state.userGroupChannels.list = response.results || [];
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
        ...actions,
    };
});
