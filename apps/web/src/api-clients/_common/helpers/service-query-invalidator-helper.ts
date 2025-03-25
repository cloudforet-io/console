import { apiQueryClient } from '@/query/clients';

export const invalidateServiceQuery = async (mode: 'admin' | 'workspace') => {
    await apiQueryClient.invalidateQueries({
        queryKey: ['service', mode],
    });
};
