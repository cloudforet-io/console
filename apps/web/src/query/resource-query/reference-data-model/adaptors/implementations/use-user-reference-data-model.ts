import { useUserApi } from '@/api-clients/identity/user/composables/use-user-api';
import type { UserModel } from '@/api-clients/identity/user/schema/model';
import { useReferenceDataModel } from '@/query/resource-query/reference-data-model/composables/use-reference-data-model';
import type {
    ReferenceDataModelFetchConfig,
    ReferenceItem, ReferenceMap,
} from '@/query/resource-query/reference-data-model/types/reference-type';
import { RESOURCE_CONFIG_MAP } from '@/query/resource-query/shared/contants/resource-config-map';



export type UserReferenceItem = ReferenceItem<UserModel>;
export type UserReferenceMap = ReferenceMap<UserReferenceItem>;

export const useUserReferenceDataModel = () => {
    const { userAPI } = useUserApi();
    const fetchConfig: ReferenceDataModelFetchConfig<UserModel> = {
        listFetcher: userAPI.list,
        query: {
            only: ['user_id', 'name'],
        },
    };

    const {
        referenceMap,
    } = useReferenceDataModel<UserModel, UserReferenceItem>(
        RESOURCE_CONFIG_MAP.user.resourceKey,
        (userInfo: UserModel) => ({
            key: userInfo.user_id,
            label: userInfo.name ? `${userInfo.user_id} (${userInfo.name})` : userInfo.user_id,
            name: userInfo.name,
        }),
        fetchConfig,
    );

    return {
        map: referenceMap,
    };
};
