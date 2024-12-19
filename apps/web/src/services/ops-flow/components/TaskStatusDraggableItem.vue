<script setup lang="ts">
import { computed } from 'vue';

import { PI, PBadge } from '@cloudforet/mirinae';
import type { MenuItem } from '@cloudforet/mirinae/types/controls/context-menu/type';

import type { TaskStatusType } from '@/schema/opsflow/task/type';
import { i18n } from '@/translations';

import ActionMenuButton from '@/common/components/buttons/ActionMenuButton.vue';

import TaskStatusBadge from '@/services/ops-flow/components/TaskStatusBadge.vue';
import { useTaskCategoryPageStore } from '@/services/ops-flow/stores/admin/task-category-page-store';

const props = defineProps<{
    index: number;
    id: string;
    name: string;
    color: string;
    type: TaskStatusType;
    isDefault?: boolean;
}>();

const menu = computed<MenuItem[]>(() => [
    { name: 'edit', icon: 'ic_edit', label: i18n.t('COMMON.BUTTONS.EDIT') },
    { name: 'set-as-default', icon: 'ic_check-circle', label: i18n.t('OPSFLOW.SET_AS_DEFAULT') },
    { name: 'delete', icon: 'ic_delete', label: i18n.t('COMMON.BUTTONS.DELETE') },
]);
const defaultStatusMenu = computed<MenuItem[]>(() => [
    {
        name: 'edit', icon: 'ic_edit', label: i18n.t('COMMON.BUTTONS.EDIT'),
    },
    {
        name: 'set-as-default', icon: 'ic_check-circle', label: i18n.t('OPSFLOW.SET_AS_DEFAULT'), disabled: true, iconColor: 'inherit',
    },
    {
        name: 'delete', icon: 'ic_delete', label: i18n.t('COMMON.BUTTONS.DELETE'), disabled: true, iconColor: 'inherit',
    },
]);
const taskCategoryPageStore = useTaskCategoryPageStore();

const handleEdit = () => {
    taskCategoryPageStore.openEditStatusForm(props.id, props.type);
};
const handleDelete = () => {
    taskCategoryPageStore.openDeleteStatusModal(props.id, props.type);
};
const handleSetDefault = () => {
    taskCategoryPageStore.openSetDefaultStatusModal(props.id, props.type);
};
</script>

<template>
    <li class="task-status-draggable-item">
        <p-i name="ic_drag-handle"
             width="1rem"
             height="1rem"
             class="drag-handle"
        />
        <div class="flex-grow">
            <task-status-badge class="ml-2"
                               :name="props.name"
                               :color="props.color"
            />
            <p-badge v-if="props.isDefault"
                     class="ml-1"
                     badge-type="solid-outline"
                     style-type="gray500"
                     shape="round"
            >
                {{ $t('OPSFLOW.DEFAULT') }}
            </p-badge>
        </div>
        <action-menu-button :menu="props.isDefault ? defaultStatusMenu : menu"
                            @edit="handleEdit"
                            @delete="handleDelete"
                            @set-as-default="handleSetDefault"
        />
    </li>
</template>

<style lang="postcss" scoped>
.task-status-draggable-item {
    @apply flex items-center px-2 border border-b-0 border-gray-150;
    height: 2.625rem;
    &:first-of-type {
        @apply rounded-t-lg;
    }
    &:last-of-type {
        @apply rounded-b-lg border-b;
    }
    &.ghost {
        @apply rounded-lg border;
    }
    >.drag-handle {
        cursor: grab;
    }
}
</style>
