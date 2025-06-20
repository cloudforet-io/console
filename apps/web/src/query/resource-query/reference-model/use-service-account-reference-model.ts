import { useServiceAccountApi } from '@/api-clients/identity/service-account/composables/use-service-account-api';
import type { ServiceAccountModel } from '@/api-clients/identity/service-account/schema/model';
import { useReferenceDataModel } from '@/query/resource-query/reference-model/composables/use-reference-data-model';
import type {
    ReferenceDataModelFetchConfig,
    ReferenceItem, ReferenceMap,
} from '@/query/resource-query/reference-model/types/reference-type';
import { RESOURCE_CONFIG_MAP } from '@/query/resource-query/shared/contants/resource-config-map';



export type ServiceAccountReferenceItem = ReferenceItem<ServiceAccountModel>;
export type ServiceAccountReferenceMap = ReferenceMap<ServiceAccountReferenceItem>;

export const useServiceAccountReferenceModel = () => {
    const { serviceAccountAPI } = useServiceAccountApi();
    const fetchConfig: ReferenceDataModelFetchConfig<ServiceAccountModel> = {
        listFetcher: serviceAccountAPI.list,
        query: {
            only: ['service_account_id', 'name', 'provider', 'data'],
        },
    };

    const {
        referenceMap,
    } = useReferenceDataModel<ServiceAccountModel, ServiceAccountReferenceItem>(
        RESOURCE_CONFIG_MAP.serviceAccount.resourceKey,
        (serviceAccountInfo: ServiceAccountModel) => ({
            key: serviceAccountInfo.service_account_id,
            label: serviceAccountInfo.name,
            name: serviceAccountInfo.name,
            provider: serviceAccountInfo.provider,
            data: serviceAccountInfo.data,
        }),
        fetchConfig,
    );

    return {
        map: referenceMap,
    };
};
