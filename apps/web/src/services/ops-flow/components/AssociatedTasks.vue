<script setup lang="ts">
import { computed } from 'vue';

import { PDataTable, PLink, PSkeleton } from '@cloudforet/mirinae';
import type { DataTableField } from '@cloudforet/mirinae/types/data-display/tables/data-table/type';

import type { TaskModel } from '@/schema/opsflow/task/model';
import { i18n } from '@/translations';

import { useWorkspaceReferenceStore } from '@/store/reference/workspace-reference-store';

import BoardTaskDescriptionField from '@/services/ops-flow/components/BoardTaskDescriptionField.vue';
import BoardTaskNameField from '@/services/ops-flow/components/BoardTaskNameField.vue';
import {
    useTaskManagementTemplateStore,
} from '@/services/ops-flow/task-management-templates/stores/use-task-management-template-store';
import { WORKSPACE_HOME_ROUTE } from '@/services/workspace-home/routes/route-constant';

const props = defineProps<{
    tasks: TaskModel[];
}>();
const taskTemplateManagementStore = useTaskManagementTemplateStore();
const workspaceReferenceStore = useWorkspaceReferenceStore();
const fields = computed<DataTableField[]>(() => [
    {
        name: 'name',
        label: i18n.t('OPSFLOW.FIELD_NAME', { field: taskTemplateManagementStore.templates.task }) as string,
    },
    {
        name: 'description',
        label: i18n.t('OPSFLOW.FIELD_DESCRIPTION', { field: taskTemplateManagementStore.templates.task }) as string,
    },
    {
        name: 'workspace_id',
        label: i18n.t('OPSFLOW.WORKSPACE') as string,
    },
]);
const hasWorkspaceReferenceLoaded = computed<boolean>(() => !!workspaceReferenceStore.getters.workspaceItems);
const getWorkspaceName = (workspaceId: string) => workspaceReferenceStore.getters.workspaceItems[workspaceId]?.label || workspaceId;
</script>

<template>
    <div>
        <p-data-table :fields="fields"
                      :items="props.tasks"
        >
            <template #col-name-format="{item}">
                <board-task-name-field :task-id="item.task_id"
                                       :workspace-id="item.workspace_id"
                                       :name="item.name"
                                       link-new-tab
                />
            </template>
            <template #col-description-format="{item}">
                <board-task-description-field :description="item.description"
                                              :files="item.files"
                />
            </template>
            <template #col-workspace_id-format="{item}">
                <p-skeleton v-if="!hasWorkspaceReferenceLoaded"
                            width="100%"
                />
                <p-link v-else
                        :text="item.workspace_id"
                        :to="{
                            name: WORKSPACE_HOME_ROUTE._NAME,
                            params: {
                                workspaceId: item.workspace_id,
                            },
                        }"
                        action-icon="internal-link"
                        new-tab
                >
                    {{ getWorkspaceName(item.workspace_id) }}
                </p-link>
            </template>
        </p-data-table>
    </div>
</template>

