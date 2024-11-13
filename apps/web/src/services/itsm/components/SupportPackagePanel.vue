<script setup lang="ts">
import { onBeforeMount, reactive, computed } from 'vue';

import {
    PPaneLayout, PHeadingLayout, PFieldTitle, PButton, PDataTable,
} from '@cloudforet/mirinae';
import type { DataTableField } from '@cloudforet/mirinae/src/data-display/tables/data-table/type';

import { useTaskManagementPageStore } from '@/services/itsm/stores/admin/task-management-page-store';


const taskManagementPageStore = useTaskManagementPageStore();
const packageStore = taskManagementPageStore.packageStore;

const state = reactive({
    packageFields: computed<DataTableField[]>(() => [
        {
            name: 'name',
            label: 'Package Name',
            width: '20%',
        },
        {
            name: 'description',
            label: 'Description',
            width: '70%',
        },
        {
            name: 'buttons',
            label: ' ',
        },
    ]),
});

onBeforeMount(() => {
    packageStore.fetchPackages();
});
</script>

<template>
    <p-pane-layout class="mt-4">
        <p-heading-layout class="pt-6 px-4 mb-6">
            <template #heading>
                <p-field-title label="Support Package"
                               size="lg"
                               class="mb-2"
                />
                <p class="text-label-md text-gray-600">
                    계약에 따라 고객이 이용할 수 있는 기능의 묶음입니다. 전체 서비스의 범위를 나타내며, 하위 카테고를 생성할 수 있습니다.
                </p>
            </template>
            <template #extra>
                <p-button icon-left="ic_plus_bold"
                          size="md"
                          style-type="substitutive"
                          @click="taskManagementPageStore.openAddPackageModal()"
                >
                    Add Package
                </p-button>
            </template>
        </p-heading-layout>
        <p-data-table :loading="packageStore.state.loading"
                      :items="packageStore.state.packages"
                      :fields="state.packageFields"
        >
            <template #col-buttons-format="{ item }">
                <p-button icon-left="ic_edit"
                          size="sm"
                          style-type="tertiary"
                          @click="taskManagementPageStore.openEditPackageModal(item.package_id)"
                >
                    Edit
                </p-button>
                <p-button class="ml-2"
                          icon-left="ic_delete"
                          size="sm"
                          style-type="tertiary"
                >
                    Delete
                </p-button>
            </template>
        </p-data-table>
    </p-pane-layout>
</template>

