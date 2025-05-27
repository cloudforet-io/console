import { computed } from 'vue';


import { useReferenceFullList } from '@/query/reference/core/reference-list/use-reference-full-list';
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
    const { referenceList, isFetching } = useReferenceFullList(
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
        map: referenceMap,
        allItems: referenceList,
        fetchList: listReferenceQuery,
        fetchStat: statReferenceQuery,
        loading: computed(() => isFetching.value || referenceList.value.length === 0),
    };
};
