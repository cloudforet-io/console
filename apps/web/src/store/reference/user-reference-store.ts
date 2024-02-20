import { asyncComputed } from '@vueuse/core';
import { computed, reactive } from 'vue';

import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { RoleBindingModel } from '@/schema/identity/role-binding/model';
import type { RoleListParameters } from '@/schema/identity/role/api-verbs/list';
import type { RoleModel } from '@/schema/identity/role/model';
import type { UserListParameters } from '@/schema/identity/user/api-verbs/list';
import type { UserModel } from '@/schema/identity/user/model';
import type { WorkspaceUserListParameters } from '@/schema/identity/workspace-user/api-verbs/list';
import type { WorkspaceUserModel } from '@/schema/identity/workspace-user/model';
// eslint-disable-next-line import/no-cycle
import { store } from '@/store';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import type {
    ReferenceLoadOptions, ReferenceItem, ReferenceMap, ReferenceTypeInfo,
} from '@/store/modules/reference/type';

import { MANAGED_VARIABLE_MODEL_CONFIGS } from '@/lib/variable-models/managed-model-config/base-managed-model-config';

import ErrorHandler from '@/common/composables/error/errorHandler';


interface UserResourceItemData {
    roleInfo?: Partial<RoleModel>;
}
type UserReferenceItem = Required<Pick<ReferenceItem<UserResourceItemData>, 'key'|'label'|'name'|'data'>>;
export type UserReferenceMap = ReferenceMap<UserReferenceItem>;

const LOAD_TTL = 1000 * 60 * 60 * 3; // 3 hours
let lastLoadedTime = 0;


// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
interface _UserModel extends UserModel, WorkspaceUserModel {
    role_binding_info?: RoleBindingModel;
}
const _listRole = async (roleIdList: string[]): Promise<RoleModel[]> => {
    try {
        const res = await SpaceConnector.clientV2.identity.role.list<RoleListParameters, ListResponse<RoleModel>>({
            query: {
                only: ['role_id', 'name', 'role_type'],
                filter: [
                    {
                        k: 'role_id',
                        v: roleIdList,
                        o: 'in',
                    },
                ],
            },
        });
        return res?.results ?? [];
    } catch (e) {
        ErrorHandler.handleError(e);
        return [];
    }
};
export const useUserReferenceStore = defineStore('user-reference', () => {
    const appContextStore = useAppContextStore();
    const _state = reactive({
        isAdminMode: computed(() => appContextStore.getters.isAdminMode),
        roleList: [] as RoleModel[],
    });
    const state = reactive({
        items: null as UserReferenceMap | null,
    });

    const getters = reactive({
        userItems: asyncComputed<UserReferenceMap>(async () => {
            if (store.getters['user/getCurrentGrantInfo'].scope === 'USER') return {};
            if (state.items === null) await load();
            return state.items ?? {};
        }, {}, { lazy: true }),
        userTypeInfo: computed<ReferenceTypeInfo>(() => ({
            type: MANAGED_VARIABLE_MODEL_CONFIGS.user.key,
            key: MANAGED_VARIABLE_MODEL_CONFIGS.user.idKey as string,
            name: MANAGED_VARIABLE_MODEL_CONFIGS.user.name,
            referenceMap: getters.userItems,
        })),
    });

    const load = async (options?: ReferenceLoadOptions) => {
        const currentTime = new Date().getTime();
        if (
            ((lastLoadedTime !== 0 && currentTime - lastLoadedTime < LOAD_TTL)
                || (options?.lazyLoad && state.items)
            ) && !options?.force
        ) return;

        const params: UserListParameters = {
            query: {
                only: ['user_id', 'name'],
            },
        };

        const fetcher = _state.isAdminMode
            ? SpaceConnector.clientV2.identity.user.list
            : SpaceConnector.clientV2.identity.workspaceUser.list;
        const res = await fetcher<UserListParameters|WorkspaceUserListParameters, ListResponse<_UserModel>>(params);

        if (_state.isAdminMode) {
            _state.roleList = [];
        } else {
            const roleIdList: string[] = [];
            res.results?.forEach((d) => {
                if (d.role_binding_info?.role_id) roleIdList.push(d.role_binding_info.role_id);
            });
            _state.roleList = await _listRole(roleIdList);
        }
        const referenceMap: UserReferenceMap = {};
        res.results?.forEach((userInfo): void => {
            const roleInfo = _state.roleList.find((d) => d.role_id === userInfo.role_binding_info?.role_id) ?? {};
            referenceMap[userInfo.user_id] = {
                key: userInfo.user_id,
                label: userInfo.name ? `${userInfo.user_id} (${userInfo.name})` : userInfo.user_id,
                name: userInfo.name,
                data: {
                    roleInfo,
                },
            };
        });
        state.items = referenceMap;

        lastLoadedTime = currentTime;
    };

    const sync = async (userInfo: _UserModel) => {
        const roleInfo = _state.roleList.find((d) => d.role_id === userInfo.role_binding_info?.role_id) ?? {};
        state.items = {
            ...state.items,
            [userInfo.user_id]: {
                key: userInfo.user_id,
                label: userInfo.name ? `${userInfo.user_id} (${userInfo.name})` : userInfo.user_id,
                name: userInfo.name,
                data: {
                    roleInfo,
                },
            },
        };
    };

    const flush = () => {
        state.items = null;
        lastLoadedTime = 0;
    };

    const actions = {
        load,
        sync,
        flush,
    };

    return {
        state,
        getters,
        ...actions,
    };
});

