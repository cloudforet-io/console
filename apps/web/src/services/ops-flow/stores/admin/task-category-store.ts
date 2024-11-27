import { asyncComputed } from '@vueuse/core';
import type { Ref } from 'vue';
import { reactive } from 'vue';

import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { getCancellableFetcher } from '@cloudforet/core-lib/space-connector/cancellable-fetcher';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { TaskCategoryCreateParameters } from '@/schema/opsflow/task-category/api-verbs/create';
import type { TaskCategoryGetParameters } from '@/schema/opsflow/task-category/api-verbs/get';
import type { TaskCategoryListParameters } from '@/schema/opsflow/task-category/api-verbs/list';
import type { TaskCategoryUpdateParameters } from '@/schema/opsflow/task-category/api-verbs/update';
import type { TaskCategoryModel } from '@/schema/opsflow/task-category/model';

import ErrorHandler from '@/common/composables/error/errorHandler';


interface UseTaskCategoryStoreState {
    loading: boolean;
    items?: TaskCategoryModel[];
}
interface UseTaskCategoryStoreGetters {
    taskCategories: Ref<Readonly<TaskCategoryModel[]>>
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
    }) as UseTaskCategoryStoreState;

    const getters = reactive<UseTaskCategoryStoreGetters>({
        taskCategories: asyncComputed<TaskCategoryModel[]>(async () => {
            if (state.items === undefined) {
                await actions.list();
            }
            return state.items ?? [];
        }, [], { lazy: true }),
    });


    const fetchList = getCancellableFetcher<TaskCategoryListParameters, ListResponse<TaskCategoryModel>>(SpaceConnector.clientV2.opsflow.taskCategory.list);
    const actions = {
        async list() {
            state.loading = true;
            try {
                const result = await fetchList({});
                if (result.status === 'succeed') {
                    state.items = result.response.results;
                }
            } catch (e) {
                ErrorHandler.handleError(e);
            } finally {
                state.loading = false;
            }
        },
        async create(params: Omit<TaskCategoryCreateParameters, 'status_options'>) {
            const response = await SpaceConnector.clientV2.opsflow.taskCategory.create<TaskCategoryCreateParameters, TaskCategoryModel>({
                ...params,
                status_options: DEFAULT_STATUS_OPTIONS,
            });
            state.items?.push(response);
            return response;
        },
        async update(params: TaskCategoryUpdateParameters) {
            const response = await SpaceConnector.clientV2.opsflow.taskCategory.update<TaskCategoryUpdateParameters, TaskCategoryModel>(params);
            const item = state.items?.find((c) => c.category_id === response.category_id);
            if (item) {
                Object.assign(item, response);
            }
            return response;
        },
        async get(categoryId: string) {
            const response = await SpaceConnector.clientV2.opsflow.taskCategory.update<TaskCategoryGetParameters, TaskCategoryModel>({
                category_id: categoryId,
            });
            return response;
        },
        async delete(categoryId: string) {
            await SpaceConnector.clientV2.opsflow.taskCategory.delete({
                category_id: categoryId,
            });
            state.items = state.items?.filter((item) => item.category_id !== categoryId);
        },
    };
    return {
        state,
        getters,
        ...actions,
    };
});
