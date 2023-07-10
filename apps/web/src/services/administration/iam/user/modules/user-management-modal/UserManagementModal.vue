<template>
    <p-button-modal class="user-management-modal"
                    :header-title="headerTitle"
                    size="md"
                    :fade="true"
                    :backdrop="true"
                    :visible="userPageState.visibleUpdateModal || userPageState.visibleCreateModal"
                    :disabled="formState.userId === '' || (formState.passwordManual && formState.password === '')"
                    :loading="userPageState.modalLoading"
                    @confirm="confirm"
                    @cancel="handleClose"
                    @close="handleClose"
    >
        <template #body>
            <p-box-tab v-if="userPageState.visibleCreateModal"
                       v-model="formState.activeTab"
                       :tabs="formState.tabs"
                       style-type="gray"
                       class="auth-type-tab"
            >
                <div class="input-form-wrapper">
                    <user-info-form
                        :active-tab="formState.activeTab"
                        @change-input="handleChangeInputs"
                    />
                    <notification-email-form
                        v-if="formState.activeTab !== 'apiOnly'"
                        :email="formState.email"
                        @change-input="handleChangeInputs"
                    />
                    <password-form
                        v-if="formState.activeTab === 'local'"
                        @change-input="handleChangeInputs"
                    />
                    <admin-role
                        :active-tab="formState.activeTab"
                        @change-input="handleChangeInputs"
                    />
                </div>
                <div class="input-form-wrapper tags">
                    <tags @change-input="handleChangeInputs" />
                </div>
            </p-box-tab>
            <div v-else>
                <div class="input-form-wrapper">
                    <user-info-form
                        :active-tab="formState.activeTab"
                        :item="item"
                        @change-input="handleChangeInputs"
                    />
                    <notification-email-form
                        :is-valid-email="state.data.email_verified"
                        :email="formState.email"
                        :item="state.data"
                        @change-input="handleChangeInputs"
                        @change-verify="handleChangeVerify"
                    />
                    <password-form
                        v-if="state.data.backend === USER_BACKEND_TYPE.LOCAL && state.data.user_type !== USER_TYPE.API_USER"
                        :item="state.data"
                        :is-valid-email="state.data.email_verified"
                        @change-input="handleChangeInputs"
                    />
                    <admin-role
                        :item="item"
                        @change-input="handleChangeInputs"
                    />
                </div>
                <div class="input-form-wrapper tags">
                    <tags :item="item"
                          @change-input="handleChangeInputs"
                    />
                </div>
            </div>
        </template>
    </p-button-modal>
</template>

<script lang="ts">
import { computed, reactive } from 'vue';

import { PButtonModal, PBoxTab } from '@spaceone/design-system';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { store } from '@/store';

import ErrorHandler from '@/common/composables/error/errorHandler';

import AdminRole from '@/services/administration/iam/user/modules/user-management-modal/modules/AdminRole.vue';
import NotificationEmailForm
    from '@/services/administration/iam/user/modules/user-management-modal/modules/NotificationEmailForm.vue';
import PasswordForm from '@/services/administration/iam/user/modules/user-management-modal/modules/PasswordForm.vue';
import Tags from '@/services/administration/iam/user/modules/user-management-modal/modules/Tags.vue';
import UserInfoForm from '@/services/administration/iam/user/modules/user-management-modal/modules/UserInfoForm.vue';
import type { User, UserManagementData } from '@/services/administration/iam/user/type';
import { PASSWORD_TYPE, USER_BACKEND_TYPE, USER_TYPE } from '@/services/administration/iam/user/type';
import { useUserPageStore } from '@/services/administration/store/user-page-store';

export default {
    name: 'UserCreateModal',
    components: {
        Tags,
        AdminRole,
        PasswordForm,
        NotificationEmailForm,
        UserInfoForm,
        PButtonModal,
        PBoxTab,
    },
    directives: {
        focus: {
            inserted(el) {
                el.focus();
            },
        },
    },
    props: {
        headerTitle: {
            type: String,
            required: true,
        },
        item: {
            type: undefined as undefined | User,
            default: undefined,
        },
    },
    setup(props, { emit }) {
        const userPageStore = useUserPageStore();
        const userPageState = userPageStore.$state;

        const state = reactive({
            data: {} as User,
            selectedId: computed(() => props.item?.user_id),
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
            domainRole: '' || undefined,
            roleId: '',
            password: '',
            passwordType: '',
            passwordManual: false,
            tags: {},
        });

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
            userPageStore.$patch({ visibleCreateModal: false, visibleUpdateModal: false });
        };
        const setForm = () => {
            formState.userId = state.data.user_id;
            formState.name = state.data.name;
            formState.email = state.data.email || '';
            formState.domainRole = props.item.domain_role;
            formState.password = props.item.password;
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
                state.data = await SpaceConnector.client.identity.user.get({
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
            if (userPageState.visibleCreateModal) {
                if (formState.activeTab === 'local') {
                    data.backend = USER_BACKEND_TYPE.LOCAL;
                } else if (formState.activeTab === 'apiOnly') {
                    data.backend = USER_BACKEND_TYPE.LOCAL;
                    data.user_type = USER_TYPE.API_USER;
                } else {
                    data.backend = USER_BACKEND_TYPE.EXTERNAL;
                }
            }
            if (formState.activeTab === 'local' || userPageState.visibleUpdateModal) {
                data.reset_password = formState.passwordType === PASSWORD_TYPE.RESET;
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
            if (userPageState.visibleUpdateModal) {
                await setForm();
            }
        })();

        return {
            userPageState,
            state,
            formState,
            confirm,
            handleClose,
            handleChangeInputs,
            handleChangeVerify,
            USER_BACKEND_TYPE,
            USER_TYPE,
        };
    },
    computed: {
        store() {
            return store;
        },
    },
};
</script>

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
