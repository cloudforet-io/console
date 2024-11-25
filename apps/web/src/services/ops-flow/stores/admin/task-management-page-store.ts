import type { ComputedRef, DeepReadonly } from 'vue';
import { reactive, computed } from 'vue';

import { defineStore } from 'pinia';

import type { PackageModel } from '@/schema/identity/package/model';
import type { TaskCategoryModel } from '@/schema/opsflow/task-category/model';

import type { WorkspaceItem } from '@/store/reference/workspace-reference-store';
import { useWorkspaceReferenceStore } from '@/store/reference/workspace-reference-store';

import { usePackageStore } from '@/services/ops-flow/stores/admin/package-store';
import { useTaskCategoryStore } from '@/services/ops-flow/stores/admin/task-category-store';
// import { useTaskTypeStore } from '@/services/ops-flow/stores/task-type-store';

interface UseTaskManagementPageStoreState {
    currentTemplateId?: string;
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
    targetPackage: ComputedRef<PackageModel|undefined>;
    associatedCategoriesToPackage: ComputedRef<DeepReadonly<TaskCategoryModel[]>>;
    associatedWorkspacesToPackage: ComputedRef<WorkspaceItem[]>;
    targetCategory: ComputedRef<DeepReadonly<TaskCategoryModel>|undefined>;
    defaultPackage: ComputedRef<PackageModel|undefined>;
}

export const useTaskManagementPageStore = defineStore('task-management-page', () => {
    const packageStore = usePackageStore();
    const taskCategoryStore = useTaskCategoryStore();
    const workspaceReferenceStore = useWorkspaceReferenceStore();
    // const taskTypeStore = useTaskTypeStore();
    const state = reactive<UseTaskManagementPageStoreState>({
        currentTemplateId: 'support-center',
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
    const getters = reactive<UseTaskManagementPageStoreGetters>({
        targetPackage: computed<PackageModel|undefined>(() => packageStore.getters.packages.find((p) => p.package_id === state.targetPackageId)),
        associatedCategoriesToPackage: computed<DeepReadonly<TaskCategoryModel[]>>(() => taskCategoryStore.getters.taskCategories.filter((c) => c.package_id === state.targetPackageId)),
        associatedWorkspacesToPackage: computed<WorkspaceItem[]>(() => {
            const targetPackageId = state.targetPackageId;
            if (!targetPackageId) return [];
            const workspaceItems: WorkspaceItem[] = Object.values(workspaceReferenceStore.getters.workspaceItems);
            return workspaceItems.filter((w) => w.data.packages?.includes(targetPackageId));
        }),
        targetCategory: computed<DeepReadonly<TaskCategoryModel>|undefined>(() => taskCategoryStore.getters.taskCategories.find((c) => c.category_id === state.targetCategoryId)),
        defaultPackage: computed<PackageModel|undefined>(() => packageStore.getters.packages.find((p) => p.is_default)),
    });
    const actions = {
        setCurrentTemplateId(templateId: string) {
            state.currentTemplateId = templateId;
        },
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
            state.targetPackageId = undefined;
        },
        openDeletePackageModal(packageId: string) {
            state.targetPackageId = packageId;
            state.visibleDeletePackageModal = true;
        },
        closeDeletePackageModal() {
            state.visibleDeletePackageModal = false;
            state.targetPackageId = undefined;
        },
        openSetDefaultPackageModal(packageId: string) {
            state.targetPackageId = packageId;
            state.visibleSetDefaultPackageModal = true;
        },
        closeSetDefaultPackageModal() {
            state.visibleSetDefaultPackageModal = false;
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
            state.targetCategoryId = undefined;
        },
        openDeleteCategoryModal(categoryId: string) {
            state.targetCategoryId = categoryId;
            state.visibleDeleteCategoryModal = true;
        },
        closeDeleteCategoryModal() {
            state.visibleDeleteCategoryModal = false;
            state.targetCategoryId = undefined;
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
