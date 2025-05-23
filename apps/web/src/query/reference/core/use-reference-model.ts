import { computed } from 'vue';


import { useReferenceList } from '@/query/reference/core/reference-list/use-reference-list';
import { useReferenceMap } from '@/query/reference/core/reference-map/use-reference-map';
import { useReferenceQuery } from '@/query/reference/core/reference-query/use-reference-query';
import type { ReferenceFetchInfo, ReferenceKeyType } from '@/query/reference/types/reference-type';

export const useReferenceModel = <T, R extends Record<string, any>>(
    resourceKey: ReferenceKeyType,
    fetchInfo: ReferenceFetchInfo<T>,
    transform: (item: T) => R,
) => {
    const { referenceMap } = useReferenceMap(
        resourceKey,
        fetchInfo,
        transform,
    );
    const { referenceList, isFetching } = useReferenceList(
        resourceKey,
        fetchInfo,
        transform,
    );

    const {
        listReferenceQuery,
        statReferenceQuery,
    } = useReferenceQuery(
        resourceKey,
        fetchInfo,
    );

    return {
        referenceMap,
        referenceList,
        listReferenceQuery,
        statReferenceQuery,
        loading: computed(() => isFetching.value || referenceList.value.length === 0),
    };
};
