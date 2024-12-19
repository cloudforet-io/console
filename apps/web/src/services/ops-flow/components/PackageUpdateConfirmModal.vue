<script setup lang="ts">
import { computed, ref } from 'vue';

import {
    PButtonModal, PDataTable, PBadge, PCheckbox,
} from '@cloudforet/mirinae';
import type { SelectDropdownMenuItem } from '@cloudforet/mirinae/types/controls/dropdown/select-dropdown/type';
import type { DataTableField } from '@cloudforet/mirinae/types/data-display/tables/data-table/type';

import { i18n as _i18n } from '@/translations';

const props = defineProps<{
    visible: boolean;
    selectedWorkspaces: SelectDropdownMenuItem[];
    addedWorkspaces: SelectDropdownMenuItem[];
    removedWorkspaces: SelectDropdownMenuItem[];
    selectedCategories: SelectDropdownMenuItem[];
    addedCategories: SelectDropdownMenuItem[];
    removedCategories: SelectDropdownMenuItem[];
}>();
const emit = defineEmits<{(event: 'cancel'): void;
    (event: 'confirm'): void;
}>();
type DataType = 'category'|'workspace';
type LinkStatus = 'removed'|'added'|'unchanged';
interface Item extends SelectDropdownMenuItem {
    linkStatus: LinkStatus;
}
const isAdded = (d: SelectDropdownMenuItem, type: DataType) => {
    if (type === 'category') {
        return !!props.addedCategories.find((ac) => ac.name === d.name);
    }
    return !!props.addedWorkspaces.find((aw) => aw.name === d.name);
};
const isRemoved = (d: SelectDropdownMenuItem, type: DataType) => {
    if (type === 'category') {
        return !!props.removedCategories.find((rc) => rc.name === d.name);
    }
    return !!props.removedWorkspaces.find((rw) => rw.name === d.name);
};
const getLinkStatus = (d: SelectDropdownMenuItem, type: DataType): LinkStatus => {
    if (isAdded(d, type)) return 'added';
    if (isRemoved(d, type)) return 'removed';
    return 'unchanged';
};
const getAllItems = (type: DataType): Item[] => {
    const targetItems = type === 'category' ? props.selectedCategories : props.selectedWorkspaces;
    const refinedItems: Item[] = targetItems.map((d) => ({
        ...d,
        linkStatus: getLinkStatus(d, type),
    })).sort((a, b) => {
        if (a.linkStatus === 'added') return -1;
        if (b.linkStatus === 'added') return 1;
        return 0;
    });
    const targetRemovedItems = type === 'category' ? props.removedCategories : props.removedWorkspaces;
    const refinedRemovedItems: Item[] = targetRemovedItems.map((d) => ({
        ...d,
        linkStatus: 'removed',
    }));
    return refinedRemovedItems.concat(refinedItems);
};
const workspaceItems = computed<Item[]>(() => getAllItems('workspace'));
const categoryItems = computed<Item[]>(() => getAllItems('category'));
const getLinkStatusColor = (status: LinkStatus): string => {
    switch (status) {
    case 'added':
        return 'primary3';
    case 'removed':
        return 'red100';
    default:
        return 'gray100';
    }
};
const getStatusLabel = (status: LinkStatus): string => {
    switch (status) {
    case 'added':
        return _i18n.t('OPSFLOW.TASK_MANAGEMENT.PACKAGE.ADDED') as string;
    case 'removed':
        return _i18n.t('OPSFLOW.TASK_MANAGEMENT.PACKAGE.REMOVED') as string;
    default:
        return _i18n.t('OPSFLOW.TASK_MANAGEMENT.PACKAGE.UNCHANGED') as string;
    }
};
const WorkspaceFields = computed<DataTableField[]>(() => [
    {
        name: 'label',
        label: _i18n.t('OPSFLOW.WORKSPACE') as string,
    },
    {
        name: 'linkStatus',
        label: _i18n.t('OPSFLOW.TASK_MANAGEMENT.PACKAGE.CHANGE_STATUS') as string,
    },
]);
const CategoryFields = computed<DataTableField[]>(() => [
    {
        name: 'label',
        label: _i18n.t('OPSFLOW.CATEGORY') as string,
    },
    {
        name: 'linkStatus',
        label: _i18n.t('OPSFLOW.TASK_MANAGEMENT.PACKAGE.CHANGE_STATUS') as string,
    },
]);
const originWorkspaces = computed<SelectDropdownMenuItem[]>(() => props.selectedWorkspaces.filter((sw) => !isAdded(sw, 'workspace')));
const showCheckbox = computed<boolean>(() => !!originWorkspaces.value.length && !!props.removedCategories.length);
const checked = ref<boolean>(false);
const handleConfirm = async () => {
    emit('confirm');
};
const handleCloseOrCancel = () => {
    checked.value = false;
    emit('cancel');
};
</script>

