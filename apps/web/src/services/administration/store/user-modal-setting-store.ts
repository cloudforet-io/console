import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { RoleListParameters } from '@/schema/identity/role/api-verbs/list';
import type { RoleModel } from '@/schema/identity/role/model';
import type { UserListParameters } from '@/schema/identity/user/api-verbs/list';
import type { UserModel } from '@/schema/identity/user/model';

import ErrorHandler from '@/common/composables/error/errorHandler';

export const useUserModalSettingStore = defineStore('user-modal-setting', {
    state: () => ({
        loading: false,
        mode: '',
        title: '',
        themeColor: 'primary',
        users: [] as UserModel[],
        visible: {
            additional: false,
            form: false,
            status: false,
        },
    }),
    getters: {
    },
    actions: {
        async listUsers(params: UserListParameters) {
            try {
                const res = await SpaceConnector.clientV2.identity.user.list<UserListParameters, ListResponse<UserModel>>(params);
                this.users = res.results || [];
            } catch (e) {
                ErrorHandler.handleError(e);
                this.users = [];
                throw e;
            }
        },
        async listRoles(params: RoleListParameters) {
            this.loading = true;
            try {
                const { results } = await SpaceConnector.clientV2.identity.role.list<RoleListParameters, ListResponse<RoleModel>>(params);
                return results || [];
            } catch (e) {
                ErrorHandler.handleError(e);
                return [];
            } finally {
                this.loading = false;
            }
        },
    },
});
