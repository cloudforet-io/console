<script setup lang="ts">
import { computed } from 'vue';

import { PSelectDropdown } from '@cloudforet/mirinae';
import type { SelectDropdownMenuItem } from '@cloudforet/mirinae/types/controls/dropdown/select-dropdown/type';

import { i18n } from '@/translations';

import { useProjectPageModalStore } from '@/services/project/v2/stores/project-page-modal-store';

const props = defineProps<{
    projectId?: string;
    projectGroupId?: string;
}>();

const actionItems = computed<SelectDropdownMenuItem[]>(() => [
    {
        name: 'update',
        label: i18n.t('PROJECT.DETAIL.UPDATE'),
        icon: 'ic_settings',
    },
    {
        name: 'move',
        label: i18n.t('PROJECT.DETAIL.MOVE'),
        icon: 'ic_move',
    },
    { type: 'divider', name: 'divider' },
    {
        name: 'delete',
        label: i18n.t('PROJECT.DETAIL.DELETE'),
        icon: 'ic_delete',
    },
]);

const projectPageModalStore = useProjectPageModalStore();

const handleSelectItem = (selected: SelectDropdownMenuItem|string|number) => {
    if (typeof selected === 'string' || typeof selected === 'number') return;
    const id = props.projectId || props.projectGroupId;
    if (!id) return;
    if (selected.name === 'update') projectPageModalStore.openEditProjectFormModal(id);
    else if (selected.name === 'move') projectPageModalStore.openProjectMoveModal(id);
    else if (selected.name === 'delete') projectPageModalStore.openProjectDeleteModal(id);
};
</script>

<template>
    <p-select-dropdown style-type="tertiary-icon-button"
                       button-icon="ic_ellipsis-horizontal"
                       size="sm"
                       :menu="actionItems"
                       @select="handleSelectItem"
    />
</template>

<style scoped lang="postcss">
/* custom design-system component - p-select-dropdown */
:deep(.p-select-dropdown) {
    .dropdown-button-component {
        @apply rounded-full;

        &.opened {
            @apply rounded-full;
        }
    }
}
</style>
