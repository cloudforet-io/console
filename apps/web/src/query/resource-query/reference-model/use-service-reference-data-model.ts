import { useServiceApi } from '@/api-clients/alert-manager/service/composables/use-service-api';
import type { ServiceModel } from '@/api-clients/alert-manager/service/schema/model';
import { useReferenceDataModel } from '@/query/resource-query/reference-model/composables/use-reference-data-model';
import type {
    ReferenceDataModelFetchConfig,
    ReferenceItem, ReferenceMap,
} from '@/query/resource-query/reference-model/types/reference-type';
import { RESOURCE_CONFIG_MAP } from '@/query/resource-query/shared/contants/resource-config-map';


export type ServiceReferenceItem = ReferenceItem<ServiceModel>;
export type ServiceReferenceMap = ReferenceMap<ServiceReferenceItem>;

export const useServiceReferenceDataModel = () => {
    const { serviceAPI } = useServiceApi();
    const fetchConfig: ReferenceDataModelFetchConfig<ServiceModel> = {
        listFetcher: serviceAPI.list,
        query: {
            only: ['name', 'service_id', 'service_key', 'members'],
        },
    };
    const {
        referenceMap,
    } = useReferenceDataModel<ServiceModel, ServiceReferenceItem>(
        RESOURCE_CONFIG_MAP.service.resourceKey,
        (serviceInfo: ServiceModel) => ({
            key: serviceInfo.service_key,
            label: serviceInfo.name,
            name: serviceInfo.service_id,
            data: serviceInfo,
        }),
        fetchConfig,
    );

    return {
        map: referenceMap,
    };
};
