import type { ComputedRef } from 'vue';
import { computed } from 'vue';

import { usePublicDashboardReferenceQuery } from '@/query/reference/use-public-dashboard-reference-query';

import type { REFERENCE_TYPE_MAP } from './_constants/reference-type-map';

interface ReferenceGetters {
    publicDashboard: {
        items: ComputedRef<Record<string, unknown>>;
        typeInfo: ComputedRef<unknown>;
        status: ComputedRef<{
            isLoading: boolean;
            isError: boolean;
        }>;
    };
}

export const useAllReferenceQuery = () => {
    const publicDashboardQuery = usePublicDashboardReferenceQuery();

    const getters = {
        publicDashboard: {
            items: computed(() => publicDashboardQuery.data.value?.referenceMap),
            typeInfo: computed(() => publicDashboardQuery.data.value),
            status: computed(() => ({
                isLoading: publicDashboardQuery.isPending.value,
                isError: publicDashboardQuery.isError.value,
            })),
        },
        // TODO: add other reference queries
    };

    const refetch = async (type: keyof typeof REFERENCE_TYPE_MAP) => {
        switch (type) {
        case 'publicDashboard':
            await publicDashboardQuery.refetch(); break;
        // TODO: add other reference queries
        default:
            throw new Error(`Unsupported reference type: ${type}`);
        }
    };

    return {
        getters,
        refetch,
    };
};
