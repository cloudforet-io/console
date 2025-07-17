import { useWorkspaceUserApi } from '@/api-clients/identity/workspace-user/composables/use-workspace-user-api';
import type { WorkspaceUserModel } from '@/api-clients/identity/workspace-user/schema/model';
import { useRoleReferenceDataModel } from '@/query/resource-query/reference-data-model/adaptors/implementations/use-role-reference-data-model';
import { useReferenceDataModel } from '@/query/resource-query/reference-data-model/composables/use-reference-data-model';
import type {
    ReferenceDataModelFetchConfig,
    ReferenceItem, ReferenceMap,
} from '@/query/resource-query/reference-data-model/types/reference-type';
import { RESOURCE_CONFIG_MAP } from '@/query/resource-query/shared/contants/resource-config-map';
import { makeResourceProxy } from '@/query/resource-query/shared/utils/resource-proxy-helper';


export type WorkspaceUserReferenceItem = ReferenceItem<WorkspaceUserModel>;
export type WorkspaceUserReferenceMap = ReferenceMap<WorkspaceUserReferenceItem>;

export const useWorkspaceUserReferenceDataModel = () => {
    const { map: roleReferenceMap } = useRoleReferenceDataModel();

    const { workspaceUserAPI } = useWorkspaceUserApi();
    const fetchConfig: ReferenceDataModelFetchConfig<WorkspaceUserModel> = {
        listFetcher: workspaceUserAPI.list,
        query: {
            only: [
                'user_id', 'name',
                // 'role_binding_info'
            ],
        },
    };

    const {
        referenceMap,
    } = useReferenceDataModel<WorkspaceUserModel, WorkspaceUserReferenceItem>(
        RESOURCE_CONFIG_MAP.workspaceUser.resourceKey,
        (workspaceUserInfo: WorkspaceUserModel) => ({
            key: workspaceUserInfo.user_id,
            label: workspaceUserInfo.name ? `${workspaceUserInfo.user_id} (${workspaceUserInfo.name})` : workspaceUserInfo.user_id,
            name: workspaceUserInfo.name,
            data: workspaceUserInfo,
        }),
        fetchConfig,
    );

    const userReferenceProxyMap = makeResourceProxy<WorkspaceUserReferenceMap>({} as WorkspaceUserReferenceMap, (_, id: string) => {
        const _userInfo = referenceMap[id];
        if (!_userInfo || !_userInfo.data?.role_binding_info?.role_id) return _userInfo;
        const roleInfo = roleReferenceMap[_userInfo.data?.role_binding_info?.role_id]?.data;
        if (!roleInfo) return _userInfo;

        return {
            key: _userInfo.key,
            label: _userInfo.name ? `${_userInfo.key} (${_userInfo.name})` : _userInfo.key,
            name: _userInfo.name,
            data: {
                ..._userInfo.data,
                roleInfo,
            },
        };
    });

    return {
        map: userReferenceProxyMap,
    };
};
