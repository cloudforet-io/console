<template>
    <p-button-modal class="user-form-modal"
                    :header-title="headerTitle"
                    :scrollable="true"
                    size="md"
                    :fade="true"
                    :backdrop="true"
                    :visible.sync="proxyVisible"
                    @confirm="confirm"
    >
        <template #body>
            <p-box-tab v-model="formState.activeTab" :tabs="formState.tabs" style-type="gray"
                       class="auth-type-tab"
            >
                <p-field-group :label="$t('IDENTITY.USER.FORM.USER_ID')"
                               :required="true"
                               :invalid="validationState.isUserIdValid === false"
                               :invalid-text="validationState.userIdInvalidText"
                               :valid="validationState.isUserIdValid"
                               :valid-text="validationState.userIdValidText"
                >
                    <template #default="{invalid}">
                        <div class="id-input-form">
                            <p-text-input v-model="formState.user_id"
                                          v-focus
                                          :placeholder="$t('IDENTITY.USER.FORM.NAME_PLACEHOLDER')"
                                          :invalid="invalid"
                                          class="text-input"
                            />
                            <p-button style-type="outline primary-dark"
                                      class="user-id-check-button"
                                      @click="checkUserID"
                            >
                                {{ $t('IDENTITY.USER.FORM.CHECK_USER_ID') }}
                            </p-button>
                        </div>
                    </template>
                </p-field-group>
                <p-field-group :label="$t('IDENTITY.USER.FORM.NAME')" class="input-form">
                    <p-text-input v-model="formState.name" class="text-input" autocomplete="username" />
                </p-field-group>
                <p-field-group :label="$t('IDENTITY.USER.FORM.EMAIL')"
                               :invalid="validationState.isEmailValid === false"
                               :invalid-text="validationState.emailInvalidText"
                               class="input-form"
                >
                    <template #default="{invalid}">
                        <p-text-input v-model="formState.email" :invalid="invalid" class="text-input" />
                    </template>
                </p-field-group>
                <p-field-group :label="$t('IDENTITY.USER.FORM.ASSIGN_DOMAIN_ROLE')" class="input-form">
                    <p-select-dropdown v-model="formState.domainRole"
                                       :items="formState.domainRoleItem"
                                       :disabled="formState.domainRoleItem.length < 2 || isSameId"
                                       use-fixed-menu-style
                                       class="dropdown"
                    />
                </p-field-group>
                <form v-if="formState.activeTab === 'local'"
                      class="form"
                >
                    <p-field-group
                        :label="$t('COMMON.PROFILE.PASSWORD')"
                        :required="true"
                        :invalid="validationState.isPasswordValid === false"
                        :invalid-text="validationState.passwordInvalidText"
                        class="input-form"
                    >
                        <template #default="{invalid}">
                            <p-text-input v-model="formState.password" type="password"
                                          autocomplete="current-password"
                                          class="text-input"
                                          :invalid="invalid"
                            />
                        </template>
                    </p-field-group>
                    <p-field-group
                        :label="$t('COMMON.PROFILE.PASSWORD_CHECK')"
                        :required="true"
                        :invalid="validationState.isPasswordCheckValid === false"
                        :invalid-text="validationState.passwordCheckInvalidText"
                        class="input-form"
                    >
                        <template #default="{invalid}">
                            <p-text-input v-model="formState.passwordCheck" type="password"
                                          class="text-input"
                                          autocomplete="new-password"
                                          :invalid="invalid"
                            />
                        </template>
                    </p-field-group>
                </form>
            </p-box-tab>
        </template>
    </p-button-modal>
</template>

<script lang="ts">
/* eslint-disable camelcase */
import { TranslateResult } from 'vue-i18n';

import {
    reactive, toRefs, computed, getCurrentInstance, ComponentRenderProxy, watch,
} from '@vue/composition-api';

import {
    PButtonModal, PSelectDropdown, PFieldGroup, PButton, PTextInput, PBoxTab,
} from '@spaceone/design-system';

