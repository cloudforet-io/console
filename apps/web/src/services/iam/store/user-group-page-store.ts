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

export const useUserGroupPageStore = defineStore('page-user-group', {
    state: () => ({
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
    }),
    getters: {
        selectedUsers: (state) => {
            if (state.selectedIndices.length === 1 && !isEmpty(state.selectedUser)) return [state.selectedUser];
            const users: UserListItemType[] = [];
            state.selectedIndices.forEach((d:number) => {
                users.push(state.users[d]);
            });
            return users ?? [];
        },
    },
    actions: {
        updateModalSettings({
            type, title, visible, themeColor,
        }) {
            this.modal.type = type;
            this.modal.title = title;
            this.modal.visible = visible;
            this.modal.themeColor = themeColor;
        },
        closeModal() {
            this.modal = {
                type: '',
                title: '',
                themeColor: 'primary',
                visible: '',
            };
        },
        async listGroups() {
            this.loading = true;

            try {
                const { results, total_count } = await SpaceConnector.clientV2.identity.userGroup.list<UserListParameters, ListResponse<UserGroupModel>>();

                this.groups = results || [];
                this.totalCount = total_count || 0;
                this.selectedIndices = [];
            } catch (e) {
                ErrorHandler.handleError(e);
                this.groups = [];
                this.totalCount = 0;
            } finally {
                this.loading = false;
            }
        },
        async listUsers(params: UserListParameters) {
            this.loading = true;

            try {
                const res = await SpaceConnector.clientV2.identity.user.list<UserListParameters, ListResponse<UserModel>>(params);
                this.users = res.results || [];
                this.totalCount = res.total_count ?? 0;
                this.selectedIndices = [];
            } catch (e) {
                ErrorHandler.handleError(e);
                this.users = [];
                this.totalCount = 0;
                throw e;
            } finally {
                this.loading = false;
            }
        },
    },
});
