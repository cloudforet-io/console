import { QueryClient, useQueryClient } from '@tanstack/vue-query';
import type * as VueQuery from '@tanstack/vue-query';
import {
    describe, it, expect, vi, beforeEach,
} from 'vitest';

import { resourceQueryClient } from '@/query/clients';
import { useResourceCacheSync } from '@/query/resource-query/shared/composable/use-resource-cache-sync';

vi.mock('@tanstack/vue-query', async (importOriginal) => {
    const original = await importOriginal() as typeof VueQuery;
    return {
        ...original,
        useQueryClient: vi.fn(),
    };
});

// Mock app context store
vi.mock('@/store/app-context/workspace/user-workspace-store', () => ({
    useUserWorkspaceStore: () => ({
        getters: {
            currentWorkspaceId: 'workspace-123',
        },
    }),
}));
vi.mock('@/store/app-context/app-context-store', () => ({
    useAppContextStore: () => ({
        getters: {
            isAdminMode: false,
        },
    }),
}));
// Mock useQueryKeyAppContext
vi.mock('@/query/core/query-key/_composable/use-app-context-query-key', () => ({
    useQueryKeyAppContext: () => ({
        value: ['workspace', 'workspace-123'] as const,
    }),
}));

describe('useResourceCacheSync', () => {
    // isolate the test environment (queryClient)
    let queryClient: QueryClient;
    beforeEach(() => {
        queryClient = new QueryClient({
            defaultOptions: {
                queries: {
                    retry: false,
                },
            },
        });
        vi.mocked(useQueryClient).mockReturnValue(queryClient);
        queryClient.clear();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('1. wrapResourceCacheRefresh', () => {
        it('should invalidate the cache of the resource after the function is successfully executed', async () => {
            // Arrange
            const { wrapResourceCacheRefresh } = useResourceCacheSync('project');
            const mockApiFn = vi.fn().mockResolvedValue({ status: 'success' });
            const wrappedFn = wrapResourceCacheRefresh(mockApiFn);
            const invalidateSpy = vi.spyOn(resourceQueryClient, 'invalidateQueries');

            // Act
            await wrappedFn({ name: 'new-project' });

            // Assert
            expect(mockApiFn).toHaveBeenCalledTimes(1);
            expect(mockApiFn).toHaveBeenCalledWith({ name: 'new-project' });

            expect(invalidateSpy).toHaveBeenCalledTimes(1);
            expect(invalidateSpy).toHaveBeenCalledWith({
                queryKey: ['workspace', 'workspace-123', 'project'],
            });
        });

        it('should invalidate the cache of the resource even if the function fails', async () => {
            // Arrange
            const { wrapResourceCacheRefresh } = useResourceCacheSync('project');
            const mockApiFn = vi.fn().mockRejectedValue(new Error('API Error'));
            const wrappedFn = wrapResourceCacheRefresh(mockApiFn);
            const invalidateSpy = vi.spyOn(resourceQueryClient, 'invalidateQueries');

            // Act & Assert
            await expect(wrappedFn()).rejects.toThrow('API Error');

            expect(invalidateSpy).toHaveBeenCalledTimes(1);
            expect(invalidateSpy).toHaveBeenCalledWith({
                queryKey: ['workspace', 'workspace-123', 'project'],
            });
        });
    });

    // describe('2. wrapResourceCacheUpdate', () => {
    //     const resourceType = 'project';
    //     const resourceQueryKey = ['workspace', 'workspace-123', resourceType];

    //     it('should create a new cache with the new data and invalidate the list/stat queries', async () => {
    //         // Arrange
    //         const { wrapResourceCacheUpdate } = useResourceCacheSync(resourceType);
    //         const newProjectData = { project_id: 'project-new', name: 'New Project' };
    //         const mockApiFn = vi.fn().mockResolvedValue(newProjectData);
    //         const wrappedFn = wrapResourceCacheUpdate(mockApiFn);
    //         const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    //         // Act
    //         await wrappedFn(newProjectData);

    //         // Assert
    //         const cachedData = queryClient.getQueryData<Record<string, any>>(resourceQueryKey);
    //         expect(cachedData).toEqual({ 'project-new': newProjectData });

    //         expect(invalidateSpy).toHaveBeenCalledTimes(2);
    //         expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: [...resourceQueryKey, 'stat'] });
    //         expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: [...resourceQueryKey, 'list'] });
    //     });

    //     it('should update the existing cache with the new data', async () => {
    //         // Arrange
    //         const { wrapResourceCacheUpdate } = useResourceCacheSync(resourceType);
    //         const initialData = { project_id: 'project-123', name: 'Old Name' };
    //         const updatedData = { project_id: 'project-123', name: 'Updated Name' };

    //         queryClient.setQueryData(resourceQueryKey, { 'project-123': initialData });

    //         const mockApiFn = vi.fn().mockResolvedValue(updatedData);
    //         const wrappedFn = wrapResourceCacheUpdate(mockApiFn);

    //         // Act
    //         await wrappedFn(updatedData);

    //         // Assert
    //         const cachedData = queryClient.getQueryData<Record<string, any>>(resourceQueryKey);
    //         expect(cachedData?.[updatedData.project_id]).toEqual(updatedData);
    //         expect(Object.keys(cachedData ?? {}).length).toBe(1);
    //     });
    // });
});
