import {
    describe, it, expect, vi, beforeEach,
} from 'vitest';

import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';

import { RESOURCE_MENU_FETCH_CONFIG } from '@/query/resource-query/resource-menu-handler/config/resource-menu-fetch-config';
import * as generator from '@/query/resource-query/resource-menu-handler/core/menu-query-handler.generator';
import { useBaseResourceMenuHandler } from '@/query/resource-query/resource-menu-handler/core/use-base-resource-menu-handler';
import { RESOURCE_CONFIG_MAP } from '@/query/resource-query/shared/contants/resource-config-map';

// Mock a module
vi.mock('@/query/resource-query/resource-menu-handler/core/menu-query-handler.generator');
vi.mock('@/query/core/query-key/use-resource-query-key', () => ({
    useResourceQueryKey: () => ({
        withSuffix: vi.fn(),
    }),
}));

const mockMakeListMenuHandler = vi.fn();
const mockMakeStatMenuHandler = vi.fn();

describe('useBaseResourceMenuHandler', () => {
    const mockListFetcher = vi.fn();
    const mockStatFetcher = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();

        vi.mocked(generator.generateMenuQueryHandler).mockImplementation(() => ({
            makeListMenuHandler: mockMakeListMenuHandler,
            makeStatMenuHandler: mockMakeStatMenuHandler,
        }));
    });

    const fetchConfig = {
        list: mockListFetcher,
        stat: mockStatFetcher,
    };

    it('1. should call makeListMenuHandler when dataKey is not provided (List Menu Handler)', () => {
        const { getResourceMenuHandler } = useBaseResourceMenuHandler({
            resourceType: 'project',
            fetchConfig,
        });

        getResourceMenuHandler({});

        expect(mockMakeListMenuHandler).toHaveBeenCalledTimes(1);
        expect(mockMakeStatMenuHandler).not.toHaveBeenCalled();

        const listCallArg = mockMakeListMenuHandler.mock.calls[0][1];
        expect(listCallArg.fetcher).toBe(mockListFetcher);
        expect(listCallArg.idKey).toBe(RESOURCE_CONFIG_MAP.project.idKey);
        expect(listCallArg.searchTargets).toEqual(RESOURCE_MENU_FETCH_CONFIG.project.searchTargets);
    });

    it('2. should call makeStatMenuHandler when dataKey is provided (Stat Menu Handler)', () => {
        const { getResourceMenuHandler } = useBaseResourceMenuHandler({
            resourceType: 'project',
            fetchConfig,
        });

        getResourceMenuHandler({ dataKey: 'provider' });

        expect(mockMakeStatMenuHandler).toHaveBeenCalledTimes(1);
        expect(mockMakeListMenuHandler).not.toHaveBeenCalled();

        const statCallArg = mockMakeStatMenuHandler.mock.calls[0][1];
        expect(statCallArg.fetcher).toBe(mockStatFetcher);
        expect(statCallArg.distinct).toBe('provider');
    });

    it('3. should pass menuFilters to the correct handler generator', () => {
        const { getResourceMenuHandler } = useBaseResourceMenuHandler({
            resourceType: 'project',
            fetchConfig,
        });
        const menuFilters: ConsoleFilter[] = [{ k: 'workspace_id', v: 'ws-123', o: '=' }];

        getResourceMenuHandler({ menuFilters });
        expect(mockMakeListMenuHandler.mock.calls[0][1].menuFilters).toEqual(menuFilters);

        getResourceMenuHandler({ dataKey: 'provider', menuFilters });
        expect(mockMakeStatMenuHandler.mock.calls[0][1].menuFilters).toEqual(menuFilters);
    });
});
