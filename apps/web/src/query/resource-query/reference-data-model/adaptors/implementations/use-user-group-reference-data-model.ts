import { useUserGroupApi } from '@/api-clients/identity/user-group/composables/use-user-group-api';
import type { UserGroupModel } from '@/api-clients/identity/user-group/schema/model';
import { useReferenceDataModel } from '@/query/resource-query/reference-data-model/composables/use-reference-data-model';
import type { ReferenceDataModelImplementationAdaptor } from '@/query/resource-query/reference-data-model/types/reference-data-model.adaptor';
import type {
    ReferenceDataModelFetchConfig,
    ReferenceItem, ReferenceMap,
} from '@/query/resource-query/reference-data-model/types/reference-type';
import { RESOURCE_CONFIG_MAP } from '@/query/resource-query/shared/contants/resource-config-map';


export type UserGroupReferenceItem = ReferenceItem<UserGroupModel>;
export type UserGroupReferenceMap = ReferenceMap<UserGroupReferenceItem>;

export const useUserGroupReferenceDataModel: ReferenceDataModelImplementationAdaptor<UserGroupReferenceItem> = () => {
    const { userGroupAPI } = useUserGroupApi();
    const fetchConfig: ReferenceDataModelFetchConfig<UserGroupModel> = {
        listFetcher: userGroupAPI.list,
        query: {
            only: ['user_group_id', 'name', 'users'],
        },
    };

    const {
        referenceMap,
    } = useReferenceDataModel<UserGroupModel, UserGroupReferenceItem>(
        RESOURCE_CONFIG_MAP.userGroup.resourceKey,
        (userGroupInfo: UserGroupModel) => ({
            key: userGroupInfo.user_group_id,
            label: userGroupInfo.name,
            name: userGroupInfo.name,
            data: userGroupInfo,
        }),
        fetchConfig,
    );

    return {
        map: referenceMap,
    };
};
