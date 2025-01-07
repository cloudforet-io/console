<script setup lang="ts">
import { reactive, computed } from 'vue';

import {
    PPaneLayout, PHeadingLayout, PHeading, PButton, PDataTable, PIconButton, PBadge,
} from '@cloudforet/mirinae';
import type { MenuItem } from '@cloudforet/mirinae/types/controls/context-menu/type';
import type { DataTableField } from '@cloudforet/mirinae/types/data-display/tables/data-table/type';

import { i18n as _i18n } from '@/translations';

import ActionMenuButton from '@/common/components/buttons/ActionMenuButton.vue';

import { usePackageStore } from '@/services/ops-flow/stores/admin/package-store';
import { useTaskManagementPageStore } from '@/services/ops-flow/stores/admin/task-management-page-store';

const taskManagementPageStore = useTaskManagementPageStore();
const packageStore = usePackageStore();

const state = reactive({
    packageFields: computed<DataTableField[]>(() => [
        {
            name: 'name',
            label: _i18n.t('OPSFLOW.NAME') as string,
            width: '30%',
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
    ]),
    menu: computed<MenuItem[]>(() => [
        { name: 'edit', icon: 'ic_edit', label: _i18n.t('COMMON.BUTTONS.EDIT') as string },
        { name: 'set-as-default', icon: 'ic_check-circle', label: _i18n.t('OPSFLOW.SET_AS_DEFAULT') as string },
        { name: 'delete', icon: 'ic_delete', label: _i18n.t('COMMON.BUTTONS.DELETE') as string },
    ]),
    defaultPackageMenu: computed<MenuItem[]>(() => [
        {
            name: 'edit', icon: 'ic_edit', label: _i18n.t('COMMON.BUTTONS.EDIT') as string,
        },
        {
            name: 'set-as-default', icon: 'ic_check-circle', label: _i18n.t('OPSFLOW.SET_AS_DEFAULT') as string, disabled: true, iconColor: 'inherit',
        },
        {
            name: 'delete', icon: 'ic_delete', label: _i18n.t('COMMON.BUTTONS.DELETE') as string, disabled: true, iconColor: 'inherit',
        },
    ]),
});
</script>

<template>
    <p-pane-layout>
        <p-heading-layout class="pt-6 px-4 mb-2">
            <template #heading>
                <p-heading :title="$t('OPSFLOW.SUPPORT_PACKAGE')"
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
                    {{ $t('OPSFLOW.ADD_TARGET', { target: $t('OPSFLOW.PACKAGE') }) }}
                </p-button>
            </template>
        </p-heading-layout>
        <p class="px-4 mb-6 text-label-md text-gray-600">
            {{ $t('OPSFLOW.TASK_MANAGEMENT.PACKAGE.DESC') }}
        </p>
        <p-data-table :loading="packageStore.getters.loading"
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
                        {{ $t('OPSFLOW.DEFAULT') }}
                    </p-badge>
                </span>
            </template>
            <template #col-buttons-format="{ item }">
                <div class="flex justify-end">
                    <action-menu-button :menu="item.package_id === taskManagementPageStore.getters.defaultPackage?.package_id
                                            ? state.defaultPackageMenu
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

