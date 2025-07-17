import {
    describe, it, expect, vi, beforeEach,
} from 'vitest';

import { useAppApi } from '@/api-clients/identity/app/composables/use-app-api';
import { useAppResourceMenuHandler } from '@/query/resource-query/resource-menu-handler/adapters/implementations/use-app-resource-menu-handler';
import * as baseHandler from '@/query/resource-query/resource-menu-handler/core/use-base-resource-menu-handler';

vi.mock('@/query/resource-query/resource-menu-handler/core/use-base-resource-menu-handler');
vi.mock('@/api-clients/identity/app/composables/use-app-api');

const mockGetResourceMenuHandler = vi.fn();

const mockAppApiList = vi.fn();
const mockAppApiStat = vi.fn();

describe('useAppResourceMenuHandler', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(baseHandler.useBaseResourceMenuHandler).mockReturnValue({
            getResourceMenuHandler: mockGetResourceMenuHandler,
        });

        vi.mocked(useAppApi).mockReturnValue({
            appAPI: {
                list: mockAppApiList,
                stat: mockAppApiStat,
            },
        } as any);
    });

    it('should call useBaseResourceMenuHandler with the correct configuration for "app"', () => {
        const result = useAppResourceMenuHandler();

        expect(baseHandler.useBaseResourceMenuHandler).toHaveBeenCalledTimes(1);

        const callArgs = vi.mocked(baseHandler.useBaseResourceMenuHandler).mock.calls[0][0];

        expect(callArgs.resourceType).toBe('app');

        expect(callArgs.fetchConfig.list).toBe(mockAppApiList);

        expect(callArgs.fetchConfig.stat).toBe(mockAppApiStat);

        expect(result.getHandler).toBe(mockGetResourceMenuHandler);
    });
});
