import { useCollectorApi } from '@/api-clients/inventory/collector/composables/use-collector-api';
import type { CollectorModel } from '@/api-clients/inventory/collector/schema/model';
import { useReferenceDataModel } from '@/query/resource-query/reference-data-model/composables/use-reference-data-model';
import type { ReferenceDataModelImplementationAdaptor } from '@/query/resource-query/reference-data-model/types/reference-data-model.adaptor';
import type {
    ReferenceDataModelFetchConfig,
    ReferenceItem, ReferenceMap,
} from '@/query/resource-query/reference-data-model/types/reference-type';
import { RESOURCE_CONFIG_MAP } from '@/query/resource-query/shared/contants/resource-config-map';

import { assetUrlConverter } from '@/lib/helper/asset-helper';


export type CollectorReferenceItem = ReferenceItem<CollectorModel>;
export type CollectorReferenceMap = ReferenceMap<CollectorReferenceItem>;

export const useCollectorReferenceDataModel: ReferenceDataModelImplementationAdaptor<CollectorReferenceItem> = () => {
    const { collectorAPI } = useCollectorApi();
    const fetchConfig: ReferenceDataModelFetchConfig<CollectorModel> = {
        listFetcher: collectorAPI.list,
        query: {
            only: ['collector_id', 'name', 'tags'],
        },
    };

    const {
        referenceMap,
    } = useReferenceDataModel<CollectorModel, CollectorReferenceItem>(
        RESOURCE_CONFIG_MAP.collector.resourceKey,
        (collectorInfo: CollectorModel) => ({
            key: collectorInfo.collector_id,
            label: collectorInfo.name,
            name: collectorInfo.name,
            icon: assetUrlConverter(collectorInfo.tags.icon),
        }),
        fetchConfig,
    );

    return {
        map: referenceMap,
    };
};
