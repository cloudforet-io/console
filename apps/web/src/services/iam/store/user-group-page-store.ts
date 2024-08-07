import { reactive, computed } from 'vue';

import { isEmpty } from 'lodash';
import { defineStore } from 'pinia';

import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { UserGroupModel } from '@/schema/identity/user-group/model';
import type { UserListParameters } from '@/schema/identity/user/api-verbs/list';
import type { UserModel } from '@/schema/identity/user/model';

import ErrorHandler from '@/common/composables/error/errorHandler';

import type { UserListItemType } from '@/services/iam/types/user-type';


export const useUserGroupPageStore = defineStore('page-user-group', () => {
    const state = reactive<any>({
        users: [] as UserListItemType[],
        selectedUser: {} as UserListItemType,
        loading: false,
        groups: [] as UserGroupModel[],
        searchFilters: [] as ConsoleFilter[],
        totalCount: 0,
        selectedIndices: [] as number[],
        pageStart: 1,
        pageLimit: 15,
        modal: {
            type: '',
            title: '',
            themeColor: 'primary',
            visible: '',
        },
    });

    const getters = reactive({
        selectedUsers: computed<any>(() => {
            if (state.selectedIndices.length === 1 && !isEmpty(state.selectedUser)) return [state.selectedUser];
            const users: UserListItemType[] = [];
            state.selectedIndices.forEach((d:number) => {
                users.push(state.users[d]);
            });
            return users ?? [];
        }),
    });

    const actions = {
        updateModalSettings: ({
            type, title, visible, themeColor,
        }) => {
            state.modal.type = type;
            state.modal.title = title;
            state.modal.visible = visible;
            state.modal.themeColor = themeColor;
        },
        closeModal: () => {
            state.modal = {
                type: '',
                title: '',
                themeColor: 'primary',
                visible: '',
            };
        },
        listGroups: async () => {
            state.loading = true;

            try {
                const { results, total_count } = await SpaceConnector.clientV2.identity.userGroup.list<UserListParameters, ListResponse<UserGroupModel>>();

                state.groups = results || [];
                state.totalCount = total_count || 0;
                state.selectedIndices = [];
            } catch (e) {
                ErrorHandler.handleError(e);
                state.groups = [];
                state.totalCount = 0;
            } finally {
                state.loading = false;
            }
        },
        listUsers: async (params: UserListParameters) => {
            state.loading = true;

            try {
                const res = await SpaceConnector.clientV2.identity.user.list<UserListParameters, ListResponse<UserModel>>(params);
                state.users = res.results || [];
                state.totalCount = res.total_count ?? 0;
                state.selectedIndices = [];
            } catch (e) {
                ErrorHandler.handleError(e);
                state.users = [];
                state.totalCount = 0;
                throw e;
            } finally {
                state.loading = false;
            }
        },
    };

    return {
        state,
        getters,
        ...actions,
    };
});
