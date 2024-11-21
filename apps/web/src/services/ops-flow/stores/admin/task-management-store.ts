import type { ComputedRef, DeepReadonly } from 'vue';
import { reactive, computed } from 'vue';

import { defineStore } from 'pinia';

import type { PackageModel } from '@/schema/identity/package/model';
import type { TaskCategoryModel } from '@/schema/opsflow/task-category/model';

import { usePackageDataStore } from '@/services/ops-flow/stores/admin/package-data-store';
import { useTaskCategoryDataStore } from '@/services/ops-flow/stores/admin/task-category-data-store';
// import { useTaskTypeStore } from '@/services/ops-flow/stores/task-type-store';

interface UseTaskManagementStoreState {
    currentTemplateId?: string;
    // support package
    visiblePackageForm: boolean;
    editTargetPackageId?: string;
    // category
    visibleCategoryForm: boolean;
    editTargetCategoryId?: string;
}

interface UseTaskManagementStoreGetters {
    editTargetPackage: ComputedRef<PackageModel|undefined>;
    editTargetCategory: ComputedRef<DeepReadonly<TaskCategoryModel>|undefined>;
    defaultPackage: ComputedRef<PackageModel|undefined>;
}

export const useTaskManagementStore = defineStore('task-management', () => {
    const packageStore = usePackageDataStore();
    const taskCategoryStore = useTaskCategoryDataStore();
    // const taskTypeStore = useTaskTypeStore();
    const state = reactive<UseTaskManagementStoreState>({
        currentTemplateId: 'support-center',
        // support package
        visiblePackageForm: false,
        editTargetPackageId: undefined,
        // category
        visibleCategoryForm: false,
        editTargetCategoryId: undefined,
    });
    const getters = reactive<UseTaskManagementStoreGetters>({
        editTargetPackage: computed<PackageModel|undefined>(() => packageStore.state.packages?.find((p) => p.package_id === state.editTargetPackageId)),
        editTargetCategory: computed<DeepReadonly<TaskCategoryModel>|undefined>(() => taskCategoryStore.getters.taskCategories.find((c) => c.category_id === state.editTargetCategoryId)),
        defaultPackage: computed<PackageModel|undefined>(() => packageStore.state.packages?.find((p) => p.is_default)),
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
