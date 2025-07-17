import { reactive, defineComponent, computed } from 'vue';

import { createLocalVue, mount } from '@vue/test-utils';

import {
    describe, it, expect, vi, beforeEach, afterEach,
} from 'vitest';

import { useReferenceDataModel } from '@/query/resource-query/reference-data-model/composables/use-reference-data-model';


const mockListFetcher = vi.fn();
const MOCK_PROJECT_ID = 'project-123';

const localVue = createLocalVue();

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

// Mock useReferenceReactiveCache
vi.mock('@/query/resource-query/reference-model/composables/_internal/use-reference-reactive-cache', () => ({
    useReferenceReactiveCache: () => ({
        referenceMapRefs: reactive({}),
    }),
}));



describe('useReferenceDataModel', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.useFakeTimers();
    });
    afterEach(() => {
        vi.restoreAllMocks();
    });


    it('should fetch reference data when the reference data is not in the cache', async () => {
        mockListFetcher.mockResolvedValue({ results: [{ project_id: MOCK_PROJECT_ID }] });

        const div = document.createElement('div');
        div.id = 'root';
        document.body.appendChild(div);

        const TestComponent = defineComponent({
            setup() {
                const { referenceMap } = useReferenceDataModel(
                    'project',
                    (item) => ({ key: item.project_id, label: item.project_id, name: item.project_id }),
                    {
                        listFetcher: mockListFetcher,
                    },
                );

                const name = computed(() => referenceMap[MOCK_PROJECT_ID]?.name);
                return { name };
            },
            template: `
                <div>
                    <div>{{ name }}</div>
                </div>
            `,
        });

        mount(TestComponent, {
            localVue,
            attachTo: '#root',
        });

        await vi.advanceTimersByTimeAsync(500);

        await localVue.nextTick();

        expect(mockListFetcher).toHaveBeenCalledTimes(1);
        expect(mockListFetcher).toHaveBeenCalledWith(expect.objectContaining({
            query: expect.objectContaining({
                filter: expect.objectContaining([{ k: 'project_id', v: [MOCK_PROJECT_ID], o: 'in' }]),
            }),
        }));
    });
});
