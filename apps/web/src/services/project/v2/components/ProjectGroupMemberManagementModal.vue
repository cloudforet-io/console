<script lang="ts" setup>
import {
    computed, watch, ref,
} from 'vue';

import { useMutation } from '@tanstack/vue-query';
import { cloneDeep, difference } from 'lodash';

import {
    PButtonModal, PDataLoader, PEmpty, PFieldGroup, PTextInput, PIconButton,
} from '@cloudforet/mirinae';
import type { SelectDropdownMenuItem } from '@cloudforet/mirinae/types/controls/dropdown/select-dropdown/type';

import { useProjectGroupApi } from '@/api-clients/identity/project-group/composables/use-project-group-api';
import type { ProjectGroupRemoveUsersParameters } from '@/api-clients/identity/project-group/schema/api-verbs/remove-users';
import { ROLE_TYPE } from '@/api-clients/identity/role/constant';
import { i18n } from '@/translations';

import { useAuthorizationStore } from '@/store/authorization/authorization-store';
import { useUserReferenceStore } from '@/store/reference/user-reference-store';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { useProjectGroupQuery } from '@/services/project/v-shared/composables/queries/use-project-group-query';
import { useRoleFormatters } from '@/services/project/v2/composables/use-role-formatters';
import { useProjectPageModalStore } from '@/services/project/v2/stores/project-page-modal-store';

const projectPageModalStore = useProjectPageModalStore();
const visible = computed(() => projectPageModalStore.state.projectGroupMemberModalVisible);
const targetId = computed(() => projectPageModalStore.state.targetId);

/* mode */
const authorizationStore = useAuthorizationStore();
const readonlyMode = computed<boolean>(() => authorizationStore.state.currentRoleInfo?.roleType !== ROLE_TYPE.WORKSPACE_OWNER);

/* project group users */
const { projectGroupAPI } = useProjectGroupApi();
const { data: projectGroup, isLoading, invalidateQuery } = useProjectGroupQuery({
    projectGroupId: targetId,
    enabled: visible,
});
const projectGroupUserIdList = computed<string[]>(() => projectGroup.value?.users ?? []);

/* dropdown - all users */
const userReferenceStore = useUserReferenceStore();
const searchText = ref<string>('');
const userMenuItems = computed<SelectDropdownMenuItem[]>(() => {
    const _items: SelectDropdownMenuItem[] = [];
    Object.values(userReferenceStore.getters.userItems).forEach((user) => {
        const singleItem = {
            name: user.key,
            label: user.label,
            disabled: false,
        };
        if (selectedUserIdList.value.includes(user.key)) {
            singleItem.disabled = true;
        }
        _items.push(singleItem);
    });
    return _items;
});

/* dropdown - user selection */
const selectedUserIdList = ref<string[]>([]);
watch([visible, projectGroupUserIdList], async ([v, list]) => {
    if (v && list) {
        selectedUserIdList.value = cloneDeep(list);
    }
}, { immediate: true });
const handleUpdateSelected = (items?: SelectDropdownMenuItem[]) => {
    if (!items?.length) return;
    const _selected = items[0];
    if (userReferenceStore.getters.userItems[_selected.name]) {
        selectedUserIdList.value.unshift(_selected.name);
        searchText.value = '';
    }
};
const handleRemoveProjectGroupMember = (idx: number) => {
    const _selectedUserItems = cloneDeep(selectedUserIdList.value);
    _selectedUserItems.splice(idx, 1);
    selectedUserIdList.value = _selectedUserItems;
};

/* role */
const { getRoleImage, getRoleName } = useRoleFormatters();

/* member mutations */
const addMember = async (userIds: string[]) => {
    if (!targetId.value) throw new Error('Project Group ID is not defined');
    await projectGroupAPI.addUsers({
        project_group_id: targetId.value,
        users: userIds,
    });
};
const removeMember = async (userIds: string[]) => {
    if (!targetId.value) throw new Error('Project Group ID is not defined');
    const params: ProjectGroupRemoveUsersParameters = {
        project_group_id: targetId.value,
        users: userIds,
    };
    await projectGroupAPI.removeUsers(params);
};
const { mutateAsync: addAndRemoveMember } = useMutation({
    mutationFn: () => {
        const _addedUserIds = difference(selectedUserIdList.value, projectGroupUserIdList.value ?? []);
        const _removedUserIds = difference(projectGroupUserIdList.value, selectedUserIdList.value);
        const promises: Promise<void>[] = [];
        if (_addedUserIds.length) promises.push(addMember(_addedUserIds));
        if (_removedUserIds.length) promises.push(removeMember(_removedUserIds));
        return Promise.allSettled(promises);
    },
    onError: (e) => {
        ErrorHandler.handleRequestError(e, i18n.t('PROJECT.LANDING.ALT_E_UPDATE_PROJECT_GROUP_MEMBER'), true);
    },
    onSuccess: (d) => {
        showSuccessMessage(i18n.t('PROJECT.LANDING.ALT_S_UPDATE_PROJECT_GROUP_MEMBER'), '');
        if (d.length > 0) invalidateQuery();
    },
});


