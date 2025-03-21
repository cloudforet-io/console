<script setup lang="ts">
import {
    computed, reactive,
} from 'vue';

import {
    PButton, PDefinitionTable, PHeading, PI, PStatus, PHeadingLayout, PTag,
} from '@cloudforet/mirinae';
import type { DefinitionField } from '@cloudforet/mirinae/types/data-display/tables/definition-table/type';
import { iso8601Formatter } from '@cloudforet/utils';

import { ROLE_TYPE } from '@/api-clients/identity/role/constant';
import { MULTI_FACTOR_AUTH_TYPE } from '@/api-clients/identity/user-profile/schema/constant';
import { i18n } from '@/translations';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import { useUserStore } from '@/store/user/user-store';

import config from '@/lib/config';
import { postUserValidationEmail } from '@/lib/helper/verify-email-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import {
    calculateTime,
    useRoleFormatter,
    userStateFormatter,
} from '@/services/iam/composables/refined-table-data';
import { USER_MODAL_TYPE } from '@/services/iam/constants/user-constant';
import { useUserPageStore } from '@/services/iam/store/user-page-store';
import type { UserListItemType, ExtendUserListItemType } from '@/services/iam/types/user-type';

interface Props {
    hasReadWriteAccess?: boolean;
}

const props = defineProps<Props>();

const userPageStore = useUserPageStore();
const userPageState = userPageStore.state;
const userPageGetters = userPageStore.getters;
const allReferenceStore = useAllReferenceStore();
const userStore = useUserStore();

const emit = defineEmits<{(e: 'refresh', id: string): void }>();

const storeState = reactive({
    smtpEnabled: computed(() => config.get('SMTP_ENABLED')),
    workspaceGroup: computed(() => allReferenceStore.getters.workspaceGroup),
});
const state = reactive({
    loading: false,
    verifyEmailLoading: false,
    selectedUser: computed<UserListItemType>(() => userPageGetters.selectedUsers[0]),
    isWorkspaceGroupUser: computed<boolean>(() => !!state.selectedUser?.role_binding_info?.workspace_group_id),
});

const tableState = reactive({
    refinedUserItems: computed<ExtendUserListItemType>(() => ({
        ...state.selectedUser,
        last_accessed_at: state.selectedUser.last_accessed_at,
    })),
    fields: computed<DefinitionField[]>(() => {
        const additionalFields: DefinitionField[] = [];
        const additionalRoleFields: DefinitionField[] = [];
        if (userPageState.isAdminMode) {
            if (storeState.smtpEnabled) {
                additionalFields.push(
                    { name: 'email', label: i18n.t('IAM.USER.MAIN.NOTIFICATION_EMAIL'), block: true },
                );
            }
            additionalFields.push(
                { name: 'mfa', label: i18n.t('IAM.USER.MAIN.MFA'), disableCopy: true },
            );
            if (state.selectedUser?.role_id) {
                additionalRoleFields.push(
                    {
                        name: 'role_id', label: 'Admin Role', sortable: true, sortKey: 'role_type',
                    },
                );
            }
        } else {
            additionalRoleFields.push({
                name: 'role_binding',
                label: i18n.t('IAM.USER.MAIN.ROLE'),
                disableCopy: true,
            });
        }

        return [
            { name: 'user_id', label: i18n.t('IAM.USER.MAIN.USER_ID') },
            { name: 'name', label: i18n.t('IAM.USER.MAIN.NAME') },
            { name: 'state', label: i18n.t('IAM.USER.MAIN.STATE'), disableCopy: true },
            ...additionalFields,
            { name: 'last_accessed_at', label: i18n.t('IAM.USER.MAIN.LAST_ACTIVITY'), disableCopy: true },
            { name: 'domain_id', label: i18n.t('IAM.USER.MAIN.DOMAIN_ID') },
            ...additionalRoleFields,
            { name: 'user_group', label: i18n.t('IAM.USER.MAIN.ASSIGNED_USER_GROUP'), disableCopy: true },
            { name: 'language', label: i18n.t('IAM.USER.MAIN.LANGUAGE'), disableCopy: true },
            { name: 'timezone', label: i18n.t('IAM.USER.MAIN.TIMEZONE'), disableCopy: true },
            { name: 'created_at', label: i18n.t('IAM.USER.MAIN.CREATED_AT') },
        ];
    }),
});

