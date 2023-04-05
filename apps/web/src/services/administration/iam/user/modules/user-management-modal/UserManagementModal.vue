<template>
    <p-button-modal class="user-management-modal"
                    :header-title="headerTitle"
                    size="md"
                    :fade="true"
                    :backdrop="true"
                    :visible="isUpdate ? userPageState.visibleUpdateModal : userPageState.visibleCreateModal"
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
                    <user-info-form :active-tab="formState.activeTab" />
                    <notification-email-form v-if="formState.activeTab !== 'apiOnly'" />
                    <password-form v-if="formState.activeTab === 'local'" />
                    <admin-role :active-tab="formState.activeTab" />
                </div>
                <div class="input-form-wrapper tags">
                    <tags />
                </div>
            </p-box-tab>
            <div v-else>
                <div class="input-form-wrapper">
                    <user-info-form :active-tab="formState.activeTab" />
                    <notification-email-form />
                    <password-form />
                    <admin-role />
                </div>
                <div class="input-form-wrapper tags">
                    <tags />
                </div>
            </div>
        </template>
    </p-button-modal>
</template>

<script lang="ts">
import {
    reactive, computed, watch,
} from 'vue';
import type { TranslateResult } from 'vue-i18n';

import {
    PButtonModal,
    PBoxTab,
} from '@spaceone/design-system';

import { store } from '@/store';
import { i18n } from '@/translations';

import type { Validation } from '@/services/administration/iam/user/lib/user-form-validations';
import {
    checkEmptyValue, checkMinLength,
    checkOneLowerCase, checkOneNumber, checkOneUpperCase,
    checkRequiredField, checkSamePassword,
} from '@/services/administration/iam/user/lib/user-form-validations';
import AdminRole from '@/services/administration/iam/user/modules/user-management-modal/modules/AdminRole.vue';
import NotificationEmailForm
    from '@/services/administration/iam/user/modules/user-management-modal/modules/NotificationEmailForm.vue';
import PasswordForm from '@/services/administration/iam/user/modules/user-management-modal/modules/PasswordForm.vue';
import Tags from '@/services/administration/iam/user/modules/user-management-modal/modules/Tags.vue';
import UserInfoForm from '@/services/administration/iam/user/modules/user-management-modal/modules/UserInfoForm.vue';
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
            type: Object,
            default: undefined,
        },
        isUpdate: {
            type: Boolean || undefined,
            default: false,
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
            domainRoleItem: computed(() => [
                { type: 'item', label: i18n.t('IDENTITY.USER.FORM.NOT_SELECT_ROLE'), name: '' },
                ...formState.domainRoleList,
            ]),
            domainRoleList: [] as any[],
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

        const checkPasswordCheck = async (password) => {
            const passwordCheckValidation: Validation[] = await Promise.all([
                checkRequiredField(formState.passwordCheck),
                checkSamePassword(formState.passwordCheck, password),
            ]);
            const passwordCheckInvalidObj = passwordCheckValidation.find((item) => item.invalidText.length > 0);
            if (!passwordCheckInvalidObj) {
                validationState.isPasswordCheckValid = true;
                validationState.passwordCheckInvalidText = '';
            } else {
                validationState.isPasswordCheckValid = passwordCheckInvalidObj.isValid;
                validationState.passwordCheckInvalidText = passwordCheckInvalidObj.invalidText;
            }
        };
        const checkPassword = async (password) => {
            const passwordValidation: Validation[] = await Promise.all([
                checkEmptyValue(password),
                checkMinLength(password, 8),
                checkOneLowerCase(password),
                checkOneUpperCase(password),
                checkOneNumber(password),
            ]);
            const passwordInvalidObj = passwordValidation.find((item) => item.invalidText.length > 0);
            if (!passwordInvalidObj) {
                validationState.isPasswordValid = true;
                validationState.passwordInvalidText = '';
            } else {
                validationState.isPasswordValid = passwordInvalidObj.isValid;
                validationState.passwordInvalidText = passwordInvalidObj.invalidText;
            }
        };

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
        const checkPasswordValidation = async (password) => {
            // password
            await checkPassword(password);

            // password check
            await checkPasswordCheck(password);
        };

        const confirm = async () => {
            if (!validationState.isUserIdValid || !validationState.isTagsValid) return;
            if (formState.activeTab === 'local') {
                await checkPasswordValidation(formState.password);
                if (!(validationState.isPasswordValid && validationState.isPasswordCheckValid)) return;
            }
            const data = {
                user_id: formState.userId,
                name: formState.name,
                email: formState.email,
                backend: authTypeMap[formState.activeTab]?.backend,
                user_type: authTypeMap[formState.activeTab]?.user_type,
                password: formState.password || '',
                tags: formState.tags || {},
            };
            if (formState.domainRoleList.length > 0) {
                emit('confirm', data, formState.domainRole);
            } else {
                emit('confirm', data, null);
            }
            userPageStore.$patch({ visibleCreateModal: false });
        };

        const handleClose = () => {
            userPageStore.$patch({ visibleCreateModal: false });
        };


        /* init */
        (async () => {
            await Promise.allSettled([
                initAuthTypeList(),
                // LOAD REFERENCE STORE
                store.dispatch('reference/user/load'),
            ]);
        })();


        watch(() => formState.password, (after) => {
            checkPassword(after);
        });
        watch(() => formState.passwordCheck, () => {
            checkPasswordCheck(formState.password);
        });

        return {
            userPageState,
            formState,
            validationState,
            confirm,
            handleClose,
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
