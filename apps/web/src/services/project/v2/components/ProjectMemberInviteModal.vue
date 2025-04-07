<script lang="ts" setup>
import { computed } from 'vue';

import { useMutation } from '@tanstack/vue-query';

import {
    PButtonModal, PFieldGroup, PSelectDropdown, PLazyImg,
} from '@cloudforet/mirinae';
import type { SelectDropdownMenuItem } from '@cloudforet/mirinae/types/controls/dropdown/select-dropdown/type';

import { useProjectApi } from '@/api-clients/identity/project/composables/use-project-api';
import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useFormValidator } from '@/common/composables/form-validator';

import { useProjectQuery } from '@/services/project/v2/composables/queries/use-project-query';
import { useWorkspaceUsersQuery } from '@/services/project/v2/composables/queries/use-workspace-users-query';
import { useUserInfo } from '@/services/project/v2/composables/use-user-info';
import { useProjectPageModalStore } from '@/services/project/v2/stores/project-page-modal-store';


const projectPageModalStore = useProjectPageModalStore();
const visible = computed(() => !!projectPageModalStore.state.inviteMemberModalVisible
        && projectPageModalStore.state.targetType === 'project'
        && !!projectPageModalStore.state.targetId);

/* selected users */
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
const handleUpdateSelected = (selected: number|string|SelectDropdownMenuItem[]) => {
    setForm('selectedUserItems', selected as SelectDropdownMenuItem[]);
};

/* workspace users */
const { data: workspaceUsers } = useWorkspaceUsersQuery({
    enabled: visible,
});
const workspaceUserList = computed(() => workspaceUsers.value || []);

/* project users */
const { data: project, setQueryData: setProjectQueryData } = useProjectQuery({
    projectId: computed(() => projectPageModalStore.state.targetId),
    enabled: visible,
});
const projectUserList = computed(() => project.value?.users || []);

/* user list */
const userMenuItems = computed<SelectDropdownMenuItem[]>(() => {
    const items: SelectDropdownMenuItem[] = [];
    workspaceUserList.value.forEach((user) => {
        const singleItem = {
            name: user.user_id,
            label: user.name ? `${user.user_id} (${user.name})` : user.user_id,
            disabled: false,
        };
        if (projectUserList.value.includes(user.user_id)) {
            singleItem.disabled = true;
        }
        items.push(singleItem);
    });
    return items;
});

/* users info */
const {
    getUserIcon, getUserLabel,
} = useUserInfo();

/* mutation */
const { projectAPI } = useProjectApi();
const { mutateAsync: addMember } = useMutation({
    mutationFn: ({ projectId, users }: {projectId: string; users: string[]}) => {
        if (!projectId) throw new Error('Project ID is not defined');
        return projectAPI.addUsers({
            project_id: projectId,
            users,
        });
    },
    onSuccess: (data) => {
        showSuccessMessage(i18n.t('PROJECT.DETAIL.MEMBER.ALS_S_ADD_MEMBER'), '');
        setProjectQueryData(data);
    },
    onError: (e) => ErrorHandler.handleRequestError(e, i18n.t('PROJECT.DETAIL.MEMBER.ALT_E_ADD_MEMBER'), true),
});

/* Event */
const handleConfirm = async () => {
    await addMember({
        projectId: projectPageModalStore.state.targetId as string,
        users: selectedUserItems.value.map((d) => d.name),
    });
    projectPageModalStore.closeInviteMemberModal();
};

</script>

<template>
    <p-button-modal
        class="project-member-invite-modal"
        modal-body-id="project-member-invite"
        :header-title="$t('PROJECT.DETAIL.MEMBER.INVITE_MEMBER')"
        :fade="true"
        :backdrop="true"
        size="sm"
        :visible="projectPageModalStore.state.inviteMemberModalVisible"
        :disabled="!isAllValid"
        @close="projectPageModalStore.closeInviteMemberModal()"
        @cancel="projectPageModalStore.closeInviteMemberModal()"
        @closed="projectPageModalStore.resetTarget()"
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
                            :menu="userMenuItems"
                            :selected="selectedUserItems"
                            parent-id="project-member-invite"
                            multi-selectable
                            appearance-type="stack"
                            show-select-marker
                            is-filterable
                            show-delete-all-button
                            use-fixed-menu-style
                            :invalid="invalid"
                            @update:selected="handleUpdateSelected"
                        >
                            <template #menu-item--format="{item}">
                                <p-lazy-img :src="getUserIcon(item.name)"
                                            class="menu-icon"
                                            width="1rem"
                                            height="1rem"
                                />
                                <span>
                                    {{ getUserLabel(item.name) || item.label }}
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
