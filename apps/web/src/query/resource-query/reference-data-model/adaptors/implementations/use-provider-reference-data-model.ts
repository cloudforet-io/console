import { useProviderApi } from '@/api-clients/identity/provider/composables/use-provider-api';
import type { ProviderModel } from '@/api-clients/identity/provider/schema/model';
import { useReferenceDataModel } from '@/query/resource-query/reference-data-model/composables/use-reference-data-model';
import type { ReferenceDataModelImplementationAdaptor } from '@/query/resource-query/reference-data-model/types/reference-data-model.adaptor';
import type {
    ReferenceDataModelFetchConfig,
    ReferenceItem, ReferenceMap,
} from '@/query/resource-query/reference-data-model/types/reference-type';
import { RESOURCE_CONFIG_MAP } from '@/query/resource-query/shared/contants/resource-config-map';

import { assetUrlConverter } from '@/lib/helper/asset-helper';

import { indigo } from '@/styles/colors';


export type ProviderReferenceItem = ReferenceItem<ProviderModel>;
export type ProviderReferenceMap = ReferenceMap<ProviderReferenceItem>;

export const useProvodierReferenceDataModel: ReferenceDataModelImplementationAdaptor<ProviderReferenceItem> = () => {
    const { providerAPI } = useProviderApi();
    const fetchConfig: ReferenceDataModelFetchConfig<ProviderModel> = {
        listFetcher: providerAPI.list,
        query: {
            only: ['provider', 'name', 'icon', 'alias', 'color', 'options', 'plugin_info'],
        },
    };

    const {
        referenceMap,
    } = useReferenceDataModel<ProviderModel, ProviderReferenceItem>(
        RESOURCE_CONFIG_MAP.provider.resourceKey,
        (providerInfo: ProviderModel) => ({
            key: providerInfo.provider,
            label: providerInfo.alias || providerInfo.name,
            name: providerInfo.name,
            icon: assetUrlConverter(providerInfo.icon),
            color: providerInfo.color || indigo[400],
            data: providerInfo,
        }),
        fetchConfig,
    );

    return {
        map: referenceMap,
    };
};
