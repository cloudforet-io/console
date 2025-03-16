import { SERVICE_PREFIX } from '@/api-clients/_common/constants/query-key-constant';
import { queryClient } from '@/query';




export const invalidateServiceQuery = (mode?: 'ADMIN' | 'WORKSPACE') => {
    queryClient.invalidateQueries({
        predicate: (query) => {
            const [queryMode,,, queryType] = query.queryKey;
            if (queryType !== SERVICE_PREFIX) return false;
            if (mode && mode !== queryMode) return false;
            return true;
        },
    });
};
