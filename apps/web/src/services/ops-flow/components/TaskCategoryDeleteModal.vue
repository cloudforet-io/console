<script setup lang="ts">
import { computed } from 'vue';

import { useMutation, useQueryClient } from '@tanstack/vue-query';

import { PButtonModal } from '@cloudforet/mirinae/';

import { useTaskCategoryApi } from '@/api-clients/opsflow/task-category/composables/use-task-category-api';
import type { TaskModel } from '@/api-clients/opsflow/task/schema/model';
import { useServiceQueryKey } from '@/query/query-key/use-service-query-key';
import { getParticle, i18n as _i18n } from '@/translations';

import type { WorkspaceItem } from '@/store/reference/workspace-reference-store';
import { useWorkspaceReferenceStore } from '@/store/reference/workspace-reference-store';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import AssociatedTasks from '@/services/ops-flow/components/AssociatedTasks.vue';
import { useAssociatedTasksQuery } from '@/services/ops-flow/composables/use-associated-tasks-query';
import { useCategoriesQuery } from '@/services/ops-flow/composables/use-categories-query';
import { useTaskManagementPageStore } from '@/services/ops-flow/stores/admin/task-management-page-store';
import {
    useTaskManagementTemplateStore,
} from '@/services/ops-flow/task-management-templates/stores/use-task-management-template-store';



const taskManagementPageStore = useTaskManagementPageStore();
const taskManagementPageState = taskManagementPageStore.state;
const taskManagementTemplateStore = useTaskManagementTemplateStore();
const workspaceReferenceStore = useWorkspaceReferenceStore();

const deletable = computed(() => !tasks.value?.length);
const headerTitle = computed(() => {
    if (isLoading.value) {
        return ' ';
    }
    return deletable.value
        ? _i18n.t('OPSFLOW.DELETE_TARGET_CONFIRMATION', {
            object: _i18n.t('OPSFLOW.CATEGORY'),
            particle: getParticle(_i18n.t('OPSFLOW.CATEGORY') as string, 'object'),
        })
        : _i18n.t('OPSFLOW.DELETE_TARGET', { target: _i18n.t('OPSFLOW.CATEGORY') });
});

/* active status */
const enabled = computed(() => !!taskManagementPageState.visibleDeleteCategoryModal && !!taskManagementPageState.targetCategoryId);

/* task categories */
const { categories } = useCategoriesQuery({ enabled });

/* target category */
const targetCategory = computed(() => categories.value?.find((c) => c.category_id === taskManagementPageState.targetCategoryId));

/* delete category */
const { taskCategoryAPI } = useTaskCategoryApi();
const { key: taskCategoryListQueryKey } = useServiceQueryKey('opsflow', 'task-category', 'list');

const queryClient = useQueryClient();
const { mutate: deleteCategory, isPending: isDeleting } = useMutation({
    mutationFn: ({ categoryId }: {categoryId?: string}) => {
        if (!categoryId) throw new Error('[Console Error] Cannot delete category without a target category');
        return taskCategoryAPI.delete({ category_id: categoryId });
    },
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: taskCategoryListQueryKey.value });
        showSuccessMessage(_i18n.t('OPSFLOW.ALT_S_DELETE_TARGET', { target: _i18n.t('OPSFLOW.CATEGORY') }), '');
    },
    onError: (e) => {
        ErrorHandler.handleRequestError(e, _i18n.t('OPSFLOW.ALT_E_DELETE_TARGET', { target: _i18n.t('OPSFLOW.CATEGORY') }), true);
    },
    onSettled: () => {
        taskManagementPageStore.closeDeleteCategoryModal();
    },
});

/* modal event handlers */
const handleConfirm = () => {
    deleteCategory({ categoryId: taskManagementPageState.targetCategoryId });
};
const handleCloseOrCancel = () => {
    taskManagementPageStore.closeDeleteCategoryModal();
};
const handleClosed = () => {
    taskManagementPageStore.resetTargetCategoryId();
};


/* load associated tasks */
const {
    tasks, isLoading,
} = useAssociatedTasksQuery({
    params: computed(() => ({ category_id: taskManagementPageState.targetCategoryId })),
    enabled: computed(() => !!taskManagementPageState.visibleDeleteCategoryModal && !!taskManagementPageState.targetCategoryId),
});

/*
 * Filters tasks to only include tasks that were created in workspaces bound to the package of the selected category
 * Used to check if there are any tasks that would be affected by deleting this category
 *
 * 선택된 카테고리의 패키지와 바인딩된 워크스페이스에서 생성된 태스크만 필터링
 * 이 카테고리를 삭제할 때 영향을 받을 태스크가 있는지 확인하는데 사용
 */
const filteredTasksByWorkspace = computed<TaskModel[]>(() => {
    if (!tasks.value?.length || !targetCategory.value) return [];
    const packageId = targetCategory.value?.package_id;
    if (!packageId) return [];
    const workspaceItems: WorkspaceItem[] = Object.values(workspaceReferenceStore.getters.workspaceItems);
    const relatedWorkspaceIds = workspaceItems.filter((w) => w.data.packages?.includes(packageId)).map((w) => w.key);
    return tasks.value.filter((t) => relatedWorkspaceIds.includes(t.workspace_id));
});
</script>

<template>
    <p-button-modal :visible="taskManagementPageState.visibleDeleteCategoryModal"
                    theme-color="alert"
                    :header-title="headerTitle"
                    :size="deletable ? 'sm' : 'md'"
                    :is-loading="isDeleting"
                    :loading-backdrop="isLoading"
                    @confirm="handleConfirm"
                    @close="handleCloseOrCancel"
                    @cancel="handleCloseOrCancel"
                    @closed="handleClosed"
    >
        <template #body>
            <div v-if="!deletable">
                <p class="text-paragraph-lg font-bold mb-4">
                    {{ $t('OPSFLOW.TASK_MANAGEMENT.CATEGORY.DELETE_CONFIRMATION_DESC', {
                        tasks: taskManagementTemplateStore.templates.tasks,
                        particle: getParticle(taskManagementTemplateStore.templates.tasks, 'subject')
                    }) }}
                </p>
                <associated-tasks :tasks="filteredTasksByWorkspace" />
            </div>
        </template>
    </p-button-modal>
</template>
