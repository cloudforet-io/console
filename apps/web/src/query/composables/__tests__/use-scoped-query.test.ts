// useScopedQuery.spec.ts

import { computed } from 'vue';

import {
    describe, it, expect, vi,
} from 'vitest';

import { useScopedQuery } from '@/query/composables/use-scoped-query';

import { useUserStore } from '@/store/user/user-store';

vi.mock('@/store/user/user-store', () => ({
    useUserStore: vi.fn(() => ({
        state: {
            currentGrantInfo: {
                scope: 'WORKSPACE',
            },
        },
    })),
}));

vi.mock('@/store/app-context/app-context-store', () => ({
    useAppContextStore: () => ({
        getters: {
            globalGrantLoading: true,
        },
    }),
}));

vi.mock('@tanstack/vue-query', () => ({
    useQuery: vi.fn((options) => ({
        data: computed(() => 'success'),
        isSuccess: computed(() => true),
        isLoading: computed(() => false),
        enabled: options.enabled,
    })),
    QueryClient: vi.fn(() => ({
        setDefaultOptions: vi.fn(),
    })),
}));

describe('useScopedQuery', () => {
    it('should validate scope correctly', () => {
        const queryFn = vi.fn(() => Promise.resolve('success'));
        const queryKey = computed(() => ['test']);

        const result = useScopedQuery({
            queryKey,
            queryFn,
        }, ['WORKSPACE']);

        expect(result.enabled.value).toBe(true);
    });

    it('should disable query for invalid scope', () => {
        vi.mocked(useUserStore).mockImplementationOnce(() => ({
            state: {
                currentGrantInfo: {
                    scope: 'DOMAIN',
                },
            },
        }));

        const queryFn = vi.fn(() => Promise.resolve('fail'));
        const queryKey = computed(() => ['test-invalid']);

        const result = useScopedQuery({
            queryKey,
            queryFn,
        }, ['WORKSPACE']);

        expect(result.enabled.value).toBe(false);
    });
});
