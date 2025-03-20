import { queryClient } from '@/query';

export const invalidateReferenceQuery = async (mode: 'admin' | 'workspace') => {
    await queryClient.invalidateQueries({
        queryKey: ['reference', mode],
    });
};
