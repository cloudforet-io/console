<script lang="ts" setup>
import {
    reactive, computed, watch,
} from 'vue';
import type { TranslateResult } from 'vue-i18n';

import { cloneDeep, difference } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PButtonModal, PDataLoader, PEmpty, PFieldGroup, PTextInput, PIconButton,
} from '@cloudforet/mirinae';
import type { SelectDropdownMenuItem } from '@cloudforet/mirinae/types/controls/dropdown/select-dropdown/type';


import type { ProjectGroupAddUsersParameters } from '@/api-clients/identity/project-group/schema/api-verbs/add-users';
import type { ProjectGroupGetParameters } from '@/api-clients/identity/project-group/schema/api-verbs/get';
import type { ProjectGroupRemoveUsersParameters } from '@/api-clients/identity/project-group/schema/api-verbs/remove-users';
import type { ProjectGroupModel } from '@/api-clients/identity/project-group/schema/model';
import { i18n } from '@/translations';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { UserReferenceMap } from '@/store/reference/user-reference-store';

import { showErrorMessage, showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useProxyValue } from '@/common/composables/proxy-state';

import { useRoleFormatter } from '@/services/iam/composables/refined-table-data';
import { useProjectPageStore } from '@/services/project/v1/stores/project-page-store';


interface Props {
    visible?: boolean;
    projectGroupId: string;
}
const props = withDefaults(defineProps<Props>(), {
    visible: false,
});
const emit = defineEmits<{(e: 'confirm'): void;
}>();

const projectPageStore = useProjectPageStore();
const projectPageState = projectPageStore.state;
const allReferenceStore = useAllReferenceStore();
const storeState = reactive({
    users: computed<UserReferenceMap>(() => allReferenceStore.getters.user),
});
const state = reactive({
    loading: true,
    proxyVisible: useProxyValue('visible', props, emit),
    readonlyMode: computed<boolean>(() => !projectPageState.isWorkspaceOwner),
    projectGroupUserIdList: [] as string[],
    userMenuItems: computed<SelectDropdownMenuItem[]>(() => {
        const _items: SelectDropdownMenuItem[] = [];
        Object.values(storeState.users).forEach((user) => {
            const singleItem = {
                name: user.key,
                label: user.label,
                disabled: false,
            };
            if (state.selectedUserIdList.includes(user.key)) {
                singleItem.disabled = true;
            }
            _items.push(singleItem);
        });
        return _items;
    }),
    selectedUserIdList: [] as string[],
    searchText: '',
});

/* Util */
const getRoleImage = (userId: string): string => {
    const _roleType = storeState.users[userId]?.data?.roleInfo?.role_type;
    const _roleInfo = _roleType ? useRoleFormatter(_roleType) : undefined;
    return _roleInfo?.image ?? '';
};
const getRoleName = (userId: string): TranslateResult => {
    const _roleType = storeState.users[userId]?.data?.roleInfo?.role_type;
    const _roleInfo = _roleType ? useRoleFormatter(_roleType) : undefined;
    return _roleInfo?.name ?? '';
};

/* Api */
const addMember = async (userIds: string[]) => {
    try {
        const params: ProjectGroupAddUsersParameters = {
            project_group_id: props.projectGroupId,
            users: userIds,
        };
        await SpaceConnector.clientV2.identity.projectGroup.addUsers(params);
    } catch (e) {
        ErrorHandler.handleError(e);
        throw e;
    }
};
const removeMember = async (userIds: string[]) => {
    try {
        const params: ProjectGroupRemoveUsersParameters = {
            project_group_id: props.projectGroupId,
            users: userIds,
        };
        await SpaceConnector.clientV2.identity.projectGroup.removeUsers(params);
    } catch (e) {
        ErrorHandler.handleError(e);
        throw e;
    }
};
const addAndRemoveMember = async () => {
    const _addedUserIds = difference(state.selectedUserIdList, state.projectGroupUserIdList);
    const _removedUserIds = difference(state.projectGroupUserIdList, state.selectedUserIdList);
    try {
        if (_addedUserIds.length) await addMember(_addedUserIds);
        if (_removedUserIds.length) await removeMember(_removedUserIds);
        showSuccessMessage(i18n.t('PROJECT.LANDING.ALT_S_UPDATE_PROJECT_GROUP_MEMBER'), '');
    } catch (e) {
        showErrorMessage(i18n.t('PROJECT.LANDING.ALT_E_UPDATE_PROJECT_GROUP_MEMBER'), e);
    }
};
const getProjectGroupUserData = async () => {
    try {
        state.loading = true;
        const params: ProjectGroupGetParameters = {
            project_group_id: props.projectGroupId as string,
        };
        const res: ProjectGroupModel = await SpaceConnector.clientV2.identity.projectGroup.get(params);
        state.projectGroupUserIdList = res.users ?? [];
    } catch (e) {
        ErrorHandler.handleError(e);
        state.projectGroupUserIdList = [];
    } finally {
        state.loading = false;
    }
};

