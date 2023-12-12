<script setup lang="ts">
import { computed, reactive } from 'vue';

import { PButtonModal, PBoxTab } from '@spaceone/design-system';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { Tags } from '@/schema/_common/model';
import type { UserGetParameters } from '@/schema/identity/user/api-verbs/get';
import { USER_TYPE } from '@/schema/identity/user/constant';
import type { UserModel } from '@/schema/identity/user/model';
import type { WorkspaceUserModel } from '@/schema/identity/workspace-user/model';
import { store } from '@/store';

import config from '@/lib/config';
import { postDisableMfa } from '@/lib/helper/multi-factor-auth-helper';
import { showErrorMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import UserManagementFormAdminRole from '@/services/administration/components/UserManagementFormAdminRole.vue';
import UserManagementFormInfoForm from '@/services/administration/components/UserManagementFormInfoForm.vue';
import UserManagementFormMultiFactorAuth
    from '@/services/administration/components/UserManagementFormMultiFactorAuth.vue';
import UserManagementFormNotificationEmailForm
    from '@/services/administration/components/UserManagementFormNotificationEmailForm.vue';
import UserManagementFormPasswordForm from '@/services/administration/components/UserManagementFormPasswordForm.vue';
import UserManagementFormTags from '@/services/administration/components/UserManagementFormTags.vue';
import { PASSWORD_TYPE } from '@/services/administration/constants/user-constant';
import { useUserPageStore } from '@/services/administration/store/user-page-store';

interface Props {
    headerTitle: string;
    item?: Partial<WorkspaceUserModel|UserModel>;
}
interface UserManagementData {
    user_id: string;
    name: string;
    email: string;
    tags: Tags;
    password: string;
    reset_password?: boolean;
    backend?: string;
    user_type?: string;
}

const USER_BACKEND_TYPE = {
    LOCAL: 'LOCAL',
    EXTERNAL: 'EXTERNAL',
    API: 'API',
} as const;


const props = withDefaults(defineProps<Props>(), {
    headerTitle: '',
    item: undefined,
});

const userPageStore = useUserPageStore();
const userPageState = userPageStore.$state;

const emit = defineEmits<{(e: 'confirm', data: UserManagementData, roleId: string|null): void; }>();

const state = reactive({
    data: {} as Partial<WorkspaceUserModel|UserModel>,
    selectedId: computed(() => props.item?.user_id),
    smtpEnabled: computed(() => config.get('SMTP_ENABLED')),
    mfa: computed(() => store.state.user.mfa),
    loginUserId: computed(() => store.state.user.userId),
    isChangedToggle: false,
});

const formState = reactive({
    tabs: [
        { name: 'local', label: 'Local' },
        { name: 'apiOnly', label: 'API Only' },
    ],
    activeTab: '',
    userId: '',
    name: '',
    email: '',
    domainRole: '',
    roleId: '',
    password: '',
    passwordType: '',
    passwordManual: false,
    tags: {},
});

const validationState = reactive({
    isUserIdValid: undefined as undefined | boolean,
});

/* Components */


/* Components */
const handleChangeInputs = (value) => {
    if (value.userId) {
        formState.userId = value.userId;
        formState.email = value.userId;
    }
    if (value.tags) formState.tags = value.tags;
    if (value.name) formState.name = value.name;
    if (value.email) formState.email = value.email;
    if (value.domainRoleList) {
        formState.domainRole = value.domainRole;
        formState.roleId = value.roleId;
    }
    if (value.password) {
        formState.password = value.password || '';
    }
    if (value.passwordType) {
        formState.passwordType = value.passwordType;
    }
};
const handleClose = () => {
    userPageStore.$patch((_state) => {
        _state.modalVisible.create = false;
        _state.modalVisible.update = false;
    });
};
const setForm = () => {
    formState.userId = state.data.user_id;
    formState.name = state.data.name;
    formState.email = state.data.email || '';
    formState.domainRole = props.item.domain_role || '';
    formState.password = props.item.password || '';
    formState.passwordManual = false;
    formState.tags = state.data.tags || {};
};
const handleChangeVerify = (status) => {
    state.data.email_verified = status;
};

/* API */
const getUserDetailData = async (userId) => {
    if (userId === undefined) return;
    try {
        state.data = await SpaceConnector.clientV2.identity.user.get<UserGetParameters, UserModel>({
            user_id: userId,
        });
    } catch (e) {
        ErrorHandler.handleError(e);
    }
};
const confirm = async () => {
    const data: UserManagementData = {
        user_id: formState.userId,
        name: formState.name,
        email: formState.email || formState.userId,
        tags: formState.tags || {},
        password: formState.password || '',
    };
    if (userPageState.modalVisible.create) {
        if (formState.activeTab === 'local') {
            data.backend = USER_BACKEND_TYPE.LOCAL;
        } else if (formState.activeTab === 'apiOnly') {
            data.backend = USER_BACKEND_TYPE.LOCAL;
            data.user_type = USER_TYPE.API_USER;
        } else {
            data.backend = USER_BACKEND_TYPE.EXTERNAL;
        }
    }
    if (formState.activeTab === 'local' || userPageState.modalVisible.update) {
        data.reset_password = formState.passwordType === PASSWORD_TYPE.RESET;
    }

    if (state.isChangedToggle) {
        userPageStore.$patch({
            modalLoading: true,
        });
        try {
            await postDisableMfa({
                user_id: state.data.user_id,
                domain_id: state.data.domain_id,
                force: true,
            });
            if (state.loginUserId === state.data.user_id) {
                await store.dispatch('user/setUser', {
                    mfa: {
                        ...state.data?.mfa,
                        state: 'DISABLED',
                    },
                });
            }
        } catch (e: any) {
            showErrorMessage(e.message, e);
            ErrorHandler.handleError(e);
        } finally {
            userPageStore.$patch({
                modalLoading: false,
            });
        }
    }

    if (formState.domainRole !== undefined) {
        emit('confirm', data, formState.roleId);
    } else {
        emit('confirm', data, null);
    }
};

/* init */
const initAuthTypeList = async () => {
    if (store.state.domain.extendedAuthType !== undefined) {
        formState.tabs = [
            { name: 'external', label: store.getters['domain/extendedAuthTypeLabel'] },
            ...formState.tabs,
        ];
        formState.activeTab = 'external';
    } else {
        formState.activeTab = 'local';
    }
};
(async () => {
    await Promise.allSettled([
        initAuthTypeList(),
        getUserDetailData(state.selectedId),
        // LOAD REFERENCE STORE
        store.dispatch('reference/user/load'),
    ]);
    if (userPageState.modalVisible.update) {
        await setForm();
    }
})();
</script>

<template>
    <p-button-modal class="user-management-modal"
                    :header-title="headerTitle"
                    size="md"
                    :fade="true"
                    :backdrop="true"
                    :visible="userPageState.modalVisible.update || userPageState.modalVisible.create"
                    :disabled="formState.userId === ''
                        || (formState.passwordManual && formState.password === '')
                        || (userPageState.modalVisible.create && !validationState.isUserIdValid)"
                    :loading="userPageState.modalLoading"
                    @confirm="confirm"
                    @cancel="handleClose"
                    @close="handleClose"
    >
        <template #body>
            <p-box-tab v-if="userPageState.modalVisible.create"
                       v-model="formState.activeTab"
                       :tabs="formState.tabs"
                       style-type="gray"
                       class="auth-type-tab"
            >
                <div class="input-form-wrapper">
                    <user-management-form-info-form
                        :is-user-id-valid.sync="validationState.isUserIdValid"
                        :active-tab="formState.activeTab"
                        @change-input="handleChangeInputs"
                    />
                    <user-management-form-notification-email-form
                        v-if="formState.activeTab !== 'apiOnly' && state.smtpEnabled"
                        :email="formState.email"
                        @change-input="handleChangeInputs"
                    />
                    <user-management-form-password-form
                        v-if="formState.activeTab === 'local'"
                        @change-input="handleChangeInputs"
                    />
                    <user-management-form-admin-role
                        :active-tab="formState.activeTab"
                        @change-input="handleChangeInputs"
                    />
                </div>
                <div class="input-form-wrapper tags">
                    <user-management-form-tags @change-input="handleChangeInputs" />
                </div>
            </p-box-tab>
            <div v-else>
                <div class="input-form-wrapper">
                    <user-management-form-info-form
                        :is-user-id-valid.sync="validationState.isUserIdValid"
                        :active-tab="formState.activeTab"
                        :item="item"
                        @change-input="handleChangeInputs"
                    />
                    <user-management-form-notification-email-form
                        v-if="state.smtpEnabled"
                        :is-valid-email="state.data.email_verified"
                        :email="formState.email"
                        :item="state.data"
                        @change-input="handleChangeInputs"
                        @change-verify="handleChangeVerify"
                    />
                    <user-management-form-multi-factor-auth :state="state.data.mfa?.state"
                                                            :is-changed-toggle.sync="state.isChangedToggle"
                    />
                    <user-management-form-password-form
                        v-if="state.data.backend === USER_BACKEND_TYPE.LOCAL && state.data.user_type !== USER_TYPE.API_USER"
                        :item="state.data"
                        :is-valid-email="state.data.email_verified"
                        @change-input="handleChangeInputs"
                    />
                    <user-management-form-admin-role
                        :item="item"
                        @change-input="handleChangeInputs"
                    />
                </div>
                <div class="input-form-wrapper tags">
                    <user-management-form-tags :item="item"
                                               @change-input="handleChangeInputs"
                    />
                </div>
            </div>
        </template>
    </p-button-modal>
</template>

<style lang="postcss">
.user-management-modal {
    .input-form-wrapper {
        @apply flex flex-col bg-gray-100 rounded-lg;
        padding: 1rem;
        gap: 1rem;
        & + .input-form-wrapper {
            margin-top: 1.5rem;
        }
    }
    .auth-type-tab {
        margin-bottom: 1.5rem;
        overflow-y: hidden;
        .input-form-wrapper {
            &.tags {
                padding-top: 1.125rem;
                padding-bottom: 0.25rem;
                gap: 0.75rem;
            }
        }
    }
}
.tooltip {
    @apply text-paragraph-md;
    width: 14rem;
}
</style>
