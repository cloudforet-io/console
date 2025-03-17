<script setup lang="ts">
import { computed } from 'vue';

import {
    PPaneLayout, PHeadingLayout, PHeading, PButton, PDataTable, PBadge, PIconButton, PLink,
} from '@cloudforet/mirinae';
import type { DataTableField } from '@cloudforet/mirinae/types/data-display/tables/data-table/type';

import { getParticle, i18n as _i18n } from '@/translations';


import ActionMenuButton from '@/common/components/buttons/ActionMenuButton.vue';

import { useAvailableCategories } from '@/services/ops-flow/composables/use-available-categories';
import { usePackagesQuery } from '@/services/ops-flow/composables/use-packages-query';
import { ADMIN_OPS_FLOW_ROUTE } from '@/services/ops-flow/routes/admin/route-constant';
import { useTaskManagementPageStore } from '@/services/ops-flow/stores/admin/task-management-page-store';
import {
    useTaskManagementTemplateStore,
} from '@/services/ops-flow/task-management-templates/stores/use-task-management-template-store';


const taskManagementPageStore = useTaskManagementPageStore();
const taskManagementTemplateStore = useTaskManagementTemplateStore();

/* packages */
const { packages } = usePackagesQuery();
const packageMap = computed(() => {
    if (!packages.value) return {};
    return packages.value.reduce((acc, cur) => {
        acc[cur.package_id] = cur;
        return acc;
    }, {} as Record<string, any>);
});

/* task categories */
const { availableCategories, isLoading, refetch } = useAvailableCategories();

/* table fields */
const categoryFields = computed<DataTableField[]>(() => [
    {
        name: 'name',
        label: _i18n.t('OPSFLOW.NAME') as string,
        width: '30%',
    },
    {
        name: 'package',
        label: _i18n.t('OPSFLOW.PACKAGE') as string,
        width: '25%',
        sortable: true,
    },
    {
        name: 'description',
        label: _i18n.t('OPSFLOW.DESCRIPTION') as string,
        width: '45%',
    },
    {
        name: 'buttons',
        label: ' ',
    },
]);


</script>

<template>
    <p-pane-layout>
        <p-heading-layout class="pt-6 px-4 mb-2">
            <template #heading>
                <p-heading :title="taskManagementTemplateStore.templates.TaskCategory"
                           heading-type="sub"
                />
            </template>
            <template #extra>
                <p-icon-button name="ic_refresh"
                               @click="refetch"
                />
                <p-button icon-left="ic_plus_bold"
                          size="md"
                          style-type="substitutive"
                          @click="taskManagementPageStore.openAddCategoryForm()"
                >
                    {{ $t('OPSFLOW.ADD_TARGET', { target: $t('OPSFLOW.CATEGORY')}) }}
                </p-button>
            </template>
        </p-heading-layout>
        <p class="px-4 mb-6 text-label-md text-gray-600">
            {{ $t('OPSFLOW.TASK_MANAGEMENT.CATEGORY.DESC', {
                task: taskManagementTemplateStore.templates.task,
                tasks: taskManagementTemplateStore.templates.tasks,
                taskObjectParticle: getParticle(taskManagementTemplateStore.templates.task, 'object'),
                tasksObjectParticle: getParticle(taskManagementTemplateStore.templates.tasks, 'object'),
            }) }}
        </p>
        <p-data-table :loading="isLoading"
                      :items="availableCategories"
                      :fields="categoryFields"
        >
            <template #col-name-format="{ item }">
                <p-link :text="item.name"
                        :to="{
                            name: ADMIN_OPS_FLOW_ROUTE.TASK_MANAGEMENT.TASK_CATEGORY.DETAIL._NAME,
                            params: { taskCategoryId: item.category_id }
                        }"
                        highlight
                />
            </template>
            <template #col-package-format="{ item }">
                <p-badge shape="square"
                         badge-type="subtle"
                         style-type="gray200"
                         size="md"
                >
                    {{ packageMap[item.package_id] ? packageMap[item.package_id].name : item.package_id }}
                </p-badge>
            </template>
            <template #col-buttons-format="{ item }">
                <div class="flex justify-end">
                    <action-menu-button @edit="taskManagementPageStore.openEditCategoryForm(item.category_id)"
                                        @delete="taskManagementPageStore.openDeleteCategoryModal(item.category_id)"
                    />
                </div>
            </template>
        </p-data-table>
    </p-pane-layout>
</template>

