<script setup lang="ts">
import { computed, reactive } from 'vue';

import { PSelectDropdown } from '@cloudforet/mirinae';
import type { MenuItem } from '@cloudforet/mirinae/types/controls/context-menu/type';

import { i18n } from '@/translations';

import { USER_MODAL_TYPE, USER_STATE } from '@/services/iam/constants/user-constant';
import { useUserPageStore } from '@/services/iam/store/user-page-store';

const userPageStore = useUserPageStore();
const userPageState = userPageStore.state;
const userPageGetters = userPageStore.getters;

const state = reactive({
    isSelected: computed(() => userPageState.selectedIndices.length > 0),
    dropdownMenu: computed<MenuItem[]>(() => ([
        {
            type: 'item',
            name: USER_MODAL_TYPE.UPDATE,
            label: i18n.t('IAM.USER.MAIN.EDIT'),
            disabled: userPageState.selectedIndices.length > 1 || !state.isSelected,
        },
        {
            type: 'item', name: USER_MODAL_TYPE.DELETE, label: i18n.t('IAM.USER.MAIN.DELETE'), disabled: !state.isSelected,
        },
        { type: 'divider' },
        {
            type: 'item',
            name: USER_MODAL_TYPE.ENABLE,
            label: i18n.t('IAM.USER.MAIN.ENABLE'),
            disabled: !state.isSelected || userPageGetters.selectedUsers[0].state === USER_STATE.ENABLE,
        },
        {
            type: 'item',
            name: USER_MODAL_TYPE.DISABLE,
            label: i18n.t('IAM.USER.MAIN.DISABLE'),
            disabled: !state.isSelected || userPageGetters.selectedUsers[0].state === USER_STATE.DISABLE,
        },
        {
            type: 'item',
            name: USER_MODAL_TYPE.SET_MFA,
            label: i18n.t('IAM.USER.MAIN.SET_MFA'),
            disabled: !state.isSelected || !isMfaBulkControlEnabled.value,
        },
    ])),
});
const isMfaBulkControlEnabled = computed(() => userPageGetters.selectedUsers.some((user) => user.auth_type === 'LOCAL'));

/* Component */
const handleSelectDropdown = (name: typeof USER_MODAL_TYPE[keyof typeof USER_MODAL_TYPE]) => {
    switch (name) {
    case USER_MODAL_TYPE.ENABLE: userPageStore.updateModalSettings({
        type: name,
        title: i18n.t('IAM.USER.MAIN.MODAL.ENABLE_TITLE'),
        themeColor: 'primary',
        modalVisibleType: 'status',
    }); break;
    case USER_MODAL_TYPE.DISABLE: userPageStore.updateModalSettings({
        type: name,
        title: i18n.t('IAM.USER.MAIN.MODAL.DISABLE_TITLE'),
        themeColor: 'alert',
        modalVisibleType: 'status',
    }); break;
    case USER_MODAL_TYPE.DELETE: userPageStore.updateModalSettings({
        type: name,
        title: i18n.t('IAM.USER.MAIN.MODAL.DELETE_TITLE'),
        themeColor: 'alert',
        modalVisibleType: 'status',
    }); break;
    case USER_MODAL_TYPE.UPDATE:
        userPageStore.updateModalSettings({
            type: name,
            title: i18n.t('IAM.USER.MAIN.MODAL.UPDATE_TITLE'),
            themeColor: 'primary',
            modalVisibleType: 'form',
        });
        if (userPageGetters.selectedUsers.length) { // NOTE: temporarily setting before vue query is ready
            const selectedUser = userPageGetters.selectedUsers[0];
            userPageStore.setSelectedUserForForm(selectedUser);
        }
        break;
    case USER_MODAL_TYPE.SET_MFA: userPageStore.setBulkMfaSettingModalVisible(true); break;
    default: break;
    }
};
</script>

<template>
    <p-select-dropdown class="left-toolbox-item"
                       :menu="state.dropdownMenu"
                       reset-selection-on-menu-close
                       :placeholder="$t('IAM.USER.MAIN.ACTION')"
                       @select="handleSelectDropdown"
    />
</template>
