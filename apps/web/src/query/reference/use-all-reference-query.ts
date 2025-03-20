import { computed } from 'vue';

import { useQueryClient } from '@tanstack/vue-query';

import type { PublicDashboardReferenceMap } from '@/query/reference/use-public-dashboard-reference-query';
import { usePublicDashboardReferenceQuery } from '@/query/reference/use-public-dashboard-reference-query';

import type { REFERENCE_TYPE_INFO_MAP } from './_constants/reference-type-map';

export const useAllReferenceQuery = () => {
    const publicDashboardQuery = usePublicDashboardReferenceQuery();
    const queryClient = useQueryClient();

    const getters = {
        publicDashboard: {
            items: computed<PublicDashboardReferenceMap>(() => publicDashboardQuery.data.value?.referenceMap ?? {}),
            typeInfo: computed(() => publicDashboardQuery.data.value),
            isLoading: computed(() => publicDashboardQuery.isFetching.value),
        },
        // TODO: add other reference queries
    };

    const refetch = async (type: keyof typeof REFERENCE_TYPE_INFO_MAP) => {
        switch (type) {
        case 'publicDashboard':
            await publicDashboardQuery.refetch(); break;
        // TODO: add other reference queries
        default:
            throw new Error(`Unsupported reference type: ${type}`);
        }
    };

    const refetchAll = async () => {
        queryClient.invalidateQueries({
            queryKey: ['reference'],
        });
    };

    return {
        getters,
        refetch,
        refetchAll,
    };
};
