<script setup lang="ts">
import { reactive, computed } from 'vue';

import {
    PPaneLayout, PHeadingLayout, PHeading, PButton, PDataTable, PBadge, PIconButton, PLink,
} from '@cloudforet/mirinae';
import type { DataTableField } from '@cloudforet/mirinae/src/data-display/tables/data-table/type';

import { makeAdminRouteName } from '@/router/helpers/route-helper';

import ActionMenuButton from '@/common/components/buttons/ActionMenuButton.vue';

import { OPS_FLOW_ROUTE } from '@/services/ops-flow/routes/route-constant';
import { useTaskManagementPageStore } from '@/services/ops-flow/stores/admin/task-management-page-store';


const taskManagementPageStore = useTaskManagementPageStore();
const taskCategoryStore = taskManagementPageStore.taskCategoryStore;
const packageStore = taskManagementPageStore.packageStore;

const state = reactive({
    categoryFields: computed<DataTableField[]>(() => [
        {
            name: 'name',
            label: 'Category Name',
            width: '20%',
        },
        {
            name: 'package',
            label: 'Package',
            width: '10%',
            sortable: true,
        },
        {
            name: 'description',
            label: 'Description',
            width: '60%',
        },
        {
            name: 'buttons',
            label: ' ',
        },
    ]),
    packageMap: computed(() => {
        if (!packageStore.getters.packages) return {};
        return packageStore.getters.packages.reduce((acc, cur) => {
            acc[cur.package_id] = cur;
            return acc;
        }, {} as Record<string, any>);
    }),
});

</script>

<template>
    <p-pane-layout>
        <p-heading-layout class="pt-6 px-4 mb-2">
            <template #heading>
                <p-heading title="Task Category"
                           heading-type="sub"
                />
            </template>
            <template #extra>
                <p-icon-button name="ic_refresh" />
                <p-button icon-left="ic_plus_bold"
                          size="md"
                          style-type="substitutive"
                          @click="taskManagementPageStore.openAddCategoryForm()"
                >
                    Add Category
                </p-button>
            </template>
        </p-heading-layout>
        <p class="px-4 mb-6 text-label-md text-gray-600">
            티켓의 유형을 그룹화한 것입니다. 고객은 티켓을 제출할 때 적절한 카테고리를 선택하여 담당자가 티켓을 효율적으로 관리할 수 있게 돕습니다.
        </p>
        <p-data-table :loading="taskCategoryStore.state.loading"
                      :items="taskCategoryStore.getters.taskCategories"
                      :fields="state.categoryFields"
        >
            <template #col-name-format="{ item }">
                <p-link :text="item.name"
                        :to="{
                            name: makeAdminRouteName(OPS_FLOW_ROUTE.TASK_MANAGEMENT.TASK_CATEGORY.DETAIL._NAME),
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
                    {{ state.packageMap[item.package_id] ? state.packageMap[item.package_id].name : item.package_id }}
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

