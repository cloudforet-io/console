import { computed, reactive, watch } from 'vue';

import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { getCancellableFetcher } from '@cloudforet/core-lib/space-connector/cancellable-fetcher';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { TaskTypeCreateParameters } from '@/api-clients/opsflow/task-type/schema/api-verbs/create';
import type { TaskTypeDeleteParameters } from '@/api-clients/opsflow/task-type/schema/api-verbs/delete';
import type { TaskTypeGetParameters } from '@/api-clients/opsflow/task-type/schema/api-verbs/get';
import type { TaskTypeListParameters } from '@/api-clients/opsflow/task-type/schema/api-verbs/list';
import type { TaskTypeUpdateParameters } from '@/api-clients/opsflow/task-type/schema/api-verbs/update';
import type { TaskTypeUpdateFieldsParameters } from '@/api-clients/opsflow/task-type/schema/api-verbs/update-fields';
import type { TaskTypeModel } from '@/api-clients/opsflow/task-type/schema/model';

import { useAppContextStore } from '@/store/app-context/app-context-store';

import ErrorHandler from '@/common/composables/error/errorHandler';


interface UseTaskTypeStoreState {
    loading: boolean;
    itemsByCategoryId: Record<string, TaskTypeModel[]|undefined>;
    fullFieldsItemMap: Record<string, TaskTypeModel|undefined>;
}

