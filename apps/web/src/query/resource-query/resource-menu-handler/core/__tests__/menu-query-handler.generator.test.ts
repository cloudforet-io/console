import {
    describe, it, expect, vi, beforeEach,
} from 'vitest';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { StatResponse } from '@/api-clients/_common/schema/api-verbs/stat';
import { generateMenuQueryHandler } from '@/query/resource-query/resource-menu-handler/core/menu-query-handler.generator';

// Mock QueryClient
const mockQueryClient = {
    ensureQueryData: vi.fn(),
};

// Mock Fetchers
const mockListFetcher = vi.fn<(arg: any) => Promise<ListResponse<any>>>();
const mockStatFetcher = vi.fn<(arg: any) => Promise<StatResponse>>();

const mockQueryKeyWithSuffix = (params: any) => ['test-query-key', params];

describe('generateMenuQueryHandler', () => {
    let generator;

    beforeEach(() => {
        vi.clearAllMocks();
        // init generator
        generator = generateMenuQueryHandler(mockQueryClient as any);

        mockQueryClient.ensureQueryData.mockImplementation(async ({ queryFn }) => queryFn());
    });

    describe('1. makeListMenuHandler Test', () => {
        const listFetchConfig = {
            fetcher: mockListFetcher,
            idKey: 'project_id',
            searchTargets: ['name', 'project_id'],
        };

        it('1-1. should generate a handler that calls the list fetcher with correct parameters', async () => {
            const listMenuHandler = generator.makeListMenuHandler(mockQueryKeyWithSuffix, listFetchConfig);
            mockListFetcher.mockResolvedValueOnce({ results: [], total_count: 0 });

            await listMenuHandler('test-input', 1, 10);

            expect(mockListFetcher).toHaveBeenCalledTimes(1);
            const callArg = mockListFetcher.mock.calls[0][0];
            expect(callArg.query.page).toEqual({ start: 1, limit: 10 });
            expect(callArg.query.filter).toEqual(
                expect.arrayContaining([
                    { k: 'project_id', v: [null, ''], o: 'not_in' },
                ]),
            );
            expect(callArg.query.filter_or).toEqual(
                expect.arrayContaining([
                    { k: 'name', v: 'test-input', o: 'contain' },
                    { k: 'project_id', v: 'test-input', o: 'contain' },
                ]),
            );
        });

        it('1-2. should correctly transform fetcher response to menu response format', async () => {
            const listMenuHandler = generator.makeListMenuHandler(mockQueryKeyWithSuffix, listFetchConfig);
            const mockApiResponse = {
                results: [
                    { project_id: 'p-1', name: 'Project A' },
                    { project_id: 'p-2', name: 'Project B' },
                ],
                total_count: 2,
            };
            mockListFetcher.mockResolvedValueOnce(mockApiResponse);

            const result = await listMenuHandler('', 1, 10);

            expect(result.results).toEqual([
                { name: 'p-1', label: 'Project A', data: mockApiResponse.results[0] },
                { name: 'p-2', label: 'Project B', data: mockApiResponse.results[1] },
            ]);
            expect(result.more).toBe(false);
        });

        it('1-3. should handle menuFilters correctly', async () => {
            const configWithMenuFilters = {
                ...listFetchConfig,
                menuFilters: [{ k: 'workspace_id', v: 'ws-123', o: '=' }],
            };
            const listMenuHandler = generator.makeListMenuHandler(mockQueryKeyWithSuffix, configWithMenuFilters);
            mockListFetcher.mockResolvedValueOnce({ results: [], total_count: 0 });

            await listMenuHandler('test-input', 1, 10);

            const callArg = mockListFetcher.mock.calls[0][0];
            expect(callArg.query.filter).toEqual(
                expect.arrayContaining([
                    { k: 'workspace_id', v: 'ws-123', o: 'eq' },
                ]),
            );
        });
    });

    describe('2. makeStatMenuHandler Test', () => {
        const statFetchConfig = {
            fetcher: mockStatFetcher,
            distinct: 'provider',
        };

        it('2-1. should generate a handler that calls the stat fetcher with correct parameters', async () => {
            const statMenuHandler = generator.makeStatMenuHandler(mockQueryKeyWithSuffix, statFetchConfig);
            mockStatFetcher.mockResolvedValueOnce({ results: [], total_count: 0 });

            await statMenuHandler('aws', 1, 10);

            expect(mockStatFetcher).toHaveBeenCalledTimes(1);
            const callArg = mockStatFetcher.mock.calls[0][0];
            expect(callArg.query.distinct).toBe('provider');
            expect(callArg.query.filter).toEqual(
                expect.arrayContaining([
                    { k: 'provider', v: 'aws', o: 'contain' },
                ]),
            );
        });

        it('2-2. should correctly transform stat fetcher response to menu response format', async () => {
            const statMenuHandler = generator.makeStatMenuHandler(mockQueryKeyWithSuffix, statFetchConfig);
            const mockApiResponse = {
                results: ['aws', 'google'],
                total_count: 2,
            };
            mockStatFetcher.mockResolvedValueOnce(mockApiResponse);

            const result = await statMenuHandler('', 1, 10);

            expect(result.results).toEqual([
                { name: 'aws', label: 'aws', data: 'aws' },
                { name: 'google', label: 'google', data: 'google' },
            ]);
            expect(result.more).toBe(false);
        });
    });
});
