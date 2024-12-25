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

import { useNotificationChannelCreateFormStore } from '@/services/iam/store/notification-channel-create-form-store';

const notificationChannelCreateFormStore = useNotificationChannelCreateFormStore();
const notificationChannelCreateFormState = notificationChannelCreateFormStore.state;

const USER_MODE = {
    ALL_MEMBER: 'ALL_MEMBER',
    USER_GROUP: 'USER_GROUP',
    USER: 'USER',
};

const SHOW_TYPE = {
    USER_LIST: 'userList',
    USER_GROUP_LIST: 'userGroupList',
};

const showType = ref<string>();
const selectedIds = ref<any>([]);

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

watch(() => state.selectedUserModeIdx, (nv_selected_idx) => {
    if (nv_selected_idx === 0) {
        notificationChannelCreateFormState.userInfo.type = 'ALL_MEMBER';
    } else if (nv_selected_idx === 1) {
        notificationChannelCreateFormState.userInfo.type = 'USER_GROUP';
    } else {
        notificationChannelCreateFormState.userInfo.type = 'USER';
    }
});

watch([() => notificationChannelCreateFormState.userInfo.type, () => notificationChannelCreateFormState.userInfo.value], () => {
    // TODO: Retrieving a list of existing users
    // if (nv_user_info_type) {
    //     if (nv_user_info_type !== 'ALL_MEMBER') {
    //         state.selectedUserModeIdx = nv_user_info_type === 'USER_GROUP' ? 1 : 2;
    //
    //         selectedIds.value = {
    //             type: nv_user_info_type,
    //             value: nv_user_info_value,
    //         };
    //     } else {
    //         state.selectedUserModeIdx = 0;
    //     }
    // }
}, { immediate: true, deep: true });

watch(selectedIds, (nv_selected_ids) => {
    const result: string[] = [];
    nv_selected_ids.forEach((id) => {
        result.push(id.value);
    });
    notificationChannelCreateFormState.userInfo.value = result;
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
                              :disabled="state.userMode[state.selectedUserModeIdx].name === USER_MODE.ALL_MEMBER"
                              appearance-type="stack"
                              selection-type="multiple"
                              :selected-ids="selectedIds"
                              @update:selected-ids="handleSelectedIds"
        />
    </p-field-group>
</template>