export const useTaskTypeStore = defineStore('task-type', () => {
    const state = reactive<UseTaskTypeStoreState>({
        loading: false,
        itemsByCategoryId: {},
        fullFieldsItemMap: {},
    });

    const getters = {
        loading: computed(() => state.loading),
    };

    const fetchList = getCancellableFetcher<TaskTypeListParameters, ListResponse<TaskTypeModel>>(SpaceConnector.clientV2.opsflow.taskType.list);
    const fetchGet = getCancellableFetcher<TaskTypeGetParameters, TaskTypeModel>(SpaceConnector.clientV2.opsflow.taskType.get);
    const actions = {
        async list(params: TaskTypeListParameters): Promise<TaskTypeModel[]|undefined> {
            try {
                state.loading = true;
                const result = await fetchList(params);
                if (result.status === 'succeed') {
                    state.loading = false;
                    return result.response.results ?? [];
                }
                return undefined;
            } catch (e) {
                ErrorHandler.handleError(e);
                state.loading = false;
                return undefined;
            }
        },
        async listByCategoryIds(categoryIds: string[]): Promise<Record<string, TaskTypeModel[]>> {
            const _categoryIds = categoryIds.filter((categoryId) => !state.itemsByCategoryId[categoryId]);
            if (_categoryIds.length === 0) {
                return state.itemsByCategoryId as Record<string, TaskTypeModel[]>;
            }

            try {
                state.loading = true;
                const result = await fetchList({ query: { filter: [{ k: 'category_id', v: _categoryIds, o: 'in' }] } });
                if (result.status === 'succeed') {
                    _categoryIds.forEach((categoryId) => {
                        state.itemsByCategoryId[categoryId] ??= result.response.results?.filter((item) => item.category_id === categoryId) ?? [];
                    });
                    state.itemsByCategoryId = { ...state.itemsByCategoryId }; // trigger reactivity
                    state.loading = false;
                }
            } catch (e) {
                ErrorHandler.handleError(e);
                state.loading = false;
            }
            return state.itemsByCategoryId as Record<string, TaskTypeModel[]>;
        },
        async listByCategoryId(categoryId: string, force?: boolean): Promise<TaskTypeModel[]|undefined> {
            if (state.itemsByCategoryId[categoryId] && !force) {
                return state.itemsByCategoryId[categoryId] as TaskTypeModel[];
            }

            try {
                state.loading = true;
                const result = await fetchList({ query: { filter: [{ k: 'category_id', v: categoryId, o: 'eq' }] } });
                if (result.status === 'succeed') {
                    state.itemsByCategoryId = { ...state.itemsByCategoryId, [categoryId]: result.response.results ?? [] };
                    state.loading = false;
                    return result.response.results ?? [];
                }
                return undefined;
            } catch (e) {
                ErrorHandler.handleError(e);
                state.loading = false;
                return state.itemsByCategoryId[categoryId];
            }
        },
        async create(params: TaskTypeCreateParameters) {
            const response = await SpaceConnector.clientV2.opsflow.taskType.create<TaskTypeCreateParameters, TaskTypeModel>(params);
            const categoryId = response.category_id;
            if (state.itemsByCategoryId[categoryId]) {
                state.itemsByCategoryId = {
                    ...state.itemsByCategoryId,
                    [categoryId]: [...state.itemsByCategoryId[categoryId] as TaskTypeModel[], response],
                };
            } else {
                state.itemsByCategoryId = {
                    ...state.itemsByCategoryId,
                    [categoryId]: [response],
                };
            }
            return response;
        },
        async update(params: TaskTypeUpdateParameters) {
            const response = await SpaceConnector.clientV2.opsflow.taskType.update<TaskTypeUpdateParameters, TaskTypeModel>(params);
            const categoryId = response.category_id;
            if (state.itemsByCategoryId[categoryId]) {
                const idx = state.itemsByCategoryId[categoryId]?.findIndex((c) => c.task_type_id === response.task_type_id) ?? -1;
                if (idx !== -1) {
                    state.itemsByCategoryId[categoryId]?.splice(idx, 1, response);
                    state.itemsByCategoryId = { ...state.itemsByCategoryId };
                }
            }
            return response;
        },
        async updateFields(params: TaskTypeUpdateFieldsParameters) {
            const response = await SpaceConnector.clientV2.opsflow.taskType.updateFields<TaskTypeUpdateFieldsParameters, TaskTypeModel>(params);
            const categoryId = response.category_id;
            if (state.itemsByCategoryId[categoryId]) {
                const idx = state.itemsByCategoryId[categoryId]?.findIndex((c) => c.task_type_id === response.task_type_id) ?? -1;
                if (idx !== -1) {
                    state.itemsByCategoryId[categoryId]?.splice(idx, 1, response);
                    state.itemsByCategoryId = { ...state.itemsByCategoryId };
                }
            }
            return response;
        },
        async getWithFullFields(taskTypeId: string, force?: boolean): Promise<TaskTypeModel|undefined> {
            if (state.fullFieldsItemMap[taskTypeId] && !force) {
                return state.fullFieldsItemMap[taskTypeId];
            }
            const result = await fetchGet({
                task_type_id: taskTypeId,
                include_category_fields: true,
            });
            if (result.status === 'succeed') {
                state.fullFieldsItemMap = {
                    ...state.fullFieldsItemMap,
                    [taskTypeId]: result.response,
                };
            }
            return result.response;
        },
        async delete(taskTypeId: string, categoryId?: string) {
            await SpaceConnector.clientV2.opsflow.taskType.delete<TaskTypeDeleteParameters, TaskTypeModel>({
                task_type_id: taskTypeId,
            });
            if (categoryId) {
                state.itemsByCategoryId = {
                    ...state.itemsByCategoryId,
                    [categoryId]: state.itemsByCategoryId[categoryId]?.filter((item) => item.task_type_id !== taskTypeId),
                };
            } else {
                const deleted = Object.values(state.itemsByCategoryId).find((items) => items?.find((item) => item.task_type_id === taskTypeId));
                const _categoryId = deleted?.[0]?.category_id;
                if (_categoryId) {
                    state.itemsByCategoryId = {
                        ...state.itemsByCategoryId,
                        [_categoryId]: state.itemsByCategoryId[_categoryId]?.filter((item) => item.task_type_id !== taskTypeId),
                    };
                }
            }
        },
        reset() {
            state.loading = false;
            state.itemsByCategoryId = {};
            state.fullFieldsItemMap = {};
        },
    };

    const disposeSelf = () => {
        const store = useTaskTypeStore();
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
