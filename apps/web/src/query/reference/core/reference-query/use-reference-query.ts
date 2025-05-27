import { referenceConfigMap } from '@/query/reference/reference-config';
import type { ReferenceFetchInfo, ReferenceKeyType } from '@/query/reference/types/reference-type';

import { useReferenceQueryList } from './use-reference-query-list';
import { useReferenceQueryStat } from './use-reference-query-stat';

export const useReferenceQuery = <T>(
    resourceKey: ReferenceKeyType,
    fetchInfo: ReferenceFetchInfo<T>,
) => {
    if (!referenceConfigMap[resourceKey]) {
        throw new Error(`Invalid reference key: ${resourceKey}`);
    }

    const { listReferenceQuery } = useReferenceQueryList(resourceKey, fetchInfo);
    const { statReferenceQuery } = useReferenceQueryStat(resourceKey, fetchInfo);

    return {
        listReferenceQuery,
        statReferenceQuery,
    };
};


