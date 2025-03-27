import { reactive, computed, watch } from 'vue';

import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { getCancellableFetcher } from '@cloudforet/core-lib/space-connector/cancellable-fetcher';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { TaskCategoryCreateParameters } from '@/api-clients/opsflow/task-category/schema/api-verbs/create';
import type { TaskCategoryDeleteParameters } from '@/api-clients/opsflow/task-category/schema/api-verbs/delete';
import type { TaskCategoryGetParameters } from '@/api-clients/opsflow/task-category/schema/api-verbs/get';
import type { TaskCategoryListParameters } from '@/api-clients/opsflow/task-category/schema/api-verbs/list';
import type { TaskCategoryUpdateParameters } from '@/api-clients/opsflow/task-category/schema/api-verbs/update';
import type { TaskCategoryModel } from '@/api-clients/opsflow/task-category/schema/model';

import { useAppContextStore } from '@/store/app-context/app-context-store';

import ErrorHandler from '@/common/composables/error/errorHandler';



interface UseTaskCategoryStoreState {
    loading: boolean;
    items?: TaskCategoryModel[];
}
interface UseTaskCategoryStoreGetters {
    loading: boolean;
    taskCategories: TaskCategoryModel[];
    taskCategoriesIncludingDeleted: TaskCategoryModel[];
}
const DEFAULT_STATUS_OPTIONS: TaskCategoryCreateParameters['status_options'] = {
    TODO: [
        { name: 'To Do', color: 'blue200', is_default: true },
    ],
    IN_PROGRESS: [
        { name: 'In Progress', color: 'yellow200', is_default: true },
    ],
    COMPLETED: [
        { name: 'Done', color: 'green200', is_default: true },
    ],
};

export const useTaskCategoryStore = defineStore('task-category', () => {
    const state = reactive<UseTaskCategoryStoreState>({
        loading: false,
        items: undefined,
    });

    const getters: UseTaskCategoryStoreGetters = {
        loading: computed<boolean>(() => state.loading),
        taskCategories: computed<TaskCategoryModel[]>(() => state.items?.filter((item) => item.state !== 'DELETED') ?? []),
        taskCategoriesIncludingDeleted: computed<TaskCategoryModel[]>(() => state.items ?? []),
    } as unknown as UseTaskCategoryStoreGetters; // HACK: to avoid type error

    const fetchList = getCancellableFetcher<TaskCategoryListParameters, ListResponse<TaskCategoryModel>>(SpaceConnector.clientV2.opsflow.taskCategory.list);
    const actions = {
        async list(force?: true): Promise<TaskCategoryModel[]|undefined> {
            if (!force && state.items) return state.items;
            try {
                state.loading = true;
                const result = await fetchList({ include_deleted: true });
                if (result.status === 'succeed') {
                    state.loading = false;
                    state.items = result.response.results ?? [];
                    return result.response.results ?? [];
                }
                return undefined;
            } catch (e) {
                ErrorHandler.handleError(e);
                state.loading = false;
                return undefined;
            }
        },
        async create(params: Omit<TaskCategoryCreateParameters, 'status_options'>) {
            const response = await SpaceConnector.clientV2.opsflow.taskCategory.create<TaskCategoryCreateParameters, TaskCategoryModel>({
                ...params,
                status_options: DEFAULT_STATUS_OPTIONS,
            });
            state.items = state.items ? [...state.items, response] : [response];
            return response;
        },
        async update(params: TaskCategoryUpdateParameters) {
            const response = await SpaceConnector.clientV2.opsflow.taskCategory.update<TaskCategoryUpdateParameters, TaskCategoryModel>(params);
            const item = state.items?.find((c) => c.category_id === response.category_id);
            if (item) {
                state.items = state.items?.map((c) => (c.category_id === response.category_id ? response : c));
            }
            return response;
        },
        async get(categoryId: string) {
            const category = state.items?.find((item) => item.category_id === categoryId);
            if (category) return category;
            const response = await SpaceConnector.clientV2.opsflow.taskCategory.get<TaskCategoryGetParameters, TaskCategoryModel>({
                category_id: categoryId,
            });
            return response;
        },
        async delete(categoryId: string) {
            await SpaceConnector.clientV2.opsflow.taskCategory.delete<TaskCategoryDeleteParameters, TaskCategoryModel>({
                category_id: categoryId,
            });
            state.items = state.items?.filter((item) => item.category_id !== categoryId);
        },
        reset() {
            state.loading = false;
            state.items = undefined;
        },
    };

    const disposeSelf = () => {
        const store = useTaskCategoryStore();
        store.reset();
        store.$dispose();
    };
    const appContextStore = useAppContextStore();
    watch(() => appContextStore.getters.globalGrantLoading, (globalGrantLoading) => {
        if (globalGrantLoading) disposeSelf();
    });
    return {
        state,
        getters,
        ...actions,
    };
});
