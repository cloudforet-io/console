import { queryClient } from '@/query';
import type { QueryContext } from '@/query/_types/query-key-type';

/**
 * Invalidates all reference queries based on the specified mode.
 *
 * @param mode - Optional mode filter ('ADMIN' | 'WORKSPACE')
 */
export const invalidateReferenceQuery = async (mode?: 'admin' | 'workspace') => {
    await queryClient.invalidateQueries({
        predicate: (query) => {
            const [queryContext] = query.queryKey as [QueryContext, ...unknown[]];
            if (!queryContext || queryContext.context !== 'reference') return false;
            if (mode && mode !== queryContext.mode) return false;
            return true;
        },
    });
};
