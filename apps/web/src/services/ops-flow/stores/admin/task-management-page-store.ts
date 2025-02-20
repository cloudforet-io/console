import type { DeepReadonly } from 'vue';
import {
    reactive, computed, onUnmounted, onMounted,
} from 'vue';

import { defineStore } from 'pinia';

import type { TaskCategoryModel } from '@/api-clients/opsflow/task-category/schema/model';
import type { TaskModel } from '@/api-clients/opsflow/task/schema/model';
import type { PackageModel } from '@/schema/identity/package/model';

import type { WorkspaceItem } from '@/store/reference/workspace-reference-store';
import { useWorkspaceReferenceStore } from '@/store/reference/workspace-reference-store';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { useTaskAPI } from '@/services/ops-flow/composables/use-task-api';
import { usePackageStore } from '@/services/ops-flow/stores/admin/package-store';
import { useTaskCategoryStore } from '@/services/ops-flow/stores/task-category-store';

interface UseTaskManagementPageStoreState {
    // support package
    visiblePackageForm: boolean;
    targetPackageId?: string;
    visibleDeletePackageModal: boolean;
    visibleSetDefaultPackageModal: boolean;
    // category
    visibleCategoryForm: boolean;
    targetCategoryId?: string;
    visibleDeleteCategoryModal: boolean;
    // task
    associatedTasksToCategoryMap: Record<string, TaskModel[]>;
    loadingAssociatedTasksToCategory: boolean;
}

interface UseTaskManagementPageStoreGetters {
    targetPackage: PackageModel|undefined;
    associatedCategoriesToPackage: TaskCategoryModel[];
    associatedWorkspacesToPackage: WorkspaceItem[];
    associatedTasksToCategory: TaskModel[];
    targetCategory: TaskCategoryModel|undefined;
    defaultPackage: PackageModel|undefined;
}

export const useTaskManagementPageStore = defineStore('task-management-page', () => {
    const packageStore = usePackageStore();
    const taskCategoryStore = useTaskCategoryStore();
    const workspaceReferenceStore = useWorkspaceReferenceStore();
    const taskAPI = useTaskAPI();
    const state = reactive<UseTaskManagementPageStoreState>({
        // support package
        visiblePackageForm: false,
        targetPackageId: undefined,
        visibleDeletePackageModal: false,
        visibleSetDefaultPackageModal: false,
        // category
        visibleCategoryForm: false,
        targetCategoryId: undefined,
        visibleDeleteCategoryModal: false,
        // task
        associatedTasksToCategoryMap: {},
        loadingAssociatedTasksToCategory: false,
    });
    const getters: UseTaskManagementPageStoreGetters = {
        targetPackage: computed<PackageModel|undefined>(() => packageStore.getters.packages.find((p) => p.package_id === state.targetPackageId)),
        associatedCategoriesToPackage: computed<DeepReadonly<TaskCategoryModel[]>>(() => taskCategoryStore.getters.taskCategories.filter((c) => c.package_id === state.targetPackageId)),
        associatedWorkspacesToPackage: computed<WorkspaceItem[]>(() => {
            const targetPackageId = state.targetPackageId;
            if (!targetPackageId) return [];
            const workspaceItems: WorkspaceItem[] = Object.values(workspaceReferenceStore.getters.workspaceItems);
            return workspaceItems.filter((w) => w.data.packages?.includes(targetPackageId));
        }),
        associatedTasksToCategory: computed<DeepReadonly<TaskModel[]>>(() => {
            if (!state.targetCategoryId) return [];
            const categoryId = state.targetCategoryId;
            const packageId = getters.targetCategory?.package_id;
            if (!packageId) return [];
            const workspaceItems: WorkspaceItem[] = Object.values(workspaceReferenceStore.getters.workspaceItems);
            const relatedWorkspaceIds = workspaceItems.filter((w) => w.data.packages?.includes(packageId)).map((w) => w.key);
            const allTasks = state.associatedTasksToCategoryMap[categoryId] ?? [];
            return allTasks.filter((t) => relatedWorkspaceIds.includes(t.workspace_id));
        }),
        targetCategory: computed<DeepReadonly<TaskCategoryModel>|undefined>(() => taskCategoryStore.getters.taskCategories.find((c) => c.category_id === state.targetCategoryId)),
        defaultPackage: computed<PackageModel|undefined>(() => packageStore.getters.packages.find((p) => p.is_default)),
    } as unknown as UseTaskManagementPageStoreGetters; // HACK: to avoid type error
    const actions = {
        // support package
        openAddPackageForm() {
            state.targetPackageId = undefined;
            state.visiblePackageForm = true;
        },
        openEditPackageForm(packageId: string) {
            state.targetPackageId = packageId;
            state.visiblePackageForm = true;
        },
        closePackageForm() {
            state.visiblePackageForm = false;
            // do not reset targetPackageId here and handle it after the modal is closed
        },
        openDeletePackageModal(packageId: string) {
            state.targetPackageId = packageId;
            state.visibleDeletePackageModal = true;
        },
        closeDeletePackageModal() {
            state.visibleDeletePackageModal = false;
            // do not reset targetPackageId here and handle it after the modal is closed
        },
        openSetDefaultPackageModal(packageId: string) {
            state.targetPackageId = packageId;
            state.visibleSetDefaultPackageModal = true;
        },
        closeSetDefaultPackageModal() {
            state.visibleSetDefaultPackageModal = false;
            // do not reset targetPackageId here and handle it after the modal is closed
        },
        resetTargetPackageId() {
            state.targetPackageId = undefined;
        },
        // category
        openAddCategoryForm() {
            state.targetCategoryId = undefined;
            state.visibleCategoryForm = true;
        },
        openEditCategoryForm(categoryId: string) {
            state.targetCategoryId = categoryId;
            state.visibleCategoryForm = true;
        },
        closeCategoryForm() {
            state.visibleCategoryForm = false;
            // do not reset targetCategoryId here and handle it after the modal is closed
        },
        openDeleteCategoryModal(categoryId: string) {
            state.targetCategoryId = categoryId;
            state.visibleDeleteCategoryModal = true;
        },
        closeDeleteCategoryModal() {
            state.visibleDeleteCategoryModal = false;
            // do not reset targetCategoryId here and handle it after the modal is closed
        },
        resetTargetCategoryId() {
            state.targetCategoryId = undefined;
        },
        // task
        async loadAssociatedTasksToCategory(categoryId: string) {
            state.loadingAssociatedTasksToCategory = true;
            if (state.associatedTasksToCategoryMap[categoryId]) {
                state.loadingAssociatedTasksToCategory = false;
                return;
            }
            try {
                const tasks = await taskAPI.list({ category_id: categoryId });
                if (!tasks) return;
                state.associatedTasksToCategoryMap = {
                    ...state.associatedTasksToCategoryMap,
                    [categoryId]: tasks,
                };
                state.loadingAssociatedTasksToCategory = false;
            } catch (e) {
                ErrorHandler.handleError(e);
                state.loadingAssociatedTasksToCategory = false;
            }
        },
        flushAssociatedTasksToCategoryMap() {
            state.associatedTasksToCategoryMap = {};
        },
    };

    onMounted(() => {
        if (!taskCategoryStore.state.loading) taskCategoryStore.list();
    });


    const disposeSelf = () => {
        const store = useTaskManagementPageStore();
        store.$reset();
        store.$dispose();
    };
    onUnmounted(() => {
        disposeSelf();
    });
    return {
        state,
        getters,
        ...actions,
    };
});