/* Event */
const handleConfirm = async () => {
    if (!state.readonlyMode) {
        await addAndRemoveMember();
        emit('confirm');
    }
    state.proxyVisible = false;
};
const handleUpdateSelected = (items?: SelectDropdownMenuItem[]) => {
    if (!items?.length) return;
    const _selected = items[0];
    if (storeState.users[_selected.name]) {
        state.selectedUserIdList.unshift(_selected.name);
        state.searchText = '';
    }
};
const handleRemoveProjectGroupMember = (idx: number) => {
    const _selectedUserItems = cloneDeep(state.selectedUserIdList);
    _selectedUserItems.splice(idx, 1);
    state.selectedUserIdList = _selectedUserItems;
};

/* Init */
watch(() => props.visible, async (visible) => {
    if (visible) {
        await getProjectGroupUserData();
        state.selectedUserIdList = cloneDeep(state.projectGroupUserIdList);
    }
}, { immediate: true });
</script>

<template>
    <p-button-modal
        :header-title="$t('PROJECT.LANDING.PROJECT_GROUP_MEMBER')"
        :fade="true"
        :backdrop="true"
        size="md"
        :visible.sync="state.proxyVisible"
        :hide-footer-close-button="state.readonlyMode"
        @confirm="handleConfirm"
    >
        <template #body>
            <div class="project-group-management-box">
                <div class="project-group-management-wrapper">
                    <p-field-group v-if="!state.readonlyMode"
                                   :label="$t('PROJECT.LANDING.GROUP_MEMBERS_WITH_ACCESS_TO_ALL_SUB_PROJECTS')"
                                   required
                    >
                        <p-text-input
                            :menu="state.userMenuItems"
                            :value.sync="state.searchText"
                            :selected="[]"
                            block
                            use-auto-complete
                            use-fixed-menu-style
                            :placeholder="$t('PROJECT.LANDING.ADD_GROUP_MEMBER')"
                            :page-size="5"
                            @update="handleUpdateSelected"
                        />
                    </p-field-group>
                    <p-data-loader :loading="state.loading"
                                   :data="state.selectedUserIdList"
                                   class="data-loader"
                    >
                        <template #no-data>
                            <p-empty show-image
                                     :title="$t('PROJECT.LANDING.NO_GROUP_MEMBER')"
                            />
                        </template>
                        <template v-for="(userId, idx) in state.selectedUserIdList">
                            <div :key="`selected-member-${userId}`"
                                 class="selected-member-wrapper"
                            >
                                <div class="left-part">
                                    <img :src="getRoleImage(userId)"
                                         alt="role-type-icon"
                                         class="role-type-icon"
                                    >
                                    <div class="inline-flex">
                                        <span>{{ storeState.users[userId]?.label || userId }}</span>
                                        <span v-if="!state.projectGroupUserIdList.includes(userId)"
                                              class="new-text"
                                        >new</span>
                                    </div>
                                </div>
                                <div class="right-part">
                                    <span class="role-type-text">
                                        {{ getRoleName(userId) }}
                                    </span>
                                    <p-icon-button v-if="!state.readonlyMode"
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
        <template v-if="state.readonlyMode"
                  #confirm-button
        >
            Done
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
