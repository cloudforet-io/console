import { useNamespaceApi } from '@/api-clients/inventory/namespace/composables/use-namespace-api';
import type { NamespaceModel } from '@/api-clients/inventory/namespace/schema/model';
import { useReferenceDataModel } from '@/query/resource-query/reference-model/composables/use-reference-data-model';
import type {
    ReferenceDataModelFetchConfig,
    ReferenceItem, ReferenceMap,
} from '@/query/resource-query/reference-model/types/reference-type';
import { RESOURCE_CONFIG_MAP } from '@/query/resource-query/shared/contants/resource-config-map';


export type NamespaceReferenceItem = ReferenceItem<NamespaceModel>;
export type NamespaceReferenceMap = ReferenceMap<NamespaceReferenceItem>;

export const useNamespaceReferenceDataModel = () => {
    const { namespaceAPI } = useNamespaceApi();
    const fetchConfig: ReferenceDataModelFetchConfig<NamespaceModel> = {
        listFetcher: namespaceAPI.list,
        query: {
            only: ['namespace_id', 'name', 'category', 'icon', 'group', 'resource_type'],
        },
    };

    const {
        referenceMap,
    } = useReferenceDataModel<NamespaceModel, NamespaceReferenceItem>(
        RESOURCE_CONFIG_MAP.namespace.resourceKey,
        (namespaceInfo: NamespaceModel) => ({
            key: namespaceInfo.namespace_id,
            label: namespaceInfo.name,
            name: namespaceInfo.name,
            data: {
                category: namespaceInfo.category,
                icon: namespaceInfo.icon,
                group: namespaceInfo.group,
                resource_type: namespaceInfo.resource_type,
            },
        }),
        fetchConfig,
    );

    return {
        map: referenceMap,
    };
};
