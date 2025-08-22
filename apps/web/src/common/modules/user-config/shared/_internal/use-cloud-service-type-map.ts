import { computed } from 'vue';

import { useCloudServiceTypeApi } from '@/api-clients/inventory/cloud-service-type/composables/use-cloud-service-type-api';
import type { CloudServiceTypeModel } from '@/api-clients/inventory/cloud-service-type/schema/model';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { useScopedQuery } from '@/query/service-query/use-scoped-query';

export const useCloudServiceTypeMap = () => {
    const { cloudServiceTypeAPI } = useCloudServiceTypeApi();

    const { key, params } = useServiceQueryKey('inventory', 'cloud-service-type', 'list', {
        params: {
            query: {
                only: ['name', 'group', 'provider', 'cloud_service_type_key', 'tags'],
            },
        },
    });
    const { data: cloudServiceTypeList, isFetching: isFetchingCloudServiceTypeList } = useScopedQuery({
        queryKey: key,
        queryFn: () => cloudServiceTypeAPI.list(params.value),
        select: (data) => data.results || [],
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 10,
    }, ['WORKSPACE']);


    return {
        map: computed(() => {
            const cloudServiceTypeMap = new Map<string, CloudServiceTypeModel>();
            cloudServiceTypeList.value?.forEach((d) => {
                cloudServiceTypeMap.set(d.cloud_service_type_key, d);
            });

            return cloudServiceTypeMap;
        }),
        loading: isFetchingCloudServiceTypeList,
    };
};