/* Component */
const handleClickButton = (type: string) => {
    switch (type) {
    case USER_MODAL_TYPE.DISABLE: userPageStore.updateModalSettings({
        type,
        title: i18n.t('IAM.USER.MAIN.MODAL.DISABLE_TITLE'),
        themeColor: 'alert',
        modalVisibleType: 'status',
    }); break;
    case USER_MODAL_TYPE.ENABLE: userPageStore.updateModalSettings({
        type,
        title: i18n.t('IAM.USER.MAIN.MODAL.ENABLE_TITLE'),
        themeColor: 'primary',
        modalVisibleType: 'status',
    }); break;
    case USER_MODAL_TYPE.REMOVE: userPageStore.updateModalSettings({
        type,
        title: i18n.t('IAM.USER.MAIN.MODAL.REMOVE_TITLE'),
        themeColor: 'alert',
        modalVisibleType: 'status',
    }); break;
    case USER_MODAL_TYPE.DELETE: userPageStore.updateModalSettings({
        type,
        title: i18n.t('IAM.USER.MAIN.MODAL.DELETE_TITLE'),
        themeColor: 'alert',
        modalVisibleType: 'status',
    }); break;
    case USER_MODAL_TYPE.UPDATE: userPageStore.updateModalSettings({
        type,
        title: i18n.t('IAM.USER.MAIN.MODAL.UPDATE_TITLE'),
        themeColor: 'primary',
        modalVisibleType: 'form',
    }); break;
    default: break;
    }
};

/* API */
const handleClickVerifyButton = async () => {
    state.verifyEmailLoading = true;
    try {
        if (tableState.refinedUserItems.email_verified) return;
        await postUserValidationEmail({
            user_id: tableState.refinedUserItems.user_id || '',
            email: tableState.refinedUserItems.email || '',
        });
        emit('refresh', tableState.refinedUserItems.user_id || '');
        await userStore.updateUser({ email: tableState.refinedUserItems.email });
    } catch (e: any) {
        ErrorHandler.handleError(e);
    } finally {
        state.verifyEmailLoading = false;
    }
};
</script>

