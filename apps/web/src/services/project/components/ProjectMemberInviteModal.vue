<script lang="ts" setup>
import {
    reactive, computed,
} from 'vue';

import {
    PButtonModal, PFieldGroup, PSelectDropdown,
} from '@spaceone/design-system';
import type { SelectDropdownMenuItem } from '@spaceone/design-system/types/inputs/dropdown/select-dropdown/type';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { ProjectAddUsersParameters } from '@/schema/identity/project/api-verbs/add-users';
import type { ProjectGetParameters } from '@/schema/identity/project/api-verbs/get';
import type { ProjectModel } from '@/schema/identity/project/model';
import type { WorkspaceUserListParameters } from '@/schema/identity/workspace-user/api-verbs/list';
import type { WorkspaceUserModel } from '@/schema/identity/workspace-user/model';
import { store } from '@/store';
import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useFormValidator } from '@/common/composables/form-validator';
import { useProxyValue } from '@/common/composables/proxy-state';


interface Props {
    visible?: boolean;
    projectId?: string;
}
const props = withDefaults(defineProps<Props>(), {
    visible: false,
    projectId: undefined,
});

const emit = defineEmits<{(e: 'confirm'): void;
}>();

const state = reactive({
    loading: false,
    proxyVisible: useProxyValue('visible', props, emit),
    workSpaceUserList: [] as WorkspaceUserModel[],
    projectUserIdList: [] as string[],
    //
    userMenuItems: computed<SelectDropdownMenuItem[]>(() => {
        const items: SelectDropdownMenuItem[] = [];
        state.workSpaceUserList.forEach((user) => {
            const singleItem = {
                name: user.user_id,
                label: user.name ? `${user.user_id} (${user.name})` : user.user_id,
                disabled: false,
            };
            if (state.projectUserIdList.includes(user.user_id)) {
                singleItem.disabled = true;
            }
            items.push(singleItem);
        });
        return items;
    }),
    existingMemberList: [] as string[],
    searchText: '',
});
const {
    forms: {
        selectedUserItems,
    },
    invalidState,
    invalidTexts,
    setForm, isAllValid,
} = useFormValidator({
    selectedUserItems: [] as SelectDropdownMenuItem[],
}, {
    selectedUserItems: (val: SelectDropdownMenuItem[]) => {
        if (!val.length) return i18n.t('PROJECT.DETAIL.MEMBER.MODAL_VALIDATION_REQUIRED');
        return true;
    },
});

/* Util */
const fetchWorkspaceUsers = async () => {
    try {
        const response = await SpaceConnector.clientV2.identity.workspaceUser.list<WorkspaceUserListParameters, ListResponse<WorkspaceUserModel>>({
            domain_id: store.state.domain.domainId,
        });
        console.log(response);
        state.workSpaceUserList = response.results ?? [];
    } catch (e) {
        state.workSpaceUserList = [];
        ErrorHandler.handleError(e);
    }
};

/* Api */
const addMember = async () => {
    try {
        const params: ProjectAddUsersParameters = {
            project_id: props.projectId,
            users: selectedUserItems.value.map((d) => d.name),
            domain_id: store.state.domain.domainId,
        };
        await SpaceConnector.clientV2.identity.project.addUsers(params);
        showSuccessMessage(i18n.t('PROJECT.DETAIL.MEMBER.ALS_S_ADD_MEMBER'), '');
    } catch (e) {
        ErrorHandler.handleRequestError(e, i18n.t('PROJECT.DETAIL.MEMBER.ALT_E_ADD_MEMBER'));
    }
};
const getProjectUserData = async () => {
    try {
        const params: ProjectGetParameters = {
            project_id: props.projectId,
            domain_id: store.state.domain.domainId,
        };
        const res: ProjectModel = await SpaceConnector.clientV2.identity.project.get(params);
        state.projectUserIdList = res.users ?? [];
    } catch (e) {
        ErrorHandler.handleError(e);
        state.projectUserIdList = [];
    }
};
/* Event */
const handleConfirm = async () => {
    await addMember();
    emit('confirm');
    state.proxyVisible = false;
};

/* Init */
(async () => {
    // initForm();
    await Promise.allSettled([
        fetchWorkspaceUsers(),
        getProjectUserData(),
    ]);
})();
</script>

<template>
    <p-button-modal
        class="project-member-invite-modal"
        :header-title="$t('PROJECT.DETAIL.MEMBER.INVITE_MEMBER')"
        :fade="true"
        :backdrop="true"
        size="sm"
        :visible.sync="state.proxyVisible"
        :disabled="!isAllValid"
        @confirm="handleConfirm"
    >
        <template #body>
            <div class="form-wrapper">
                <p-field-group :label="$t('PROJECT.DETAIL.MEMBER.MEMBER')"
                               required
                               :invalid="invalidState.selectedUserItems"
                               :invalid-text="invalidTexts.selectedUserItems"
                >
                    <template #default="{invalid}">
                        <p-select-dropdown
                            :menu="state.userMenuItems"
                            :selected="selectedUserItems"
                            :search-text.sync="state.searchText"
                            multi-selectable
                            appearance-type="stack"
                            show-select-marker
                            is-filterable
                            show-delete-all-button
                            use-fixed-menu-style
                            :invalid="invalid"
                            @update:selected="setForm('selectedUserItems', $event)"
                        />
                    </template>
                </p-field-group>
            </div>
        </template>
        <template #confirm-button>
            <span>{{ $t('PROJECT.DETAIL.MEMBER.INVITE') }}</span>
            <span v-if="selectedUserItems.length"
                  class="ml-1"
            >{{ selectedUserItems.length }}</span>
        </template>
    </p-button-modal>
</template>

<style lang="postcss" scoped>
.project-member-invite-modal {
    /* custom design-system component - p-box-tab */
    :deep(.p-box-tab) {
        .tab-pane {
            padding: 0;
        }
    }
    .form-wrapper {
        .title {
            @apply text-gray-900;
            font-size: 1.375rem;
            line-height: 1.25;
            padding-bottom: 1rem;
        }
    }
}
</style>
