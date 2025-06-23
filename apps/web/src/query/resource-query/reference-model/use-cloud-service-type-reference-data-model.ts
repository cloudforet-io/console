import { useCloudServiceTypeApi } from '@/api-clients/inventory/cloud-service-type/composables/use-cloud-service-type-api';
import type { CloudServiceTypeModel } from '@/api-clients/inventory/cloud-service-type/schema/model';
import { useReferenceDataModel } from '@/query/resource-query/reference-model/composables/use-reference-data-model';
import type {
    ReferenceDataModelFetchConfig,
    ReferenceItem, ReferenceMap,
} from '@/query/resource-query/reference-model/types/reference-type';
import { RESOURCE_CONFIG_MAP } from '@/query/resource-query/shared/contants/resource-config-map';

import { assetUrlConverter } from '@/lib/helper/asset-helper';


export type CloudServiceTypeReferenceItem = ReferenceItem<CloudServiceTypeModel>;
export type CloudServiceTypeReferenceMap = ReferenceMap<CloudServiceTypeReferenceItem>;

export const useCloudServiceTypeReferenceDataModel = () => {
    const { cloudServiceTypeAPI } = useCloudServiceTypeApi();
    const fetchConfig: ReferenceDataModelFetchConfig<CloudServiceTypeModel> = {
        listFetcher: cloudServiceTypeAPI.list,
        query: {
            only: ['cloud_service_type_id', 'name', 'group', 'provider', 'tags', 'cloud_service_type_key'],
        },
    };

    const {
        referenceMap,
    } = useReferenceDataModel<CloudServiceTypeModel, CloudServiceTypeReferenceItem>(
        RESOURCE_CONFIG_MAP.cloudServiceType.resourceKey,
        (cloudServiceTypeInfo: CloudServiceTypeModel) => ({
            key: cloudServiceTypeInfo.cloud_service_type_id,
            label: `${cloudServiceTypeInfo.group} > ${cloudServiceTypeInfo.name}`,
            name: cloudServiceTypeInfo.name,
            icon: assetUrlConverter(cloudServiceTypeInfo.tags['spaceone:icon']),
            data: {
                provider: cloudServiceTypeInfo.provider,
                group: cloudServiceTypeInfo.group,
                cloud_service_type_key: cloudServiceTypeInfo.cloud_service_type_key,
            },
        }),
        fetchConfig,
    );

    return {
        map: referenceMap,
    };
};
