import { computed, reactive } from 'vue';

import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import type { Query } from '@cloudforet/core-lib/space-connector/type';

import { store } from '@/store';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { calculateTime } from '@/services/administration/iam/user/lib/helper';
import type { User, UserType } from '@/services/administration/iam/user/type';
import { USER_TYPE } from '@/services/administration/iam/user/type';


export const useUserPageStore = defineStore('user-page', () => {
    const state = reactive({
        loading: false,
        users: [] as User[],
        totalCount: 0,
        selectedIndices: [],
        visibleManagementModal: false,
        visibleCreateModal: false,
        visibleUpdateModal: false,
    });

    const getters = reactive({
        timezone: computed(() => store.state.user.timezone || 'UTC'),
        selectedUsers: computed(() => {
            const users = [] as User[];
            state.selectedIndices.map((d) => users.push(state.users[d]));
            return users;
        }) || [],
    });

    /* Actions */
    const _getArrayWithNotDuplicatedItem = (array) => [...new Set(array)];
    const _getUserType = (userType: UserType) => {
        let formattedUserType;
        if (userType === USER_TYPE.API_USER) formattedUserType = 'API Only';
        else formattedUserType = 'Console, API';
        return formattedUserType;
    };
    const listUsers = async (apiQuery: Query) => {
        state.loading = true;
        try {
            const res = await SpaceConnector.client.identity.user.list({
                query: apiQuery,
                only: ['user_id', 'name', 'email', 'state', 'timezone', 'user_type', 'backend', 'last_accessed_at', 'api_key_count', 'tags'],
                include_role_binding: true,
            });
            state.users = res.results.map((d) => ({
                ...d,
                api_key_count: d.api_key_count || 0,
                user_type: _getUserType(d.user_type),
                role_name: (_getArrayWithNotDuplicatedItem(d.role_bindings.map((data) => data.role_info.name))).join(', '),
                last_accessed_at: calculateTime(d.last_accessed_at, getters.timezone),
            }));
            state.totalCount = res.total_count;
            state.selectedIndices = [];
        } catch (e) {
            ErrorHandler.handleError(e);
            state.users = [];
            state.totalCount = 0;
        } finally {
            state.loading = false;
        }
    };

    return {
        state,
        getters,
        listUsers,
    };
});
