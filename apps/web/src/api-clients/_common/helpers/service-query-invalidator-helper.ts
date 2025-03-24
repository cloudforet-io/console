import { queryClient } from '@/query';

export const invalidateServiceQuery = async (mode: 'admin' | 'workspace') => {
    await queryClient.invalidateQueries({
        queryKey: ['service', mode],
    });
};
