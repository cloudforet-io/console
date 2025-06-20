import { computed } from 'vue';

import { useUserApi } from '@/api-clients/identity/user/composables/use-user-api';
import type { UserModel } from '@/api-clients/identity/user/schema/model';
import { useWorkspaceUserApi } from '@/api-clients/identity/workspace-user/composables/use-workspace-user-api';
import type { WorkspaceUserModel } from '@/api-clients/identity/workspace-user/schema/model';
import { useReferenceDataModel } from '@/query/resource-query/reference-model/composables/use-reference-data-model';
import type {
    ReferenceDataModelFetchConfig,
    ReferenceItem, ReferenceMap,
} from '@/query/resource-query/reference-model/types/reference-type';
import { useRoleReferenceDataModel } from '@/query/resource-query/reference-model/use-role-reference-data-model';
import { makeReferenceProxy } from '@/query/resource-query/reference-model/utils/reference-proxy-helper';
import { RESOURCE_CONFIG_MAP } from '@/query/resource-query/shared/contants/resource-config-map';

import { useAppContextStore } from '@/store/app-context/app-context-store';


export type UserReferenceItem = ReferenceItem<UserModel|WorkspaceUserModel>;
export type UserReferenceMap = ReferenceMap<UserReferenceItem>;

export const useUserReferenceDataModel = () => {
    const appContextStore = useAppContextStore();
    const isAdminMode = computed(() => appContextStore.getters.isAdminMode);
    const { map: roleReferenceMap } = useRoleReferenceDataModel();

    const { userAPI } = useUserApi();
    const { workspaceUserAPI } = useWorkspaceUserApi();
    const fetchConfig: ReferenceDataModelFetchConfig<UserModel|WorkspaceUserModel> = {
        listFetcher: isAdminMode.value ? userAPI.list : workspaceUserAPI.list,
        query: {
            only: ['user_id', 'name', 'role_binding_info'],
        },
    };

    const {
        referenceMap,
    } = useReferenceDataModel<UserModel|WorkspaceUserModel, UserReferenceItem>(
        RESOURCE_CONFIG_MAP.user.resourceKey,
        (userInfo: UserModel|WorkspaceUserModel) => {
            if ('role_binding_info' in userInfo) {
                return {
                    key: userInfo.user_id,
                    label: userInfo.name ? `${userInfo.user_id} (${userInfo.name})` : userInfo.user_id,
                    name: userInfo.name,
                    data: {
                        roleInfo: {
                            role_id: userInfo.role_binding_info?.role_id,
                        },
                    },
                };
            }
            return {
                key: userInfo.user_id,
                label: userInfo.name ? `${userInfo.user_id} (${userInfo.name})` : userInfo.user_id,
                name: userInfo.name,
            };
        },
        fetchConfig,
    );

    const userReferenceProxyMap = makeReferenceProxy<UserReferenceMap>({} as UserReferenceMap, (_, id: string) => {
        const user = referenceMap[id];
        if (isAdminMode.value) return user;
        const _userInfo = user as WorkspaceUserModel|undefined;
        if (!_userInfo) return user;
        const roleInfo = roleReferenceMap[_userInfo?.role_binding_info?.role_id]?.data;
        if (!roleInfo) return user;

        return {
            key: _userInfo.user_id,
            label: _userInfo.name ? `${_userInfo.user_id} (${_userInfo.name})` : _userInfo.user_id,
            name: _userInfo.name,
            data: {
                roleInfo,
            },
        };
    });

    return {
        map: userReferenceProxyMap,
    };
};
