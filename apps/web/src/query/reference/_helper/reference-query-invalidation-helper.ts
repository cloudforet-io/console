import { queryClient } from '@/query';
import { REFERENCE_PREFIX } from '@/query/reference/_constant/query-key-constant';


export const invalidateReferenceQuery = (mode?: 'ADMIN' | 'WORKSPACE') => {
    queryClient.invalidateQueries({
        predicate: (query) => {
            const [queryMode,,, queryType] = query.queryKey;
            if (queryType !== REFERENCE_PREFIX) return false;
            if (mode && mode !== queryMode) return false;
            return true;
        },
    });
};
