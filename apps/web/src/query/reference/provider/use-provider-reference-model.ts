import { useProviderApi } from '@/api-clients/identity/provider/composables/use-provider-api';
import type { ProviderModel } from '@/api-clients/identity/provider/schema/model';
import { useReferenceModel } from '@/query/reference/core/use-reference-model';
import type { ReferenceFetchInfo } from '@/query/reference/types/reference-type';

import type { ProviderItem } from '@/store/reference/provider-reference-store';

import { assetUrlConverter } from '@/lib/helper/asset-helper';

import { indigo } from '@/styles/colors';




export const useProviderReferenceModel = () => {
    const { providerAPI } = useProviderApi();

    const fetchInfo: ReferenceFetchInfo<ProviderModel> = {
        listFetchFn: providerAPI.list,
        name: 'Provider',
        idKey: 'provider',
        nameKey: 'name',
        only: ['provider', 'name', 'icon', 'alias', 'color', 'options', 'plugin_info'],
        searchTargets: ['name'],
        nameFormatter: (data: ProviderModel) => data.name,
    };

    // transform
    const setProviderReferenceData = (providerInfo: ProviderModel): ProviderItem => ({
        key: providerInfo.provider,
        label: providerInfo.alias || providerInfo.name,
        name: providerInfo.name,
        icon: assetUrlConverter(providerInfo.icon),
        color: providerInfo.color || indigo[400],
        data: providerInfo,
    });

    return useReferenceModel<ProviderModel, ProviderItem>(
        'provider',
        fetchInfo,
        setProviderReferenceData,
    );
};
