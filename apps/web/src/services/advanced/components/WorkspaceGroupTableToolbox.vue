<script setup lang="ts">
import { reactive, computed } from 'vue';

import { PSelectDropdown } from '@cloudforet/mirinae';
import type { MenuItem } from '@cloudforet/mirinae/types/inputs/context-menu/type';

import { i18n } from '@/translations';

import { WORKSPACE_GROUP_MODAL_TYPE } from '@/services/advanced/constants/workspace-group-constant';
import { useWorkspaceGroupPageStore } from '@/services/advanced/store/workspace-group-page-store';

const workspaceGroupPageStore = useWorkspaceGroupPageStore();
const workspaceGroupPageState = workspaceGroupPageStore.state;

const WORKSPACE_GROUP_TOOLBOX_TYPE = WORKSPACE_GROUP_MODAL_TYPE;

const state = reactive({
    isSelected: computed(() => !!workspaceGroupPageState.selectedIndices.length),
    dropdownMenu: computed<MenuItem[]>(() => ([
        {
            type: 'item',
            name: WORKSPACE_GROUP_TOOLBOX_TYPE.EDIT,
            label: i18n.t('IAM.WORKSPACE_GROUP.MAIN.EDIT'),
            disabled: !state.isSelected,
        },
        {
            type: 'divider',
        },
        {
            type: 'item',
            name: WORKSPACE_GROUP_TOOLBOX_TYPE.DELETE,
            label: i18n.t('IAM.WORKSPACE_GROUP.MAIN.DELETE'),
            disabled: !state.isSelected,
        },
    ])),
});

const handleSelectAction = (type) => {
    switch (type) {
    case WORKSPACE_GROUP_MODAL_TYPE.EDIT:
        workspaceGroupPageStore.updateModalSettings({
            type,
            title: i18n.t('IAM.WORKSPACE_GROUP.MODAL.EDIT_TITLE'),
            visible: type,
        });
        break;
    case WORKSPACE_GROUP_MODAL_TYPE.DELETE:
        workspaceGroupPageStore.updateModalSettings({
            type,
            title: i18n.t('IAM.WORKSPACE_GROUP.MODAL.DELETE_TITLE'),
            visible: type,
            themeColor: 'alert',
        });
        break;
    default:
        break;
    }
};
</script>

<template>
    <p-select-dropdown class="left-toolbox-item"
                       :menu="state.dropdownMenu"
                       reset-selection-on-menu-close
                       :placeholder="$t('IAM.WORKSPACE_GROUP.MAIN.TOOLBOX_PLACEHOLDER')"
                       @select="handleSelectAction"
    />
</template>
