
import type { ReferenceFetchInfo } from '@/query/reference/types/reference-type';

import type { NamespaceReferenceItem } from '@/store/reference/namespace-reference-store';

import { useNamespaceApi } from '@/api-clients/inventory/namespace/composable/use-namespace-api';
import type { NamespaceModel } from '@/api-clients/inventory/namespace/schema/model';
import { useReferenceModel } from '@/query/reference/_core/use-reference-model';



export const useNamespaceReferenceModel = () => {
    const { namespaceAPI } = useNamespaceApi();

    const fetchInfo: ReferenceFetchInfo<NamespaceModel> = {
        listFetchFn: namespaceAPI.list,
        statFetchFn: namespaceAPI.stat,
        name: 'Namespace',
        idKey: 'namespace_id',
        nameKey: 'name',
        only: ['namespace_id', 'name', 'category', 'icon', 'group', 'resource_type'],
        searchTargets: ['name'],
        nameFormatter: (data: NamespaceModel) => data.name,
    };

    // transform
    const setNamespaceReferenceData = (namespaceInfo: NamespaceModel): NamespaceReferenceItem => ({
        key: namespaceInfo.namespace_id,
        label: namespaceInfo.name,
        name: namespaceInfo.name,
        data: {
            category: namespaceInfo.category,
            icon: namespaceInfo.icon,
            group: namespaceInfo.group,
            resource_type: namespaceInfo.resource_type,
        },
    });

    return useReferenceModel<NamespaceModel, NamespaceReferenceItem>(
        'namespace',
        fetchInfo,
        setNamespaceReferenceData,
    );
};