<template>
    <div class="user-management-tab-detail">
        <p-heading-layout class="pt-8 px-4 pb-6">
            <template #heading>
                <p-heading heading-type="sub"
                           :title="$t('IAM.USER.MAIN.BASE_INFORMATION')"
                />
            </template>
            <template v-if="props.hasReadWriteAccess"
                      #extra
            >
                <div class="toolbox-wrapper">
                    <div v-if="userPageState.isAdminMode"
                         class="toolbox"
                    >
                        <p-button v-if="tableState.refinedUserItems.state === 'ENABLED'"
                                  style-type="tertiary"
                                  @click="handleClickButton(USER_MODAL_TYPE.DISABLE)"
                        >
                            {{ $t('IAM.USER.MAIN.DISABLE') }}
                        </p-button>
                        <p-button v-else
                                  style-type="tertiary"
                                  @click="handleClickButton(USER_MODAL_TYPE.ENABLE)"
                        >
                            {{ $t('IAM.USER.MAIN.ENABLE') }}
                        </p-button>
                        <p-button style-type="tertiary"
                                  icon-left="ic_edit"
                                  @click="handleClickButton(USER_MODAL_TYPE.UPDATE)"
                        >
                            <span class="button-label">{{ $t('IAM.USER.MAIN.EDIT') }}</span>
                        </p-button>
                        <p-button style-type="negative-secondary"
                                  icon-left="ic_delete"
                                  @click="handleClickButton(USER_MODAL_TYPE.DELETE)"
                        >
                            <span class="button-label">{{ $t('IAM.USER.MAIN.DELETE') }}</span>
                        </p-button>
                    </div>
                    <p-button v-else-if="userPageGetters.isWorkspaceOwner && !state.isWorkspaceGroupUser"
                              style-type="negative-secondary"
                              :disabled="userPageGetters.selectedUsers.length === 0"
                              @click="handleClickButton(USER_MODAL_TYPE.REMOVE)"
                    >
                        {{ $t('IAM.USER.REMOVE') }}
                    </p-button>
                </div>
            </template>
        </p-heading-layout>
        <p-definition-table :fields="tableState.fields"
                            :data="tableState.refinedUserItems"
                            :loading="state.loading"
                            :skeleton-rows="7"
                            class="user-definition-table"
                            v-on="$listeners"
        >
            <template #data-state="{data}">
                <p-status v-bind="userStateFormatter(data)"
                          class="capitalize"
                />
            </template>
            <template #data-mfa="{data}">
                <p>
                    <span>{{ data?.state === 'ENABLED' ? 'On' : 'Off' }}</span>
                    <span v-if="data?.state === 'ENABLED'"> - {{ data?.mfa_type === MULTI_FACTOR_AUTH_TYPE.EMAIL ? `Email (${data.options.email})` : 'Microsoft Authenticator App' }}</span>
                </p>
            </template>
            <template #data-role_id="{value, data}">
                <span class="role-wrapper">
                    <div class="role-menu-item">
                        <img :src="useRoleFormatter(userPageGetters.roleMap[data]?.role_type || ROLE_TYPE.USER).image"
                             alt="role-type-icon"
                             class="role-type-icon"
                        >
                        <span class="pr-4">{{ userPageGetters.roleMap[value]?.name ?? '' }}</span>
                    </div>
                </span>
            </template>
            <template #data-role_binding="{value}">
                <div class="role-wrapper">
                    <div class="role-menu-item">
                        <img :src="useRoleFormatter(value.type).image"
                             alt="role-type-icon"
                             class="role-type-icon"
                        >
                        <span class="role-type">{{ value.name }}</span>
                    </div>
                </div>
            </template>
            <template #data-last_accessed_at="{data}">
                <span v-if="calculateTime(data, state.selectedUser.timezone) === -1">
                    -
                </span>
                <span v-else-if="calculateTime(data, state.selectedUser.timezone) === 0">
                    {{ $t('IAM.USER.MAIN.TODAY') }}
                </span>
                <span v-else-if="calculateTime(data, state.selectedUser.timezone) === 1">
                    {{ $t('IAM.USER.MAIN.YESTERDAY') }}
                </span>
                <span v-else>
                    {{ calculateTime(data, state.selectedUser.timezone) }} {{ $t('IAM.USER.MAIN.DAYS') }}
                </span>
            </template>
            <template #data-created_at="{data}">
                {{ iso8601Formatter(data, userStore.state.timezone) }}
            </template>
            <template #data-email="{data}">
                <div v-if="data && data !== ''"
                     class="col-email"
                >
                    <span :class="tableState.refinedUserItems.email_verified && 'verified-text'">{{ data }}</span>
                    <span v-if="tableState.refinedUserItems.email_verified">
                        <p-i name="ic_verified"
                             height="1rem"
                             width="1rem"
                             class="verified-icon"
                             color="#60B731"
                        />
                    </span>
                    <span v-else
                          class="not-verified"
                    >
                        {{ $t('IAM.USER.MAIN.NOT_VERIFIED') }}
                    </span>
                </div>
            </template>
            <template #data-user_group="{data}">
                <div v-if="data.length > 0">
                    <p-tag v-for="(d, i) in data"
                           :key="`${d}-${i}`"
                           :deletable="false"
                    >
                        {{ d.name }}
                    </p-tag>
                </div>
            </template>
            <template #extra="{label}">
                <p-button v-if="label === $t('IAM.USER.MAIN.NOTIFICATION_EMAIL')
                              && !tableState.refinedUserItems.email_verified
                              && tableState.refinedUserItems.email
                              && tableState.refinedUserItems.email !== ''
                              && props.hasReadWriteAccess"
                          style-type="primary"
                          size="sm"
                          :loading="state.verifyEmailLoading"
                          class="toolbox-button send-mail-button"
                          @click="handleClickVerifyButton"
                >
                    <span>{{ $t('IDENTITY.USER.NOTIFICATION_EMAIL.VERIFY') }}</span>
                </p-button>
            </template>
        </p-definition-table>
    </div>
</template>

<style lang="postcss" scoped>
.user-management-tab-detail {
    .toolbox-wrapper {
        .toolbox {
            @apply flex ;
            gap: 0.5rem;
            .button-label {
                line-height: 1rem;
            }
        }
    }

    /* custom design-system component - p-definition */
    :deep(.p-definition) {
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
    .user-definition-table {
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
                padding-left: 1.25rem;
            }
            .verified-icon {
                @apply absolute;
                bottom: -0.025rem;
                left: 0;
            }
        }

        .role-type-icon {
            @apply rounded-full;
            width: 1rem;
            height: 1rem;
        }

        .role-wrapper {
            @apply flex flex-col;
            gap: 0.375rem;
            padding: 0.375rem 0;

            .role-menu-item {
                @apply flex items-center;
                gap: 0.25rem;
                .role-type {
                    @apply text-label-md text-gray-900;
                }
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
