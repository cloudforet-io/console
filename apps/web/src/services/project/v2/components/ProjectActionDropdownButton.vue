<script setup lang="ts">
import { computed, ref } from 'vue';

import { PSelectDropdown, PIconButton } from '@cloudforet/mirinae';
import type { SelectDropdownMenuItem } from '@cloudforet/mirinae/types/controls/dropdown/select-dropdown/type';

import { i18n } from '@/translations';

import { useProjectPageModalStore } from '@/services/project/v2/stores/project-page-modal-store';

const props = withDefaults(defineProps<{
    projectId?: string;
    projectGroupId?: string;
    usageType?: 'header'|'list';
}>(), {
    projectId: undefined,
    projectGroupId: undefined,
    usageType: 'header',
});

const emit = defineEmits<{(e: 'update:visible', visible: boolean): void;
}>();
const visibleMenu = ref(false);
const handleUpdateVisibleMenu = (visible: boolean) => {
    visibleMenu.value = visible;
    emit('update:visible', visible);
};

const actionItems = computed<SelectDropdownMenuItem[]>(() => [
    {
        name: 'rename',
        label: i18n.t('PROJECT.DETAIL.RENAME'),
        icon: 'ic_edit-text',
    },
    ...(props.projectId ? [{
        name: 'editAccess',
        label: i18n.t('PROJECT.DETAIL.EDIT_ACCESS'),
        icon: 'ic_edit',
    }] : []),
    {
        name: 'move',
        label: i18n.t('PROJECT.DETAIL.MOVE'),
        icon: 'ic_move',
    },
    ...(props.projectId ? [{
        name: 'tags',
        label: i18n.t('PROJECT.DETAIL.TAGS'),
        icon: 'ic_label',
    }] : []),
    { type: 'divider', name: 'divider' },
    {
        name: 'delete',
        label: i18n.t('PROJECT.DETAIL.DELETE'),
        icon: 'ic_delete',
    },
]);

const projectPageModalStore = useProjectPageModalStore();

const handleSelectItem = (selectedItem: SelectDropdownMenuItem|string|number) => {
    let selected: string = selectedItem as string;
    if (typeof selected === 'object') selected = (selectedItem as SelectDropdownMenuItem).name;
    if (selected === 'rename') {
        if (props.projectId) {
            projectPageModalStore.openProjectRenameModal(props.projectId);
        } else if (props.projectGroupId) {
            projectPageModalStore.openProjectGroupRenameModal(props.projectGroupId);
        }
    } else if (selected === 'editAccess') {
        if (props.projectId) {
            projectPageModalStore.openProjectEditAccessModal(props.projectId);
        }
    } else if (selected === 'move') {
        if (props.projectId) {
            projectPageModalStore.openProjectMoveModal(props.projectId);
        } else if (props.projectGroupId) {
            projectPageModalStore.openProjectGroupMoveModal(props.projectGroupId);
        }
    } else if (selected === 'tags') {
        if (props.projectId) {
            projectPageModalStore.openProjectManageTagsModal(props.projectId);
        } else if (props.projectGroupId) {
            projectPageModalStore.openProjectGroupManageTagsModal(props.projectGroupId);
        }
    } else if (selected === 'delete') {
        if (props.projectId) {
            projectPageModalStore.openProjectDeleteModal(props.projectId);
        } else if (props.projectGroupId) {
            projectPageModalStore.openProjectGroupDeleteModal(props.projectGroupId);
        }
    }
};
</script>

<template>
    <p-select-dropdown style-type="tertiary-icon-button"
                       button-icon="ic_ellipsis-horizontal"
                       size="sm"
                       :menu="actionItems"
                       reset-selection-on-menu-close
                       menu-width="max-content"
                       menu-position="right"
                       @update:visible-menu="handleUpdateVisibleMenu"
                       @select="handleSelectItem"
    >
        <template v-if="props.usageType === 'list'"
                  #dropdown-icon-button
        >
            <p-icon-button name="ic_ellipsis-horizontal"
                           :activated="visibleMenu"
                           size="sm"
                           style-type="tertiary"
            />
        </template>
    </p-select-dropdown>
</template>