import { makeProxy } from '@spaceone/console-core-lib';
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { store } from '@/store';
import {
    checkDuplicateID,
    checkEmailFormat, checkEmptyValue, checkMinLength,
    checkOauth, checkOneLowerCase, checkOneNumber, checkOneUpperCase,
    checkRequiredField, checkSamePassword, Validation,
} from '@/views/identity/user/hooks/useValidations';

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
    name: 'UserForm',
    components: {
        PButtonModal,
        PFieldGroup,
        PTextInput,
        PSelectDropdown,
        PButton,
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
        visible: {
            type: Boolean,
            default: false,
        },
        item: {
            type: Object,
            default: undefined,
        },
        isAdmin: {
            type: Boolean,
            default: false,
        },
    },
    setup(props, { emit }) {
        const vm = getCurrentInstance() as ComponentRenderProxy;

        const state = reactive({
            proxyVisible: makeProxy('visible', props, emit),
            isSameId: false,
        });
        const formState = reactive({
            tabs: [
                { name: 'local', label: 'Local' },
                { name: 'apiOnly', label: 'API Only' },
            ],
            activeTab: '',
            user_id: '',
            name: '',
            email: '',
            domainRole: '',
            domainRoleItem: computed(() => [
                { type: 'item', label: vm.$t('IDENTITY.USER.FORM.NOT_SELECT_ROLE'), name: '' },
                ...formState.domainRoleList,
            ]),
            domainRoleList: [] as any[],
            password: '',
            passwordCheck: '',
        });
        const validationState = reactive({
            isUserIdValid: undefined as undefined | boolean,
            userIdInvalidText: '' as TranslateResult | string,
            userIdValidText: computed(() => vm.$t('IDENTITY.USER.FORM.NAME_VALID')),
            //
            isEmailValid: undefined as undefined | boolean,
            emailInvalidText: '' as TranslateResult | string,
            //
            isPasswordValid: undefined as undefined | boolean,
            passwordInvalidText: '' as TranslateResult | string,
            isPasswordCheckValid: undefined as undefined | boolean,
            passwordCheckInvalidText: '' as TranslateResult | string,
        });

        const executeSpecificIDValidation = async () => {
            let res: Validation = { isValid: true, invalidText: '' };
            if (formState.activeTab === 'local') res = await checkEmailFormat(formState.user_id);
            else if (formState.activeTab === 'external') res = await checkOauth(formState.user_id);
            return res;
        };

        const checkUserID = async () => {
            const validation: Validation[] = await Promise.all([
                checkRequiredField(formState.user_id),
                checkDuplicateID(formState.user_id),
                checkEmptyValue(formState.user_id),
                executeSpecificIDValidation()]);
            const invalidObj = validation.find(item => item.invalidText.length > 0);
            if (!invalidObj) {
                validationState.isUserIdValid = true;
                validationState.userIdInvalidText = '';
            } else {
                validationState.isUserIdValid = invalidObj.isValid;
                validationState.userIdInvalidText = invalidObj.invalidText;
            }
        };

        const checkPassword = async (password) => {
            // password1
            const passwordValidation: Validation[] = await Promise.all([
                checkEmptyValue(password),
                checkMinLength(password, 8),
                checkOneLowerCase(password),
                checkOneUpperCase(password),
                checkOneNumber(password),
            ]);
            const passwordInvalidObj = passwordValidation.find(item => item.invalidText.length > 0);
            if (!passwordInvalidObj) {
                validationState.isPasswordValid = true;
                validationState.passwordInvalidText = '';
            } else {
                validationState.isPasswordValid = passwordInvalidObj.isValid;
                validationState.passwordInvalidText = passwordInvalidObj.invalidText;
            }

            // password2
            const passwordCheckValidation: Validation[] = await Promise.all([
                checkRequiredField(formState.passwordCheck),
                checkSamePassword(formState.passwordCheck, password),
            ]);
            const passwordCheckInvalidObj = passwordCheckValidation.find(item => item.invalidText.length > 0);
            if (!passwordCheckInvalidObj) {
                validationState.isPasswordCheckValid = true;
                validationState.passwordCheckInvalidText = '';
            } else {
                validationState.isPasswordCheckValid = passwordCheckInvalidObj.isValid;
                validationState.passwordCheckInvalidText = passwordCheckInvalidObj.invalidText;
            }
        };

        const confirm = async () => {
            await checkUserID();
            if (!validationState.isUserIdValid) return;
            if (formState.activeTab === 'local') {
                await checkPassword(formState.password);
                if (!(validationState.isPasswordValid && validationState.isPasswordCheckValid)) return;
            }
            const data = {
                user_id: formState.user_id,
                name: formState.name,
                email: formState.email,
                backend: authTypeMap[formState.activeTab]?.backend,
                user_type: authTypeMap[formState.activeTab]?.user_type,
                password: formState.password || '',
            };
            if (formState.domainRoleList.length > 0) {
                emit('confirm', data, formState.domainRoleList[0].name, formState.domainRole);
            } else {
                emit('confirm', data, null, null);
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

        const getRoleList = async () => {
            const res = await SpaceConnector.client.identity.role.list({
                role_type: 'DOMAIN',
            });
            formState.domainRoleList = res.results.map(d => ({
                type: 'item',
                label: d.name,
                name: d.role_id,
            }));
        };

        (async () => {
            await Promise.all([initAuthTypeList(), getRoleList()]);
        })();

        const setFormState = () => {
            formState.user_id = '';
            formState.name = '';
            formState.email = '';
            formState.domainRole = '';
            formState.password = '';
            formState.passwordCheck = '';
        };
        const setValidationState = () => {
            validationState.isUserIdValid = undefined;
            validationState.userIdInvalidText = '';
            validationState.isEmailValid = undefined;
            validationState.emailInvalidText = '';
            validationState.isPasswordValid = undefined;
            validationState.passwordInvalidText = '';
            validationState.isPasswordCheckValid = undefined;
            validationState.passwordCheckInvalidText = '';
        };

        watch(() => formState.activeTab, (after) => {
            if (after) {
                setFormState();
                setValidationState();
            }
        }, { immediate: true });

        return {
            ...toRefs(state),
            formState,
            validationState,
            confirm,
            checkUserID,
        };
    },
};
</script>

<style lang="postcss">
.user-form-modal {
    .auth-type-tab {
        margin-bottom: 1.5rem;
    }
    .id-input-form {
        max-width: 32rem;
        display: flex;
        .text-input {
            width: 25rem;
        }
    }
    .input-form {
        max-width: 25rem;
        .text-input {
            width: 25rem;
        }
        .p-select-dropdown {
            max-width: 14rem;
        }
    }
    .user-id-check-button {
        margin-left: 0.5rem;
        min-height: 2rem;
    }
}
</style>
