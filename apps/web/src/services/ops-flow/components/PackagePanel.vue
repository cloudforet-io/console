<script setup lang="ts">
import { computed } from 'vue';

import {
    PPaneLayout, PHeadingLayout, PHeading, PButton, PDataTable, PIconButton, PBadge,
} from '@cloudforet/mirinae';
import type { DataTableField } from '@cloudforet/mirinae/types/data-display/tables/data-table/type';

import { i18n as _i18n } from '@/translations';

import ActionMenuButton from '@/common/components/buttons/ActionMenuButton.vue';
import type { ActionMenuItem } from '@/common/components/buttons/type';

import { useDefaultPackage } from '@/services/ops-flow/composables/use-default-package';
import { usePackagesQuery } from '@/services/ops-flow/composables/use-packages-query';
import { useTaskManagementPageStore } from '@/services/ops-flow/stores/admin/task-management-page-store';


const taskManagementPageStore = useTaskManagementPageStore();
const { defaultPackage } = useDefaultPackage();

/* package list query */
const { packages, isLoading, refetch } = usePackagesQuery();

/* table fields */
const packageFields = computed<DataTableField[]>(() => [
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
]);

/* action menu */
const actionMenu = computed<ActionMenuItem[]>(() => [
    { name: 'edit', icon: 'ic_edit', label: _i18n.t('COMMON.BUTTONS.EDIT') as string },
    { name: 'set-as-default', icon: 'ic_check-circle', label: _i18n.t('OPSFLOW.SET_AS_DEFAULT') as string },
    { name: 'delete', icon: 'ic_delete', label: _i18n.t('COMMON.BUTTONS.DELETE') as string },
]);
const defaultPackageActionMenu = computed<ActionMenuItem[]>(() => [
    {
        name: 'edit', icon: 'ic_edit', label: _i18n.t('COMMON.BUTTONS.EDIT') as string,
    },
    {
        name: 'set-as-default', icon: 'ic_check-circle', label: _i18n.t('OPSFLOW.SET_AS_DEFAULT') as string, disabled: true, iconColor: 'inherit',
    },
    {
        name: 'delete', icon: 'ic_delete', label: _i18n.t('COMMON.BUTTONS.DELETE') as string, disabled: true, iconColor: 'inherit',
    },
]);
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
                               @click="refetch()"
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
        <p-data-table :loading="isLoading"
                      :items="packages"
                      :fields="packageFields"
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
                    <action-menu-button :menu="item.package_id === defaultPackage?.package_id
                                            ? defaultPackageActionMenu
                                            : actionMenu"
                                        @edit="taskManagementPageStore.openEditPackageForm(item.package_id)"
                                        @set-as-default="taskManagementPageStore.openSetDefaultPackageModal(item.package_id)"
                                        @delete="taskManagementPageStore.openDeletePackageModal(item.package_id)"
                    />
                </div>
            </template>
        </p-data-table>
    </p-pane-layout>
</template>

