import type { DeepReadonly } from 'vue';
import {
    reactive, computed, onUnmounted, onMounted,
} from 'vue';

import { defineStore } from 'pinia';

import type { TaskCategoryModel } from '@/api-clients/opsflow/task-category/schema/model';

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
}

interface UseTaskManagementPageStoreGetters {
    targetCategory: TaskCategoryModel|undefined;
}

export const useTaskManagementPageStore = defineStore('task-management-page', () => {
    const taskCategoryStore = useTaskCategoryStore();
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
    });
    const getters: UseTaskManagementPageStoreGetters = {
        targetCategory: computed<DeepReadonly<TaskCategoryModel>|undefined>(() => taskCategoryStore.getters.taskCategories.find((c) => c.category_id === state.targetCategoryId)),
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
