<template>
    <p-button-modal class="user-management-modal"
                    :header-title="headerTitle"
                    size="md"
                    :fade="true"
                    :backdrop="true"
                    :visible="isUpdate ? userPageState.visibleUpdateModal : userPageState.visibleCreateModal"
                    :disabled="formState.userId === '' || formState.name === ''"
                    @confirm="confirm"
                    @cancel="handleClose"
                    @close="handleClose"
    >
        <template #body>
            <p-box-tab v-if="!isUpdate"
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
                        @change-input="handleChangeInputs"
                    />
                    <notification-email-form @change-input="handleChangeInputs" />
                    <password-form @change-input="handleChangeInputs" />
                    <admin-role @change-input="handleChangeInputs" />
                </div>
                <div class="input-form-wrapper tags">
                    <tags @change-input="handleChangeInputs" />
                </div>
            </div>
        </template>
    </p-button-modal>
</template>

<script lang="ts">
import { reactive, computed } from 'vue';
import type { TranslateResult } from 'vue-i18n';

import {
    PButtonModal,
    PBoxTab,
} from '@spaceone/design-system';

import { store } from '@/store';
import { i18n } from '@/translations';

import AdminRole from '@/services/administration/iam/user/modules/user-management-modal/modules/AdminRole.vue';
import NotificationEmailForm
    from '@/services/administration/iam/user/modules/user-management-modal/modules/NotificationEmailForm.vue';
import PasswordForm from '@/services/administration/iam/user/modules/user-management-modal/modules/PasswordForm.vue';
import Tags from '@/services/administration/iam/user/modules/user-management-modal/modules/Tags.vue';
import UserInfoForm from '@/services/administration/iam/user/modules/user-management-modal/modules/UserInfoForm.vue';
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
            type: Object,
            default: undefined,
        },
        isUpdate: {
            type: Boolean || undefined,
            default: false,
        },
    },
    setup() {
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
            passwordCheck: '',
            passwordManual: false,
            tags: {},
        });
        const validationState = reactive({
            isUserIdValid: undefined as undefined | boolean,
            userIdInvalidText: '' as TranslateResult | string,
            userIdValidText: computed(() => i18n.t('IDENTITY.USER.FORM.NAME_VALID')),
            isEmailValid: undefined as undefined | boolean,
            emailInvalidText: '' as TranslateResult | string,
            isPasswordValid: undefined as undefined | boolean,
            passwordInvalidText: '' as TranslateResult | string,
            isPasswordCheckValid: undefined as undefined | boolean,
            passwordCheckInvalidText: '' as TranslateResult | string,
            isTagsValid: undefined as undefined | boolean,
        });

        /* Components */
        const handleChangeInputs = (value) => {
            formState.userId = value.userId;
            formState.name = value.name;
            formState.email = value.email;
            formState.password = value.password;
            formState.passwordCheck = value.passwordCheck;
            formState.domainRole = value.domainRole;
            formState.passwordManual = value.passwordManual;
            formState.tags = value.tags;
        };
        const handleClose = () => {
            userPageStore.$patch({ visibleCreateModal: false });
        };

        /* API */
        const confirm = async () => {
            console.log({ ...formState });
            // if (!validationState.isUserIdValid || !validationState.isTagsValid) return;
            // if (formState.activeTab === 'local') {
            //     await checkPasswordValidation(formState.password);
            //     if (!(validationState.isPasswordValid && validationState.isPasswordCheckValid)) return;
            // }
            // const data = {
            //     user_id: formState.userId,
            //     name: formState.name,
            //     email: formState.email,
            //     backend: authTypeMap[formState.activeTab]?.backend,
            //     user_type: authTypeMap[formState.activeTab]?.user_type,
            //     password: formState.password || '',
            //     tags: formState.tags || {},
            // };
            // if (formState.domainRoleList.length > 0) {
            //     emit('confirm', data, formState.domainRole);
            // } else {
            //     emit('confirm', data, null);
            // }
            // userPageStore.$patch({ visibleCreateModal: false });
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
        })();

        return {
            userPageState,
            formState,
            validationState,
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
