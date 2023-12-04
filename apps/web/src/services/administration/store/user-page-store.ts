import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import type { Query } from '@cloudforet/core-lib/space-connector/type';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { UserListParameters } from '@/schema/identity/user/api-verbs/list';
import type { UserModel } from '@/schema/identity/user/model';
import { store } from '@/store';

import ErrorHandler from '@/common/composables/error/errorHandler';



export const useUserPageStore = defineStore('user-page', {
    state: () => ({
        loading: false,
        modalLoading: false,
        users: [] as UserModel[],
        totalCount: 0,
        selectedIndices: [],
        visibleStatusModal: false,
        visibleCreateModal: false,
        visibleUpdateModal: false,
    }),
    getters: {
        timezone: () => store.state.user.timezone || 'UTC',
        selectedUsers: (state): UserModel[] => {
            const users = [] as UserModel[];
            state.selectedIndices.forEach((d) => {
                users.push(state.users[d]);
            });
            return users ?? [];
        },
    },
    actions: {
        async listUsers(apiQuery: Query) {
            this.loading = true;
            try {
                const res = await SpaceConnector.clientV2.identity.user.list<UserListParameters, ListResponse<UserModel>>({
                    query: apiQuery,
                });
                this.users = res.results || [];
                // TODO: api_key_count, role_name
                // this.users = res.results?.map((d) => ({
                //     ...d,
                //     // api_key_count: d.api_key_count || 0,
                //     // user_type: getUserType(d.user_type),
                //     // role_name: (_getArrayWithNotDuplicatedItem(d.role_bindings.map((data) => data.role_info.name))).join(', '),
                //     // last_accessed_at: calculateTime(d.last_accessed_at, this.timezone),
                // })) ?? [];
                this.totalCount = res.total_count ?? 0;
                this.selectedIndices = [];
            } catch (e) {
                ErrorHandler.handleError(e);
                this.users = [];
                this.totalCount = 0;
            } finally {
                this.loading = false;
            }
        },
    },
});
