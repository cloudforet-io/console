<script setup lang="ts">
import { reactive, computed } from 'vue';

import {
    PPaneLayout, PHeadingLayout, PHeading, PButton, PDataTable, PIconButton, PBadge,
} from '@cloudforet/mirinae';
import type { MenuItem } from '@cloudforet/mirinae/types/controls/context-menu/type';
import type { DataTableField } from '@cloudforet/mirinae/types/data-display/tables/data-table/type';

import ActionMenuButton from '@/common/components/buttons/ActionMenuButton.vue';

import { useTaskManagementPageStore } from '@/services/ops-flow/stores/admin/task-management-page-store';


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
    menu: computed<MenuItem[]>(() => [
        { name: 'edit', icon: 'ic_edit', label: 'Edit' },
        { name: 'set-as-default', icon: 'ic_check-circle', label: 'Set as Default' },
        { name: 'delete', icon: 'ic_delete', label: 'Delete' },
    ]),
});
</script>

<template>
    <p-pane-layout class="mt-4">
        <p-heading-layout class="pt-6 px-4 mb-2">
            <template #heading>
                <p-heading title="Support Package"
                           heading-type="sub"
                />
            </template>
            <template #extra>
                <p-icon-button name="ic_refresh"
                               @click="packageStore.list()"
                />
                <p-button icon-left="ic_plus_bold"
                          size="md"
                          style-type="substitutive"
                          @click="taskManagementPageStore.openAddPackageForm()"
                >
                    Add Package
                </p-button>
            </template>
        </p-heading-layout>
        <p class="px-4 mb-6 text-label-md text-gray-600">
            계약에 따라 고객이 이용할 수 있는 기능의 묶음입니다. 전체 서비스의 범위를 나타내며, 하위 카테고를 생성할 수 있습니다.
        </p>
        <p-data-table :loading="packageStore.state.loading"
                      :items="packageStore.getters.packages"
                      :fields="state.packageFields"
        >
            <template #col-name-format="{ item }">
                <span class="inline-flex items-center gap-2">
                    {{ item.name }}
                    <p-badge v-if="item.is_default"
                             badge-type="solid-outline"
                             style-type="gray500"
                    >
                        Default
                    </p-badge>
                </span>
            </template>
            <template #col-buttons-format="{ item }">
                <div class="flex justify-end">
                    <action-menu-button :menu="item.package_id === taskManagementPageStore.getters.defaultPackage?.package_id
                                            ? undefined
                                            : state.menu"
                                        @edit="taskManagementPageStore.openEditPackageForm(item.package_id)"
                                        @set-as-default="taskManagementPageStore.openSetDefaultPackageModal(item.package_id)"
                                        @delete="taskManagementPageStore.openDeletePackageModal(item.package_id)"
                    />
                </div>
            </template>
        </p-data-table>
    </p-pane-layout>
</template>

