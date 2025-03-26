import { ref } from 'vue';

import {
    describe, it, expect, vi,
} from 'vitest';

import { _useAPIQueryKey } from '../use-api-query-key';

// Mock useQueryKeyAppContext
vi.mock('@/query/query-key/_composable/use-app-context-query-key', () => ({
    useQueryKeyAppContext: () => ({
        value: ['workspace', 'workspace-123'] as const,
    }),
}));

describe('_useAPIQueryKey', () => {
    it('should generate correct query key structure for basic usage', () => {
        const { key } = _useAPIQueryKey(
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

    it('should generate correct query key structure with id', () => {
        const { key } = _useAPIQueryKey(
            'dashboard',
            'public-data-table',
            'get',
            {
                id: 'table-123',
                params: { id: 'table-123' },
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

    it('should generate correct query key structure with deps', () => {
        const { key } = _useAPIQueryKey(
            'dashboard',
            'public-data-table',
            'list',
            {
                params: { page: 1, limit: 10 },
                deps: { filter: 'active' },
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
  {
    "filter": "active",
  },
]
`);
    });

    it('should handle reactive values correctly', () => {
        const params = ref({ id: 'table-123' });
        const deps = ref({ filter: 'active' });
        const id = ref('table-123');

        const { key } = _useAPIQueryKey(
            'dashboard',
            'public-data-table',
            'get',
            {
                id,
                params,
                deps,
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
  {
    "filter": "active",
  },
]
`);
    });

    it('should handle function getters correctly', () => {
        const { key } = _useAPIQueryKey(
            'dashboard',
            'public-data-table',
            'get',
            {
                id: () => 'table-123',
                params: () => ({ id: 'table-123' }),
                deps: () => ({ filter: 'active' }),
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
  {
    "filter": "active",
  }
]
`);
    });

    it('should maintain consistent key structure with different option orders', () => {
        const params = { id: 'table-123' };
        const deps = { filter: 'active' };
        const id = 'table-123';

        const { key: key1 } = _useAPIQueryKey(
            'dashboard',
            'public-data-table',
            'get',
            { id, params, deps },
        );

        const { key: key2 } = _useAPIQueryKey(
            'dashboard',
            'public-data-table',
            'get',
            { deps, params, id },
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
  {
    "filter": "active",
  }
]
`);
    });
});
