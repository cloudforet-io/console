<script setup lang="ts">
import { reactive, computed } from 'vue';

import { PSelectDropdown } from '@cloudforet/mirinae';
import type { MenuItem } from '@cloudforet/mirinae/types/inputs/context-menu/type';

import { i18n } from '@/translations';

import { USER_GROUP_MODAL_TYPE } from '@/services/iam/constants/user-group-constant';
import { useUserGroupPageStore } from '@/services/iam/store/user-group-page-store';


const userGroupPageStore = useUserGroupPageStore();
const userGroupPageState = userGroupPageStore.$state;

const USER_GROUP_TOOLBOX_TYPE = USER_GROUP_MODAL_TYPE;

const state = reactive({
    isSelected: computed(() => userGroupPageState.selectedIndices.length > 0),
    dropdownMenu: computed<MenuItem[]>(() => ([
        {
            type: 'item',
            name: USER_GROUP_TOOLBOX_TYPE.EDIT,
            label: i18n.t('IAM.USERGROUP.MAIN.EDIT'),
            disabled: userGroupPageState.selectedIndices.length > 1 || !state.isSelected,
        },
        {
            type: 'item',
            name: USER_GROUP_TOOLBOX_TYPE.STATUS,
            label: i18n.t('IAM.USERGROUP.MAIN.REMOVE'),
            disabled: !state.isSelected,
        },
        {
            type: 'divider',
        },
        {
            type: 'item',
            name: USER_GROUP_TOOLBOX_TYPE.ADD_USERS,
            label: i18n.t('IAM.USERGROUP.MAIN.ADD_USERS'),
            disabled: !state.isSelected,
        },
    ])),
});

const handleSelectAction = (type: string) => {
    switch (type) {
    case USER_GROUP_MODAL_TYPE.EDIT: userGroupPageStore.updateModalSettings({
        type,
        title: i18n.t('IAM.USERGROUP.MODAL.EDIT.TITLE'),
        visible: USER_GROUP_MODAL_TYPE.EDIT,
        themeColor: 'primary',
    }); break;
    case USER_GROUP_MODAL_TYPE.STATUS: userGroupPageStore.updateModalSettings({
        type,
        title: i18n.t('IAM.USERGROUP.MODAL.REMOVE.TITLE'),
        visible: USER_GROUP_MODAL_TYPE.STATUS,
        themeColor: 'alert',
    }); break;
    case USER_GROUP_MODAL_TYPE.ADD_USERS: userGroupPageStore.updateModalSettings({
        type,
        title: i18n.t('IAM.USERGROUP.MODAL.ADD_USERS.TITLE'),
        visible: USER_GROUP_MODAL_TYPE.ADD_USERS,
        themeColor: 'primary',
    }); break;
    default:
        break;
    }
};
</script>

<template>
    <p-select-dropdown class="left-toolbox-item"
                       :menu="state.dropdownMenu"
                       reset-selection-on-menu-close
                       :placeholder="i18n.t('IAM.USERGROUP.MAIN.TOOLBOX_PLACEHOLDER')"
                       @select="handleSelectAction"
    />
</template>
