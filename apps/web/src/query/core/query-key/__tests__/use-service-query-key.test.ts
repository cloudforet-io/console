import { computed } from 'vue';

import {
    describe, it, expect, vi,
} from 'vitest';

import { useServiceQueryKey } from '../use-service-query-key';

// Mock useQueryKeyAppContext
vi.mock('@/query/query-key/_composable/use-app-context-query-key', () => ({
    useQueryKeyAppContext: () => ({
        value: ['workspace', 'workspace-123'] as const,
    }),
}));

describe('useServiceQueryKey', () => {
    it('should generate correct query key structure for basic usage', () => {
        const { key } = useServiceQueryKey(
            'dashboard',
            'public-data-table',
            'list',
            {
                params: { page: 1, limit: 10 },
            },
        );

        expect(key.value).toMatchInlineSnapshot(`
[
  "workspace",
  "workspace-123",
  "dashboard",
  "public-data-table",
  "list",
  {
    "limit": 10,
    "page": 1,
  },
]
`);
    });

    it('should generate correct query key structure with contextKey', () => {
        const { key } = useServiceQueryKey(
            'dashboard',
            'public-data-table',
            'get',
            {
                contextKey: computed(() => 'table-123'),
                params: computed(() => ({ id: 'table-123' })),
            },
        );

        expect(key.value).toMatchInlineSnapshot(`
[
  "workspace",
  "workspace-123",
  "dashboard",
  "public-data-table",
  "get",
  "table-123",
  {
    "id": "table-123",
  },
]
`);
    });

    it('should handle reactive values correctly', () => {
        const params = computed(() => ({ id: 'table-123' }));
        const contextKey = computed(() => 'table-123');

        const { key } = useServiceQueryKey(
            'dashboard',
            'public-data-table',
            'get',
            {
                contextKey,
                params,
            },
        );

        expect(key.value).toMatchInlineSnapshot(`
[
  "workspace",
  "workspace-123",
  "dashboard",
  "public-data-table",
  "get",
  "table-123",
  {
    "id": "table-123",
  },
]
`);
    });

    it('should handle function getters correctly', () => {
        const { key } = useServiceQueryKey(
            'dashboard',
            'public-data-table',
            'get',
            {
                contextKey: () => 'table-123',
                params: computed(() => ({ id: 'table-123' })),
            },
        );

        expect(key.value).toMatchInlineSnapshot(`
[
  "workspace",
  "workspace-123",
  "dashboard",
  "public-data-table",
  "get",
  "table-123",
  {
    "id": "table-123",
  },
]
`);
    });

    it('should maintain consistent key structure with different option orders', () => {
        const params = computed(() => ({ id: 'table-123' }));
        const contextKey = computed(() => 'table-123');

        const { key: key1 } = useServiceQueryKey(
            'dashboard',
            'public-data-table',
            'get',
            { contextKey, params },
        );

        const { key: key2 } = useServiceQueryKey(
            'dashboard',
            'public-data-table',
            'get',
            { params, contextKey },
        );

        expect(key1.value).toEqual(key2.value);
        expect(key1.value).toMatchInlineSnapshot(`
[
  "workspace",
  "workspace-123",
  "dashboard",
  "public-data-table",
  "get",
  "table-123",
  {
    "id": "table-123",
  },
]
`);
    });

    it('should handle withSuffix correctly', () => {
        const { withSuffix } = useServiceQueryKey(
            'dashboard',
            'public-data-table',
            'load',
        );

        const result = withSuffix('table-123');
        expect(result).toMatchInlineSnapshot(`
[
  "workspace",
  "workspace-123",
  "dashboard",
  "public-data-table",
  "load",
  "table-123",
]
`);
    });
});