<template>
    <p-button-modal :visible="props.visible"
                    theme-color="primary"
                    :header-title="$t('OPSFLOW.TASK_MANAGEMENT.PACKAGE.UPDATE_CONFIRMATION')"
                    size="md"
                    :disabled="showCheckbox && !checked"
                    @confirm="handleConfirm"
                    @close="handleCloseOrCancel"
                    @cancel="handleCloseOrCancel"
                    @closed="checked = false"
    >
        <template #body>
            <i18n path="OPSFLOW.TASK_MANAGEMENT.PACKAGE.AFFECTED_DESC"
                  tag="p"
                  class="mb-4 text-label-md"
            >
                <!-- eslint-disable-next-line vue/singleline-html-element-content-newline -->
                <template #category><strong>{{ $tc('OPSFLOW.TASK_MANAGEMENT.PACKAGE.C_CATEGORY',categoryItems.length) }}</strong></template>
                <!-- eslint-disable-next-line vue/singleline-html-element-content-newline -->
                <template #workspace><strong>{{ $tc('OPSFLOW.TASK_MANAGEMENT.PACKAGE.C_WORKSPACE', workspaceItems.length) }}</strong></template>
            </i18n>
            <div class="flex flex-wrap gap-6">
                <p-data-table :fields="WorkspaceFields"
                              :items="workspaceItems"
                              row-height-fixed
                              :table-custom-style="{maxHeight: '400px', minWidth: '250px', width: 'auto', flex: 1}"
                >
                    <template #col-linkStatus-format="{value}">
                        <p-badge badge-type="subtle"
                                 :style-type="getLinkStatusColor(value)"
                        >
                            {{ getStatusLabel(value) }}
                        </p-badge>
                    </template>
                </p-data-table>
                <p-data-table :fields="CategoryFields"
                              :items="categoryItems"
                              row-height-fixed
                              :table-custom-style="{maxHeight: '400px', minWidth: '250px', width: 'auto', flex: 1}"
                >
                    <template #col-linkStatus-format="{value}">
                        <p-badge badge-type="subtle"
                                 :style-type="getLinkStatusColor(value)"
                        >
                            {{ getStatusLabel(value) }}
                        </p-badge>
                    </template>
                </p-data-table>
                <div v-if="showCheckbox"
                     class="flex"
                >
                    <p-checkbox :value="true"
                                :selected="checked"
                                @change="checked = $event"
                    />
                    <i18n path="OPSFLOW.TASK_MANAGEMENT.PACKAGE.UPDATE_CONFIRM_DESC"
                          class="ml-1 mt-1 text-label-md"
                    >
                        <!-- eslint-disable-next-line vue/singleline-html-element-content-newline -->
                        <template #is>{{ $tc('OPSFLOW.TASK_MANAGEMENT.PACKAGE.C_IS', removedCategories.length) }}</template>
                        <!-- eslint-disable-next-line vue/singleline-html-element-content-newline -->
                        <template #category>{{ $tc('OPSFLOW.TASK_MANAGEMENT.PACKAGE.C_CATEGORY',removedCategories.length) }}</template>
                        <!-- eslint-disable-next-line vue/singleline-html-element-content-newline -->
                        <template #workspace>{{ $tc('OPSFLOW.TASK_MANAGEMENT.PACKAGE.C_WORKSPACE', selectedWorkspaces.length) }}</template>
                        <template #workspaceList>
                            <template v-for="(w, idx) in originWorkspaces">
                                <!-- eslint-disable-next-line vue/singleline-html-element-content-newline -->
                                <strong :key="w.name">{{ w.label }}</strong><template v-if="idx !== originWorkspaces.length - 1">, </template>
                            </template>
                        </template>
                        <template #categoryList>
                            <template v-for="(c, idx) in removedCategories">
                                <!-- eslint-disable-next-line vue/singleline-html-element-content-newline -->
                                <strong :key="c.name">{{ c.label }}</strong><template v-if="idx !== removedCategories.length - 1">, </template>
                            </template>
                        </template>
                    </i18n>
                </div>
            </div>
        </template>
    </p-button-modal>
</template>
