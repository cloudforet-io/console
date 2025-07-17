import {
    describe, it, expect, vi,
} from 'vitest';

import ReferenceRepository from '@/query/resource-query/reference-data-model/core/reference-repository';


const mockQueryClient = {
    getQueryData: vi.fn(),
    setQueryData: vi.fn(),
} as any;

const mockListFetcher = vi.fn();

const RESOURCE_KEY = 'project';
const QUERY_KEY = ['project', 'list'];

describe('ReferenceRepository', () => {
    let referenceRepository: ReferenceRepository<{ project_id: string }>;

    beforeEach(() => {
        vi.clearAllMocks();
        vi.useFakeTimers();

        referenceRepository = new ReferenceRepository(RESOURCE_KEY, mockQueryClient as any, QUERY_KEY, mockListFetcher);
    });

    it('should be triggerd IdBatcher\'s enqueue, if requestItem method is called', async () => {
        mockQueryClient.getQueryData.mockReturnValueOnce(undefined);
        mockListFetcher.mockResolvedValueOnce({ results: [{ project_id: 'project-123' }] });

        referenceRepository.requestItem('project-123');
        referenceRepository.requestItem('project-124');

        expect(mockListFetcher).not.toHaveBeenCalled();

        await vi.advanceTimersByTimeAsync(300);

        expect(mockListFetcher).toHaveBeenCalledTimes(1);
        expect(mockListFetcher).toHaveBeenCalledWith({
            query: {
                filter: [{ k: 'project_id', o: 'in', v: ['project-123', 'project-124'] }],
            },
        });
    });


    it('should call queryClient.setQueryData, after call listFetcher', async () => {
        mockQueryClient.getQueryData.mockReturnValueOnce(undefined);
        mockListFetcher.mockResolvedValueOnce({ results: [{ project_id: 'project-123' }] });

        referenceRepository.requestItem('project-123');

        await vi.advanceTimersByTimeAsync(300);

        expect(mockQueryClient.setQueryData).toHaveBeenCalledTimes(1);
        expect(mockQueryClient.setQueryData).toHaveBeenCalledWith(QUERY_KEY, expect.any(Function));

        const updater = mockQueryClient.setQueryData.mock.calls[0][1];
        const previousData = {};
        const newData = updater(previousData);

        expect(newData).toEqual({
            'project-123': {
                project_id: 'project-123',
            },
        });
    });

    it('should not call idBatcher.enqueue, if cached data is exists', async () => {
        mockQueryClient.getQueryData.mockReturnValueOnce({
            'project-123': {
                project_id: 'project-123',
            },
        });

        referenceRepository.requestItem('project-123');
        referenceRepository.requestItem('project-124');

        await vi.advanceTimersByTimeAsync(300);

        expect(mockListFetcher).toHaveBeenCalledTimes(1);
        expect(mockListFetcher).toHaveBeenCalledWith({
            query: {
                filter: [{ k: 'project_id', o: 'in', v: ['project-124'] }],
            },
        });
    });
});
