<script lang="ts" setup>
import {
    reactive, computed,
} from 'vue';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PButtonModal, PFieldGroup, PSelectDropdown, PLazyImg,
} from '@cloudforet/mirinae';
import type { SelectDropdownMenuItem } from '@cloudforet/mirinae/types/controls/dropdown/select-dropdown/type';


import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { ProjectAddUsersParameters } from '@/api-clients/identity/project/schema/api-verbs/add-users';
import type { ProjectGetParameters } from '@/api-clients/identity/project/schema/api-verbs/get';
import type { ProjectModel } from '@/api-clients/identity/project/schema/model';
import { ROLE_TYPE } from '@/api-clients/identity/role/constant';
import type { WorkspaceUserListParameters } from '@/api-clients/identity/workspace-user/schema/api-verbs/list';
import type { WorkspaceUserModel } from '@/api-clients/identity/workspace-user/schema/model';
import DomainAdminImage from '@/assets/images/role/img_avatar_admin.png';
import UserImage from '@/assets/images/role/img_avatar_no-role.png';
import SystemAdminImage from '@/assets/images/role/img_avatar_system-admin.png';
import WorkspaceMemberImage from '@/assets/images/role/img_avatar_workspace-member.png';
import WorkspaceOwnerImage from '@/assets/images/role/img_avatar_workspace-owner.png';
import { i18n } from '@/translations';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { UserReferenceMap } from '@/store/reference/user-reference-store';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useFormValidator } from '@/common/composables/form-validator';
import { useProxyValue } from '@/common/composables/proxy-state';

const ROLE_INFO_MAP = {
    [ROLE_TYPE.SYSTEM_ADMIN]: { icon: SystemAdminImage, label: 'System Admin' },
    [ROLE_TYPE.DOMAIN_ADMIN]: { icon: DomainAdminImage, label: 'Domain Admin' },
    [ROLE_TYPE.WORKSPACE_OWNER]: { icon: WorkspaceOwnerImage, label: 'Workspace Owner' },
    [ROLE_TYPE.WORKSPACE_MEMBER]: { icon: WorkspaceMemberImage, label: 'Workspace Member' },
    [ROLE_TYPE.USER]: { icon: UserImage, label: 'User' },
} as const;

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
const allReferenceStore = useAllReferenceStore();


const storeState = reactive({
    users: computed<UserReferenceMap>(() => allReferenceStore.getters.user),
});

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
        const response = await SpaceConnector.clientV2.identity.workspaceUser.list<WorkspaceUserListParameters, ListResponse<WorkspaceUserModel>>();
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
    await Promise.allSettled([
        fetchWorkspaceUsers(),
        getProjectUserData(),
    ]);
})();
</script>

<template>
    <p-button-modal
        class="project-member-invite-modal"
        modal-body-id="project-member-invite"
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
                            parent-id="project-member-invite"
                            multi-selectable
                            appearance-type="stack"
                            show-select-marker
                            is-filterable
                            show-delete-all-button
                            use-fixed-menu-style
                            :invalid="invalid"
                            @update:selected="setForm('selectedUserItems', $event)"
                        >
                            <template #menu-item--format="{item}">
                                <p-lazy-img :src="ROLE_INFO_MAP[storeState.users[item.name]?.data.roleInfo.role_type]?.icon"
                                            class="menu-icon"
                                            width="1rem"
                                            height="1rem"
                                />
                                <span>
                                    {{ storeState.users[item.name]?.label || item.label }}
                                </span>
                            </template>
                        </p-select-dropdown>
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
    .menu-icon {
        @apply rounded-full overflow-hidden;
    }
}
</style>
