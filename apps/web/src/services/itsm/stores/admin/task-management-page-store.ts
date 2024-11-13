import type { ComputedRef } from 'vue';
import { reactive, computed } from 'vue';

import { defineStore } from 'pinia';

import { usePackageStore } from '@/services/itsm/stores/admin/package-store';
import { useTaskCategoryStore } from '@/services/itsm/stores/task-category-store';
// import { useTaskTypeStore } from '@/services/itsm/stores/task-type-store';

interface UseTaskManagementPageStoreState {
    currentTemplateId?: string;
    // support package
    visibleAddOrEditPackageModal: boolean;
    editTargetPackageId?: string;
    // category
    visibleAddOrEditCategoryModal: boolean;
    editTargetCategoryId?: string;
}

interface UseTaskManagementPageStoreGetters {
    currentTemplate: ComputedRef<any>;

}

export const useTaskManagementPageStore = defineStore('task-management-page', () => {
    const packageStore = usePackageStore();
    const taskCategoryStore = useTaskCategoryStore();
    // const taskTypeStore = useTaskTypeStore();
    const state = reactive<UseTaskManagementPageStoreState>({
        currentTemplateId: 'support-center',
        // support package
        visibleAddOrEditPackageModal: false,
        editTargetPackageId: undefined,
        // category
        visibleAddOrEditCategoryModal: false,
        editTargetCategoryId: undefined,
    });
    const getters = reactive<UseTaskManagementPageStoreGetters>({
        currentTemplate: computed(() => ({
            title: 'Support Center',
            task_category: 'Ticket Category',
            task_type: 'Ticket Topic',
        })),

    });
    const actions = {
        setCurrentTemplateId(templateId: string) {
            state.currentTemplateId = templateId;
        },
        // support package
        openAddPackageModal() {
            state.editTargetPackageId = undefined;
            state.visibleAddOrEditPackageModal = true;
        },
        closeAddOrEditPackageModal() {
            state.editTargetPackageId = undefined;
            state.visibleAddOrEditPackageModal = false;
        },
        openEditPackageModal(packageId: string) {
            state.editTargetPackageId = packageId;
            state.visibleAddOrEditPackageModal = true;
        },
        // category
        openAddCategoryModal() {
            state.editTargetCategoryId = undefined;
            state.visibleAddOrEditCategoryModal = true;
        },
        closeAddOrEditCategoryModal() {
            state.editTargetCategoryId = undefined;
            state.visibleAddOrEditCategoryModal = false;
        },
        openEditCategoryModal(categoryId: string) {
            state.editTargetCategoryId = categoryId;
            state.visibleAddOrEditCategoryModal = true;
        },
    };
    return {
        packageStore,
        taskCategoryStore,
        state,
        getters,
        ...actions,
    };
});
