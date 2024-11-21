import type { ComputedRef, DeepReadonly } from 'vue';
import { reactive, computed } from 'vue';

import { defineStore } from 'pinia';

import type { PackageModel } from '@/schema/identity/package/model';
import type { TaskCategoryModel } from '@/schema/opsflow/task-category/model';

import { usePackageStore } from '@/services/ops-flow/stores/admin/package-store';
import { useTaskCategoryStore } from '@/services/ops-flow/stores/admin/task-category-store';
// import { useTaskTypeStore } from '@/services/ops-flow/stores/task-type-store';

interface UseTaskManagementPageStoreState {
    currentTemplateId?: string;
    // support package
    visiblePackageForm: boolean;
    editTargetPackageId?: string;
    // category
    visibleCategoryForm: boolean;
    editTargetCategoryId?: string;
}

interface UseTaskManagementPageStoreGetters {
    editTargetPackage: ComputedRef<PackageModel|undefined>;
    editTargetCategory: ComputedRef<DeepReadonly<TaskCategoryModel>|undefined>;
    defaultPackage: ComputedRef<PackageModel|undefined>;
}

export const useTaskManagementPageStore = defineStore('task-management-page', () => {
    const packageStore = usePackageStore();
    const taskCategoryStore = useTaskCategoryStore();
    // const taskTypeStore = useTaskTypeStore();
    const state = reactive<UseTaskManagementPageStoreState>({
        currentTemplateId: 'support-center',
        // support package
        visiblePackageForm: false,
        editTargetPackageId: undefined,
        // category
        visibleCategoryForm: false,
        editTargetCategoryId: undefined,
    });
    const getters = reactive<UseTaskManagementPageStoreGetters>({
        editTargetPackage: computed<PackageModel|undefined>(() => packageStore.getters.packages.find((p) => p.package_id === state.editTargetPackageId)),
        editTargetCategory: computed<DeepReadonly<TaskCategoryModel>|undefined>(() => taskCategoryStore.getters.taskCategories.find((c) => c.category_id === state.editTargetCategoryId)),
        defaultPackage: computed<PackageModel|undefined>(() => packageStore.getters.packages.find((p) => p.is_default)),
    });
    const actions = {
        setCurrentTemplateId(templateId: string) {
            state.currentTemplateId = templateId;
        },
        // support package
        openAddPackageForm() {
            state.editTargetPackageId = undefined;
            state.visiblePackageForm = true;
        },
        openEditPackageForm(packageId: string) {
            state.editTargetPackageId = packageId;
            state.visiblePackageForm = true;
        },
        closePackageForm() {
            state.visiblePackageForm = false;
            state.editTargetPackageId = undefined;
        },
        // category
        openAddCategoryForm() {
            state.editTargetCategoryId = undefined;
            state.visibleCategoryForm = true;
        },
        openEditCategoryForm(categoryId: string) {
            state.editTargetCategoryId = categoryId;
            state.visibleCategoryForm = true;
        },
        closeCategoryForm() {
            state.visibleCategoryForm = false;
            state.editTargetCategoryId = undefined;
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
