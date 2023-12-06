<script setup lang="ts">
import { computed, reactive } from 'vue';

import { PSelectDropdown } from '@spaceone/design-system';
import type { MenuItem } from '@spaceone/design-system/types/inputs/context-menu/type';

import { i18n } from '@/translations';

import { useManagePermissionState } from '@/common/composables/page-manage-permission';

import { useUserPageStore } from '@/services/administration/store/user-page-store';

const userPageStore = useUserPageStore();
const userPageState = userPageStore.$state;

const state = reactive({
    hasManagePermission: useManagePermissionState(),
    isSelected: computed(() => userPageState.selectedIndices.length > 0),
    dropdownMenu: computed<MenuItem[]>(() => ([
        {
            type: 'item',
            name: 'update',
            label: i18n.t('IDENTITY.USER.MAIN.UPDATE'),
            disabled: userPageState.selectedIndices.length > 1 || !state.isSelected,
        },
        {
            type: 'item', name: 'delete', label: i18n.t('IDENTITY.USER.MAIN.DELETE'), disabled: !state.isSelected,
        },
        { type: 'divider' },
        {
            type: 'item', name: 'enable', label: i18n.t('IDENTITY.USER.MAIN.ENABLE'), disabled: !state.isSelected,
        },
        {
            type: 'item', name: 'disable', label: i18n.t('IDENTITY.USER.MAIN.DISABLE'), disabled: !state.isSelected,
        },
    ])),
});
const modalState = reactive({
    mode: '',
    title: '',
    subTitle: '',
    themeColor: undefined as string | undefined,
    visible: computed(() => userPageState.modalVisible.status),
});

/* Component */
const handleSelectDropdown = (name) => {
    switch (name) {
    case 'enable': clickEnable(); break;
    case 'disable': clickDisable(); break;
    case 'delete': clickDelete(); break;
    case 'update': clickUpdate(); break;
    default: break;
    }
};
const clickUpdate = () => {
    userPageStore.$patch((_state) => {
        _state.modalVisible.update = true;
    });
};
const clickDelete = () => {
    modalState.mode = 'delete';
    modalState.title = i18n.t('IDENTITY.USER.MAIN.DELETE_MODAL_TITLE') as string;
    modalState.subTitle = i18n.tc('IDENTITY.USER.MAIN.DELETE_MODAL_DESC', userPageState.selectedIndices.length);
    modalState.themeColor = 'alert';
    userPageStore.$patch((_state) => {
        _state.modalVisible.status = true;
    });
};
const clickEnable = () => {
    modalState.mode = 'enable';
    modalState.title = i18n.t('IDENTITY.USER.MAIN.ENABLE_MODAL_TITLE') as string;
    modalState.subTitle = i18n.tc('IDENTITY.USER.MAIN.ENABLE_MODAL_DESC', userPageState.selectedIndices.length);
    modalState.themeColor = 'safe';
    userPageStore.$patch((_state) => {
        _state.modalVisible.status = true;
    });
};
const clickDisable = () => {
    modalState.mode = 'disable';
    modalState.title = i18n.t('IDENTITY.USER.MAIN.DISABLE_MODAL_TITLE') as string;
    modalState.subTitle = i18n.tc('IDENTITY.USER.MAIN.DISABLE_MODAL_DESC', userPageState.selectedIndices.length);
    modalState.themeColor = 'alert';
    userPageStore.$patch((_state) => {
        _state.modalVisible.status = true;
    });
};

</script>

<template>
    <p-select-dropdown class="left-toolbox-item"
                       :menu="state.dropdownMenu"
                       :placeholder="$t('IDENTITY.USER.MAIN.ACTION')"
                       :disabled="!state.hasManagePermission"
                       @select="handleSelectDropdown"
    />
</template>
