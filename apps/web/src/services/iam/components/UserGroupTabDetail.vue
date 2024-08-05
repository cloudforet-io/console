<script setup lang="ts">
import { reactive, computed } from 'vue';

import { PHeading, PButton, PDefinitionTable } from '@cloudforet/mirinae';

import { i18n } from '@/translations';

import { USER_GROUP_MODAL_TYPE } from '@/services/iam/constants/user-group-constant';
import { useUserGroupPageStore } from '@/services/iam/store/user-group-page-store';

const userGroupPageStore = useUserGroupPageStore();
const userGroupPageState = userGroupPageStore.state;
const userGroupPageGetters = userGroupPageStore.getters;

const state = reactive({
    loading: false,
    fields: computed(() => ([
        { name: 'user_id', label: 'User ID' },
        { name: 'name', label: 'Name' },
        { name: 'state', label: 'State' },
        { name: 'MFA', lable: 'mfa' },
        { name: 'role_id', label: 'Admin Role', sortKey: 'role_type' },
        { name: 'tags', label: 'Tags', sortable: false },
        { name: 'auth_type', label: 'Auth Type' },
        { name: 'last_accessed_at', label: 'Last Activity' },
        // { name: 'name', label: 'Name', sortable: false },
        // { name: 'users', label: 'Users', sortable: false },
        // { name: 'associated_workspaces', label: 'Associated Workspaces', sortable: false },
        // { name: 'accessible_roles', label: 'Accessible Roles', sortable: false },
        // { name: 'created', label: 'Created', sortable: false },
    ])),
    data: computed(() => ({
        ...userGroupPageGetters.selectedUsers[0],
        // name: "User Group 04",
        // users: 40,
        // associated_workspaces: 2,
        // accessible_roles: "Workspace Owner02",
        // created: "2020-08-18 05:02:54"
    })),
});

const handleClickButton = (type: string) => {
    switch (type) {
    case USER_GROUP_MODAL_TYPE.EDIT: userGroupPageStore.updateModalSettings({
        type,
        title: i18n.t('IAM.USERGROUP.MODAL.EDIT.TITLE'),
        visible: USER_GROUP_MODAL_TYPE.EDIT,
        themeColor: 'primary',
    }); break;
    case USER_GROUP_MODAL_TYPE.STATUS: userGroupPageStore.updateModalSettings({
        type,
        title: i18n.t('IAM.USERGROUP.MODAL.REMOVE.TITLE'),
        visible: USER_GROUP_MODAL_TYPE.STATUS,
        themeColor: 'alert',
    }); break;
    case USER_GROUP_MODAL_TYPE.ADD_USERS: userGroupPageStore.updateModalSettings({
        type,
        title: i18n.t('IAM.USERGROUP.MODAL.ADD_USERS.TITLE'),
        visible: USER_GROUP_MODAL_TYPE.ADD_USERS,
        themeColor: 'primary',
    }); break;
    default:
        break;
    }
};
</script>

<template>
    <div class="user-group-tab-detail">
        <p-heading heading-type="sub"
                   :title="$t('IAM.USERGROUP.MAIN.BASE_INFORMATION')"
        >
            <template #extra>
                <div class="toolbox-wrapper">
                    <div class="toolbox">
                        <p-button style-type="tertiary"
                                  icon-left="ic_edit"
                                  @click="handleClickButton(USER_GROUP_MODAL_TYPE.EDIT)"
                        >
                            {{ $t('IAM.USERGROUP.MAIN.EDIT') }}
                        </p-button>
                        <p-button style-type="tertiary"
                                  icon-left="ic_delete"
                                  @click="handleClickButton(USER_GROUP_MODAL_TYPE.STATUS)"
                        >
                            {{ $t('IAM.USERGROUP.MAIN.REMOVE') }}
                        </p-button>
                    </div>
                </div>
            </template>
        </p-heading>
        <p-definition-table v-if="userGroupPageGetters.selectedUsers.length === 1"
                            :fields="state.fields"
                            :data="state.data"
                            :loading="userGroupPageState.loading"
                            :skeleton-rows="7"
                            class="user-group-definition-table"
                            v-on="$listeners"
        />
        <p-definition-table v-else-if="userGroupPageGetters.selectedUsers.length > 1"
                            :fields="state.fields"
                            :data="userGroupPageGetters.selectedUsers"
                            :loading="userGroupPageState.loading"
                            :skeleton-rows="7"
                            class="user-group-definition-table"
                            v-on="$listeners"
        />
    </div>
</template>

<style lang="postcss" scoped>
.user-group-tab-detail {
    .toolbox-wrapper {
        .toolbox {
            @apply flex;
            gap: 0.5rem;
            .button-label {
                line-height: 1rem;
            }
        }
    }

    /* custom design-system component - p-definition */
    :deep(.p-definition) {
        height: 2.25rem;
        .value-wrapper {
            @apply items-center;
            padding: 0 1rem;
            .extra {
                @apply flex items-center;
                max-height: 100%;
                .verify-button-wrapper {
                    height: 1.5rem;
                }
            }
            .p-copy-button {
                @apply flex items-center;
                gap: 0.25rem;
                .copy-text {
                    margin: 0;
                }
            }
        }
    }
    .user-group-definition-table {
        .col-email {
            @apply relative;
            .not-verified {
                @apply absolute bg-yellow-200 text-label-sm;
                height: 1.25rem;
                padding: 0.15rem 0.5rem;
                border-radius: 6.25rem;
                right: -7rem;
            }
            .verified-text {
                margin-left: 1.5rem;
            }
            .verified-icon {
                @apply absolute;
                bottom: -0.025rem;
                left: 0;
            }
        }
        .role-type {
            @apply flex items-center;
            gap: 0.5rem;
            .role-type-icon {
                @apply rounded-full;
                width: 1rem;
                height: 1rem;
            }
        }
    }
}
</style>
