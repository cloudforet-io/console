<script lang="ts" setup>
import {
    computed, reactive, ref, watch,
} from 'vue';

import {
    PFieldGroup, PRadioGroup, PRadio,
} from '@cloudforet/mirinae';
import type { MenuItem } from '@cloudforet/mirinae/types/inputs/context-menu/type';

import { i18n } from '@/translations';

import UserSelectDropdown from '@/common/modules/user/UserSelectDropdown.vue';

const USER_MODE = {
    ALL_MEMBERS: 'allMembers',
    SELECTED_USER_GROUP: 'selectedUserGroup',
    SPECIFIC_USER: 'specificUser',
};

const SHOW_TYPE = {
    USER_LIST: 'userList',
    USER_GROUP_LIST: 'userGroupList',
};

const emit = defineEmits<{(e: 'update-user', form: {
  userMode: MenuItem;
  users: MenuItem[];
  })}>();

interface DropdownState {
  visible: boolean;
  loading: boolean;
  selectedAction: MenuItem[];
  menuItems: MenuItem[]
}

const showType = ref<string>();
const selectedIds = ref<any[]>([]);

const state = reactive({
    userMode: computed<MenuItem[]>(() => [{
        label: i18n.t('IAM.USER_GROUP.MODAL.CREATE_CHANNEL.DESC.USER_MODE.ALL_MEMBERS'),
        name: USER_MODE.ALL_MEMBERS,
    }, {
        label: i18n.t('IAM.USER_GROUP.MODAL.CREATE_CHANNEL.DESC.USER_MODE.USER_GROUP'),
        name: USER_MODE.SELECTED_USER_GROUP,
    }, {
        label: i18n.t('IAM.USER_GROUP.MODAL.CREATE_CHANNEL.DESC.USER_MODE.SPECIFIC_USER'),
        name: USER_MODE.SPECIFIC_USER,
    }]),
    selectedUserModeIdx: 0,
});

const dropdownState = reactive<DropdownState>({
    visible: false,
    loading: false,
    selectedAction: [],
    menuItems: [],
});

/* Component */
const handleChange = (idx: number) => {
    state.selectedUserModeIdx = idx;
};

const handleSelectedIds = (value) => {
    selectedIds.value = value;
};

/* Watcher */
watch(() => state.userMode[state.selectedUserModeIdx], (nv_userMode) => {
    showType.value = nv_userMode?.name === USER_MODE.SELECTED_USER_GROUP ? SHOW_TYPE.USER_GROUP_LIST : SHOW_TYPE.USER_LIST;
}, { deep: true, immediate: true });

watch(() => state.selectedUserModeIdx, async (nv_selectedIdx, ov_selectedIdx) => {
    if (nv_selectedIdx !== ov_selectedIdx) {
        selectedIds.value = [];
    }
});

// TODO: update after userSelectionDropdown changed
watch(() => dropdownState.selectedAction, (nv_selected_action) => {
    emit('update-user', {
        userMode: state.userMode[state.selectedUserModeIdx],
        users: nv_selected_action,
    });
}, { immediate: true });
</script>

<template>
    <p-field-group :label="$t('IAM.USER_GROUP.MODAL.CREATE_CHANNEL.DESC.USER_MODE.TITLE')"
                   required
    >
        <p-radio-group>
            <p-radio v-for="(mode, idx) in state.userMode"
                     :key="`${mode.name}-${idx}`"
                     v-model="state.selectedUserModeIdx"
                     :value="idx"
                     @handle="handleChange"
            >
                {{ mode.label }}
            </p-radio>
        </p-radio-group>
        <user-select-dropdown class="mt-2"
                              :show-user-list="showType === SHOW_TYPE.USER_LIST"
                              :show-user-group-list="showType === SHOW_TYPE.USER_GROUP_LIST"
                              :selected-ids="selectedIds"
                              :disabled="state.userMode[state.selectedUserModeIdx].name === USER_MODE.ALL_MEMBERS"
                              appearance-type="stack"
                              selection-type="multiple"
                              @update:selected-ids="handleSelectedIds"
        />
    </p-field-group>
</template>
