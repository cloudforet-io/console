<template>
    <p-button-modal class="user-management-modal"
                    :header-title="headerTitle"
                    size="md"
                    :fade="true"
                    :backdrop="true"
                    :visible="userPageState.visibleUpdateModal || userPageState.visibleCreateModal"
                    :disabled="formState.userId === '' || (formState.passwordManual && formState.password === '')"
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
                        v-model="formState.email"
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
                        :item="item"
                        @change-input="handleChangeInputs"
                    />
                    <password-form
                        :item="item"
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
import { reactive } from 'vue';

import { PButtonModal, PBoxTab } from '@spaceone/design-system';

import { store } from '@/store';

import AdminRole from '@/services/administration/iam/user/modules/user-management-modal/modules/AdminRole.vue';
import NotificationEmailForm
    from '@/services/administration/iam/user/modules/user-management-modal/modules/NotificationEmailForm.vue';
import PasswordForm from '@/services/administration/iam/user/modules/user-management-modal/modules/PasswordForm.vue';
import Tags from '@/services/administration/iam/user/modules/user-management-modal/modules/Tags.vue';
import UserInfoForm from '@/services/administration/iam/user/modules/user-management-modal/modules/UserInfoForm.vue';
import type { User } from '@/services/administration/iam/user/type';
import { useUserPageStore } from '@/services/administration/store/user-page-store';

interface AuthType {
    user_type: string;
    backend: string;
}

const authTypeMap: Record<string, AuthType> = {
    external: {
        user_type: 'USER',
        backend: 'EXTERNAL',
    },
    local: {
        user_type: 'USER',
        backend: 'LOCAL',
    },
    apiOnly: {
        user_type: 'API_USER',
        backend: 'LOCAL',
    },
};

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
            password: '',
            passwordManual: false,
            tags: {},
        });

        /* Components */
        const handleChangeInputs = (value) => {
            if (value.userId) {
                formState.userId = value.userId;
                formState.email = value.userId;
            }
            if (value.email) formState.email = value.email;
            if (value.domainRole) formState.domainRole = value.domainRole;
            if (value.tags) formState.tags = value.tags;
            if (value.name) formState.name = value.name;
            if (value.password !== undefined || formState.passwordManual !== undefined) {
                formState.password = value.password || '';
                formState.passwordManual = value.passwordManual;
            }
        };
        const handleClose = () => {
            userPageStore.$patch({ visibleCreateModal: false, visibleUpdateModal: false });
        };
        const setForm = () => {
            if (props.item) {
                formState.userId = props.item.user_id;
                formState.name = props.item.name;
                formState.email = props.item.email;
                formState.domainRole = props.item.domain_role;
                formState.password = props.item.password;
                formState.passwordManual = false;
                formState.tags = props.item.tags;
            }
        };

        /* API */
        const confirm = async () => {
            const data = {
                user_id: formState.userId,
                name: formState.name,
                email: formState.email,
                backend: authTypeMap[formState.activeTab]?.backend,
                user_type: authTypeMap[formState.activeTab]?.user_type,
                password: formState.password || '',
                tags: formState.tags || {},
                reset_password: !formState.passwordManual,
            };
            console.log(data);
            if (formState.domainRole !== '') {
                emit('confirm', data, formState.domainRole);
            } else {
                emit('confirm', data, null);
            }
            userPageStore.$patch({ visibleCreateModal: false });
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
                // LOAD REFERENCE STORE
                store.dispatch('reference/user/load'),
            ]);
            if (userPageState.visibleUpdateModal) {
                await setForm();
            }
        })();

        return {
            userPageState,
            formState,
            confirm,
            handleClose,
            handleChangeInputs,
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