/* Event */
const handleConfirm = async () => {
    if (!readonlyMode.value) {
        await addAndRemoveMember();
    }
    projectPageModalStore.closeProjectGroupMemberModal();
};



</script>

<template>
    <p-button-modal
        :header-title="$t('PROJECT.LANDING.PROJECT_GROUP_MEMBER')"
        :fade="true"
        :backdrop="true"
        size="md"
        :visible="visible"
        :hide-footer-close-button="readonlyMode"
        @close="projectPageModalStore.closeProjectGroupMemberModal"
        @cancel="projectPageModalStore.closeProjectGroupMemberModal"
        @closed="projectPageModalStore.resetTarget"
        @confirm="handleConfirm"
    >
        <template #body>
            <div class="project-group-management-box">
                <div class="project-group-management-wrapper">
                    <p-field-group v-if="!readonlyMode"
                                   :label="$t('PROJECT.LANDING.GROUP_MEMBERS_WITH_ACCESS_TO_ALL_SUB_PROJECTS')"
                                   required
                    >
                        <p-text-input :menu="userMenuItems"
                                      :value.sync="searchText"
                                      :selected="[]"
                                      block
                                      use-auto-complete
                                      use-fixed-menu-style
                                      :placeholder="$t('PROJECT.LANDING.ADD_GROUP_MEMBER')"
                                      :page-size="5"
                                      @update="handleUpdateSelected"
                        />
                    </p-field-group>
                    <p-data-loader :loading="isLoading"
                                   :data="selectedUserIdList"
                                   class="data-loader"
                    >
                        <template #no-data>
                            <p-empty show-image
                                     :title="$t('PROJECT.LANDING.NO_GROUP_MEMBER')"
                            />
                        </template>
                        <template v-for="(userId, idx) in selectedUserIdList">
                            <div :key="`selected-member-${userId}`"
                                 class="selected-member-wrapper"
                            >
                                <div class="left-part">
                                    <img :src="getRoleImage(userId)"
                                         alt="role-type-icon"
                                         class="role-type-icon"
                                    >
                                    <div class="inline-flex">
                                        <span>{{ userReferenceStore.getters.userItems[userId]?.label || userId }}</span>
                                        <span v-if="projectGroupUserIdList && !projectGroupUserIdList.includes(userId)"
                                              class="new-text"
                                        >new</span>
                                    </div>
                                </div>
                                <div class="right-part">
                                    <span class="role-type-text">
                                        {{ getRoleName(userId) }}
                                    </span>
                                    <p-icon-button v-if="!readonlyMode"
                                                   name="ic_delete"
                                                   size="sm"
                                                   @click="handleRemoveProjectGroupMember(idx)"
                                    />
                                </div>
                            </div>
                        </template>
                    </p-data-loader>
                </div>
            </div>
        </template>
        <template v-if="readonlyMode"
                  #confirm-button
        >
            {{ $t('PROJECT.LANDING.DONE') }}
        </template>
    </p-button-modal>
</template>

<style lang="postcss" scoped>
.project-group-management-box {
    @apply bg-primary4 rounded-md;
    min-height: 25rem;
    padding: 1rem;
    .project-group-management-wrapper {
        @apply bg-white border border-primary3 rounded-md;
        min-height: 23rem;
        padding: 0.75rem;
    }

    .p-data-loader {
        height: 15rem;
    }

    .selected-member-wrapper {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.5rem 0;
        .left-part {
            @apply text-label-md;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            .role-type-icon {
                @apply rounded-full;
                width: 1.5rem;
                height: 1.5rem;
            }
            .new-text {
                @apply text-label-xs text-coral-500;
                display: inline-flex;
                align-items: flex-start;
                padding-left: 0.25rem;
            }
        }
        .right-part {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            .role-type-text {
                @apply text-label-md text-gray-500;
            }
        }
    }
}
</style>
