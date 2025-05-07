<script setup lang="ts">
import { computed } from 'vue';

import {
    PHeadingLayout, PHeading, PButton, PIconButton, PDataTable, PBadge,
} from '@cloudforet/mirinae';
import type { DataTableField } from '@cloudforet/mirinae/types/data-display/tables/data-table/type';

import { i18n as _i18n } from '@/translations';

import ActionMenuButton from '@/common/components/buttons/ActionMenuButton.vue';

import { useTaskTypesQuery } from '@/services/ops-flow/composables/use-task-types-query';
import { useTaskCategoryPageStore } from '@/services/ops-flow/stores/admin/task-category-page-store';
import {
    useTaskManagementTemplateStore,
} from '@/services/ops-flow/task-management-templates/stores/use-task-management-template-store';

const taskCategoryPageStore = useTaskCategoryPageStore();
const taskManagementTemplateStore = useTaskManagementTemplateStore();

const taskTypeFields = computed<DataTableField[]>(() => [
    {
        name: 'name',
        label: _i18n.t('OPSFLOW.NAME') as string,
        width: '20%',
    },
    {
        name: 'require_project',
        label: _i18n.t('OPSFLOW.SCOPE') as string,
        width: '12%',
    },
    {
        name: 'description',
        label: _i18n.t('OPSFLOW.DESCRIPTION') as string,
        width: '70%',
    },
    {
        name: 'buttons',
        label: ' ',
    },
]);

const { taskTypes, isLoading, refetch } = useTaskTypesQuery({
    params: computed(() => ({
        query: {
            filter: [{ k: 'category_id', v: taskCategoryPageStore.state.currentCategoryId, o: 'eq' }],
        },
    })),
    enabled: computed(() => !!taskCategoryPageStore.state.currentCategoryId),
});
</script>

<template>
    <div class="py-6">
        <p-heading-layout class="px-4">
            <template #heading>
                <p-heading heading-type="sub">
                    {{ taskManagementTemplateStore.templates.TaskType }}
                </p-heading>
            </template>
            <template #extra>
                <p-icon-button name="ic_refresh"
                               @click="refetch"
                />
                <p-button style-type="substitutive"
                          icon-left="ic_plus_bold"
                          @click="taskCategoryPageStore.openAddTaskTypeForm()"
                >
                    {{ $t('OPSFLOW.ADD_TARGET', { target: taskManagementTemplateStore.templates.TaskType }) }}
                </p-button>
            </template>
        </p-heading-layout>
        <i18n path="OPSFLOW.TASK_MANAGEMENT.TASK_TYPE.DESC"
              tag="p"
              class="px-4 mt-2 mb-6 text-label-md text-gray-600 first-letter:capitalize"
        >
            <!-- CAUTION: Do not remove the following comments. They are used to prevent auto-formatting of the template. -->
            <!-- In this case, template tags must be in a single line to prevent inserting unnecessary spaces. -->
            <!-- eslint-disable-next-line vue/singleline-html-element-content-newline -->
            <template #taskTypes>{{ taskManagementTemplateStore.templates.taskTypes }}</template>
            <!-- eslint-disable-next-line vue/singleline-html-element-content-newline -->
            <template #task>{{ taskManagementTemplateStore.templates.task }}</template>
            <!-- eslint-disable-next-line vue/singleline-html-element-content-newline -->
            <template #tasks>{{ taskManagementTemplateStore.templates.tasks }}</template>
            <template #br>
                <br>
            </template>
        </i18n>
        <p-data-table :loading="isLoading"
                      :items="taskTypes"
                      :fields="taskTypeFields"
        >
            <template #col-require_project-format="{ value }">
                <p-badge :style-type="value ? 'primary' : 'secondary1'"
                         badge-type="solid-outline"
                >
                    {{ $t(`OPSFLOW.${value ? 'PROJECT' : 'WORKSPACE'}`) }}
                </p-badge>
            </template>
            <template #col-buttons-format="{ item }">
                <div class="flex justify-end">
                    <action-menu-button @edit="taskCategoryPageStore.openEditTaskTypeForm(item.task_type_id)"
                                        @delete="taskCategoryPageStore.openDeleteTaskTypeModal(item.task_type_id)"
                    />
                </div>
            </template>
        </p-data-table>
    </div>
</template>
