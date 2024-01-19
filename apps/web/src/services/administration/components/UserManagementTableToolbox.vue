<script setup lang="ts">
import { computed, reactive } from 'vue';

import { PSelectDropdown } from '@spaceone/design-system';
import type { MenuItem } from '@spaceone/design-system/types/inputs/context-menu/type';
import { cloneDeep } from 'lodash';

import { i18n } from '@/translations';

import { USER_MODAL_TYPE, USER_STATE } from '@/services/administration/constants/user-constant';
import { useUserPageStore } from '@/services/administration/store/user-page-store';
import type { ModalSettingState } from '@/services/administration/types/user-type';

const userPageStore = useUserPageStore();
const userPageState = userPageStore.$state;

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
            disabled: !state.isSelected || userPageStore.selectedUsers[0].state === USER_STATE.ENABLE,
        },
        {
            type: 'item',
            name: USER_MODAL_TYPE.DISABLE,
            label: i18n.t('IAM.USER.MAIN.DISABLE'),
            disabled: !state.isSelected || userPageStore.selectedUsers[0].state === USER_STATE.DISABLE,
        },
    ])),
});

/* Component */
const handleSelectDropdown = (name) => {
    switch (name) {
    case USER_MODAL_TYPE.ENABLE: updateModalSettings({
        type: name,
        title: i18n.t('IAM.USER.MAIN.MODAL.ENABLE_TITLE') as string,
        themeColor: 'primary',
        statusVisible: true,
    }); break;
    case USER_MODAL_TYPE.DISABLE: updateModalSettings({
        type: name,
        title: i18n.t('IAM.USER.MAIN.MODAL.DISABLE_TITLE') as string,
        themeColor: 'alert',
        statusVisible: true,
    }); break;
    case USER_MODAL_TYPE.DELETE: updateModalSettings({
        type: name,
        title: i18n.t('IAM.USER.MAIN.MODAL.DELETE_TITLE') as string,
        themeColor: 'alert',
        statusVisible: true,
    }); break;
    case USER_MODAL_TYPE.UPDATE: updateModalSettings({
        type: name,
        title: i18n.t('IAM.USER.MAIN.MODAL.UPDATE_TITLE') as string,
        themeColor: 'primary',
        formVisible: true,
    }); break;
    default: break;
    }
};

const updateModalSettings = ({
    type, title, themeColor, statusVisible, addVisible, formVisible,
}: ModalSettingState) => {
    userPageStore.$patch((_state) => {
        _state.modal.type = type;
        _state.modal.title = title;
        _state.modal.themeColor = themeColor;
        _state.modal.visible.status = statusVisible ?? false;
        _state.modal.visible.add = addVisible ?? false;
        _state.modal.visible.form = formVisible ?? false;
        _state.modal = cloneDeep(_state.modal);
    });
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
