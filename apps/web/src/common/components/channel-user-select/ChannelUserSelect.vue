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
    ALL_MEMBER: 'ALL_MEMBER',
    USER_GROUP: 'USER_GROUP',
    USER: 'USER',
};

const SHOW_TYPE = {
    USER_LIST: 'userList',
    USER_GROUP_LIST: 'userGroupList',
};

const emit = defineEmits<{(e: 'update-user', form: {
  userMode: MenuItem;
  users: {type: 'USER' | 'USER_GROUP'; value: string}[];
  })}>();

const showType = ref<string>();
const selectedIds = ref<any[]>([]);

const state = reactive({
    userMode: computed<MenuItem[]>(() => [{
        label: i18n.t('IAM.USER_GROUP.MODAL.CREATE_CHANNEL.DESC.USER_MODE.ALL_MEMBERS'),
        name: USER_MODE.ALL_MEMBER,
    }, {
        label: i18n.t('IAM.USER_GROUP.MODAL.CREATE_CHANNEL.DESC.USER_MODE.USER_GROUP'),
        name: USER_MODE.USER_GROUP,
    }, {
        label: i18n.t('IAM.USER_GROUP.MODAL.CREATE_CHANNEL.DESC.USER_MODE.SPECIFIC_USER'),
        name: USER_MODE.USER,
    }]),
    selectedUserModeIdx: 0,
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
    showType.value = nv_userMode?.name === USER_MODE.USER_GROUP ? SHOW_TYPE.USER_GROUP_LIST : SHOW_TYPE.USER_LIST;
}, { deep: true, immediate: true });

watch(() => state.selectedUserModeIdx, async (nv_selectedIdx, ov_selectedIdx) => {
    if (nv_selectedIdx !== ov_selectedIdx) {
        selectedIds.value = [];
    }
});

// TODO: update after userSelectionDropdown changed
watch([() => selectedIds, () => state.selectedUserModeIdx], ([nv_selected_ids, nv_selected_user_mode_idx]) => {
    emit('update-user', {
        userMode: state.userMode[nv_selected_user_mode_idx],
        users: nv_selected_ids,
    });
}, { immediate: true, deep: true });
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
                              :disabled="state.userMode[state.selectedUserModeIdx].name === USER_MODE.ALL_MEMBER"
                              appearance-type="stack"
                              selection-type="multiple"
                              :selected-ids="selectedIds"
                              @update:selected-ids="handleSelectedIds"
        />
    </p-field-group>
</template>
