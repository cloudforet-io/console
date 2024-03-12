<script lang="ts" setup>
import {
    reactive, computed,
} from 'vue';
import type { TranslateResult } from 'vue-i18n';

import {
    PButtonModal, PDataLoader, PEmpty, PFieldGroup, PButton, PTextInput,
} from '@spaceone/design-system';
import type { SelectDropdownMenuItem } from '@spaceone/design-system/types/inputs/dropdown/select-dropdown/type';
import { cloneDeep, isEmpty } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { ProjectAddUsersParameters } from '@/schema/identity/project/api-verbs/add-users';
import type { WorkspaceUserListParameters } from '@/schema/identity/workspace-user/api-verbs/list';
import type { WorkspaceUserModel } from '@/schema/identity/workspace-user/model';
import { i18n } from '@/translations';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { UserReferenceMap } from '@/store/reference/user-reference-store';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useProxyValue } from '@/common/composables/proxy-state';

import { useRoleFormatter } from '@/services/iam/composables/refined-table-data';


interface SelectedUserItem extends SelectDropdownMenuItem {
    roleImage?: string;
    roleName?: TranslateResult;
}
interface Props {
    visible?: boolean;
    projectGroupId?: string;
}
const props = withDefaults(defineProps<Props>(), {
    visible: false,
    projectGroupId: undefined,
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
    projectGroupUserIdList: [] as string[],
    //
    userMenuItems: computed<SelectDropdownMenuItem[]>(() => {
        const _items: SelectDropdownMenuItem[] = [];
        state.workSpaceUserList.forEach((user) => {
            const singleItem = {
                name: user.user_id,
                label: user.name ? `${user.user_id} (${user.name})` : user.user_id,
                disabled: false,
            };
            if ((state.selectedUserItems.find((d) => d.name === user.user_id))
                || (state.projectGroupUserIdList.includes(user.user_id))) {
                singleItem.disabled = true;
            }
            _items.push(singleItem);
        });
        return _items;
    }),
    selectedUserItems: [] as SelectedUserItem[],
    existingMemberList: [] as string[],
    searchText: '',
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
const getRoleType = (userId: string): string|undefined => {
    if (isEmpty(storeState.users)) return undefined;
    return storeState.users[userId].data.roleInfo?.role_type;
};

/* Api */
const addMember = async () => {
    try {
        const params: ProjectAddUsersParameters = {
            project_group_id: props.projectGroupId,
            users: state.selectedUserItems.map((d) => d.name),
        };
        await SpaceConnector.clientV2.identity.projectGroup.addUsers(params);
        showSuccessMessage(i18n.t('PROJECT.DETAIL.MEMBER.ALS_S_ADD_MEMBER'), '');
    } catch (e) {
        ErrorHandler.handleRequestError(e, i18n.t('PROJECT.DETAIL.MEMBER.ALT_E_ADD_MEMBER'));
    }
};
// const getProjectGroupUserData = async () => {
//     try {
//         const params: ProjectGroupGetParameters = {
//             project_group_id: props.projectGroupId,
//         };
//         const res: ProjectGroupModel = await SpaceConnector.clientV2.identity.projectGroup.get(params);
//         state.projectGroupUserIdList = res.users ?? [];
//     } catch (e) {
//         ErrorHandler.handleError(e);
//         state.projectGroupUserIdList = [];
//     }
// };
/* Event */
const handleConfirm = async () => {
    await addMember();
    emit('confirm');
    state.proxyVisible = false;
};
const handleUpdateSelected = (items?: SelectDropdownMenuItem[]) => {
    if (!items?.length) return;
    const _selected = items[0];
    if (state.workSpaceUserList.find((user) => user.user_id === _selected.name)) {
        const _roleType = getRoleType(_selected.name);
        const _roleInfo = _roleType ? useRoleFormatter(_roleType) : undefined;
        state.selectedUserItems.push({
            ...items[0],
            roleImage: _roleInfo?.image,
            roleName: _roleInfo?.name,
        });
        state.searchText = '';
    }
};
const handleRemoveProjectGroupMember = (idx: number) => {
    const _selectedUserItems = cloneDeep(state.selectedUserItems);
    _selectedUserItems.splice(idx, 1);
    state.selectedUserItems = _selectedUserItems;
};

/* Init */
(async () => {
    await Promise.allSettled([
        fetchWorkspaceUsers(),
    ]);
})();
</script>

<template>
    <p-button-modal
        :header-title="$t('PROJECT.DETAIL.MEMBER.INVITE_MEMBER')"
        :fade="true"
        :backdrop="true"
        size="md"
        :visible.sync="state.proxyVisible"
        @confirm="handleConfirm"
    >
        <template #body>
            <div class="project-group-management-box">
                <div class="project-group-management-wrapper">
                    <p-field-group :label="$t('PROJECT.DETAIL.MEMBER.MEMBER')"
                                   required
                    >
                        <p-text-input
                            :menu="state.userMenuItems"
                            :value.sync="state.searchText"
                            :selected="[]"
                            use-auto-complete
                            use-fixed-menu-style
                            @update="handleUpdateSelected"
                        />
                    </p-field-group>
                    <p-data-loader :loading="state.loading"
                                   :data="state.selectedUserItems"
                                   class="data-loader"
                    >
                        <template #no-data>
                            <p-empty show-image
                                     title="No Group Member"
                            >
                                <div>
                                    Type a user ID / name and then press Enter
                                </div>
                            </p-empty>
                        </template>
                        <template v-for="(selected, idx) in state.selectedUserItems">
                            <div :key="`selected-member-${selected.name}`"
                                 class="selected-member-wrapper"
                            >
                                <div class="left-part">
                                    <img :src="selected.roleImage"
                                         alt="role-type-icon"
                                         class="role-type-icon"
                                    >
                                    <span>{{ selected.label }}</span>
                                </div>
                                <div class="right-part">
                                    <span class="role-type-text">
                                        {{ selected.roleName }}
                                    </span>
                                    <p-button style-type="negative-secondary"
                                              size="sm"
                                              @click="handleRemoveProjectGroupMember(idx)"
                                    >
                                        Remove
                                    </p-button>
                                </div>
                            </div>
                        </template>
                    </p-data-loader>
                </div>
            </div>
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

    /* custom design-system component - p-text-input */
    :deep(.p-text-input) {
        width: 100%;
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
