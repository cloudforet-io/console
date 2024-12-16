<script lang="ts" setup>
import {
    computed, reactive, watch,
} from 'vue';
import type { TranslateResult } from 'vue-i18n';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PFieldGroup, PTextInput, PRadioGroup, PRadio, PSelectDropdown,
} from '@cloudforet/mirinae';
import type { MenuItem } from '@cloudforet/mirinae/types/inputs/context-menu/type';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { WorkspaceUserListParameters } from '@/schema/identity/workspace-user/api-verbs/list';
import type { WorkspaceUserModel } from '@/schema/identity/workspace-user/model';
import { i18n } from '@/translations';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { useUserGroupPageStore } from '@/services/iam/store/user-group-page-store';

const userGroupPageStore = useUserGroupPageStore();
const userGroupPageState = userGroupPageStore.state;

interface DropdownState {
  visible: boolean;
  loading: boolean;
  selectedAction: MenuItem[];
  menuItems: MenuItem[]
}

const state = reactive({
    userMode: computed<MenuItem[]>(() => [{
        label: i18n.t('IAM.USER_GROUP.MODAL.CREATE_CHANNEL.DESC.USER_MODE.ALL_MEMBERS'),
        name: 'allMembers',
    }, {
        label: i18n.t('IAM.USER_GROUP.MODAL.CREATE_CHANNEL.DESC.USER_MODE.USER_GROUP'),
        name: 'selectedUserGroup',
    }, {
        label: i18n.t('IAM.USER_GROUP.MODAL.CREATE_CHANNEL.DESC.USER_MODE.SPECIFIC_USER'),
        name: 'specificUser',
    }]),
    selectedUserModeIdx: 0,
});


const dropdownState = reactive<DropdownState>({
    visible: false,
    loading: false,
    selectedAction: [],
    menuItems: [],
});

/* Watcher */
watch(() => state.selectedUserModeIdx, async (selectedIdx) => {
    switch (state.userMode[selectedIdx].name) {
    case 'allMembers':
        dropdownState.menuItems = [];
        break;
    case 'selectedUserGroup':
        dropdownState.menuItems = userGroupPageState.userGroups.map((userGroup) => ({
            label: userGroup.name,
            name: userGroup.user_group_id,
        }));
        break;
    case 'specificUser':
        dropdownState.menuItems = (await fetchUserList({})).map((user) => ({
            label: user.user_id,
            name: user.user_id,
        }));
        break;
    default:
        break;
    }
});

watch(() => state.selectedUserModeIdx, (nv_userMode, ov_userMode) => {
    if (nv_userMode !== ov_userMode) {
        dropdownState.selectedAction = [];
    }
});

/* Component */
const handleChange = (idx: number) => {
    state.selectedUserModeIdx = idx;
};

const handleSelectDropdown = (value: { label: string | TranslateResult; name: string; }) => {
    dropdownState.selectedAction.push(value);
};

/* API */
const fetchUserList = async (params: WorkspaceUserListParameters) => {
    try {
        const response = await SpaceConnector.clientV2.identity.workspaceUser.list<WorkspaceUserListParameters, ListResponse<WorkspaceUserModel>>(params);
        return response.results ?? [];
    } catch (e) {
        ErrorHandler.handleError(e, true);
        return [];
    }
};
</script>

<template>
    <div class="flex flex-col gap-6 bg-white">
        <p-field-group :label="$t('IAM.USER_GROUP.MODAL.CREATE_CHANNEL.DESC.CHANNEL_NAME')"
                       required
        >
            <p-text-input block />
        </p-field-group>
        <!--        TODO: channel token & Protocol input (possible to update later) -->
        <p-field-group label="Channel Token"
                       required
        >
            <p-text-input placeholder="xoxb-123456789012-0987654321098-ABCDEFG"
                          block
            />
        </p-field-group>
        <p-field-group label="Channel Protocol"
                       required
        >
            <p-text-input placeholder="xoxb-123456789012-0987654321098-ABCDEFG"
                          block
            />
        </p-field-group>
        <p-field-group :label="$t('IAM.USER_GROUP.MODAL.CREATE_CHANNEL.DESC.USER_MODE.TITLE')"
                       required
        >
            <p-radio-group>
                <p-radio v-for="(mode, idx) in state.userMode"
                         :key="idx"
                         v-model="state.selectedUserModeIdx"
                         :value="idx"
                         @change="handleChange"
                >
                    {{ mode.label }}
                </p-radio>
            </p-radio-group>
            <p-select-dropdown class="pt-3"
                               :menu.sync="dropdownState.menuItems"
                               placeholder="Select"
                               multi-selectable
                               appearance-type="stack"
                               selection-highlight
                               is-fixed-width
                               :selected="dropdownState.selectedAction"
                               @select="handleSelectDropdown"
            />
        </p-field-group>
    </div>
</template>
