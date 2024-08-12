<script setup lang="ts">
import { reactive, computed } from 'vue';

import { PSelectDropdown } from '@cloudforet/mirinae';
import type { MenuItem } from '@cloudforet/mirinae/types/inputs/context-menu/type';

import { i18n } from '@/translations';

import { WORKSPACE_GROUP_MODAL_TYPE } from '@/services/advanced/constants/workspace-group-constant';


const WORKSPACE_GROUP_TOOLBOX_TYPE = WORKSPACE_GROUP_MODAL_TYPE;

const state = reactive({
    isSelected: computed(() => true),
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

const handleSelectAction = () => {};
</script>

<template>
    <p-select-dropdown class="left-toolbox-item"
                       :menu="state.dropdownMenu"
                       reset-selection-on-menu-close
                       :placeholder="$t('IAM.WORKSPACE_GROUP.MAIN.TOOLBOX_PLACEHOLDER')"
                       @select="handleSelectAction"
    />
</template>
