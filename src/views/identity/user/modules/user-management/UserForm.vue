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
            <p-box-tab v-model="formState.activeTab" :tabs="formState.tabs" style-type="gray" class="auth-type-tab">
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

        const checkOauth = async () => {
            try {
                await SpaceConnector.client.identity.user.find({
                    search: { user_id: formState.user_id },
                    domain_id: store.state.domain.domainId,
                });
            } catch (e) {
                validationState.isUserIdValid = false;
                validationState.userIdInvalidText = vm.$t('IDENTITY.USER.FORM.USER_ID_NOT_EXIST');
            }
        };

        const checkDuplicatedId = async () => {
            try {
                const res = await SpaceConnector.client.identity.user.get({ user_id: formState.user_id });
                if (res) {
                    validationState.isUserIdValid = false;
                    validationState.userIdInvalidText = vm.$t('IDENTITY.USER.FORM.USER_ID_DUPLICATED');
                } else {
                    validationState.isUserIdValid = true;
                    validationState.userIdInvalidText = '';
                }
            } catch (e) {
                validationState.isUserIdValid = true;
                validationState.userIdInvalidText = '';
                if (e.code !== 'ERROR_NOT_FOUND') console.error(e);
            }
        };

        const checkEmailFormat = (userId) => {
            const regex = /\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/;
            if (!regex.test(userId)) {
                validationState.isUserIdValid = false;
                validationState.userIdInvalidText = vm.$t('IDENTITY.USER.FORM.EMAIL_INVALID');
            }
        };

        const checkUserID = async () => {
            validationState.isUserIdValid = undefined;
            validationState.userIdInvalidText = '';
            if (formState.user_id) {
                await checkDuplicatedId();
                if (formState.user_id.replace(/ /g, '').length !== formState.user_id.length) {
                    validationState.isUserIdValid = false;
                    validationState.userIdInvalidText = vm.$t('IDENTITY.USER.FORM.EMPTY_SPACE_INVALID');
                    return;
                }
                if (formState.activeTab === 'external') {
                    await checkOauth();
                } else if (formState.activeTab === 'local') {
                    checkEmailFormat(formState.user_id);
                }
                if (typeof validationState.isUserIdValid !== 'boolean') validationState.isUserIdValid = true;
            } else {
                validationState.isUserIdValid = false;
                validationState.userIdInvalidText = vm.$t('IDENTITY.USER.FORM.REQUIRED_FIELD');
            }
        };

        const checkEmail = async () => {
            const regex = /\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/;
            if (formState.email) {
                if (!regex.test(formState.email)) {
                    validationState.isEmailValid = false;
                    validationState.emailInvalidText = vm.$t('IDENTITY.USER.FORM.EMAIL_INVALID');
                } else {
                    validationState.isEmailValid = true;
                    validationState.emailInvalidText = '';
                }
            } else validationState.isEmailValid = true;
        };

        const checkPassword = (password) => {
            // password1
            if (password.replace(/ /g, '').length !== password.length) {
                validationState.isPasswordValid = false;
                validationState.passwordInvalidText = vm.$t('IDENTITY.USER.FORM.EMPTY_SPACE_INVALID');
            } else if (password.length < 8) {
                validationState.isPasswordValid = false;
                validationState.passwordInvalidText = vm.$t('IDENTITY.USER.FORM.MIN_LENGTH_INVALID', { min: 8 });
            } else if (!password.match(/[a-z]/)) {
                validationState.isPasswordValid = false;
                validationState.passwordInvalidText = vm.$t('IDENTITY.USER.FORM.ONE_LOWER_CASE_INVALID');
            } else if (!password.match(/[A-Z]/)) {
                validationState.isPasswordValid = false;
                validationState.passwordInvalidText = vm.$t('IDENTITY.USER.FORM.ONE_UPPER_CASE_INVALID');
            } else if (!password.match(/[0-9]/)) {
                validationState.isPasswordValid = false;
                validationState.passwordInvalidText = vm.$t('IDENTITY.USER.FORM.ONE_NUMBER_INVALID');
            } else {
                validationState.isPasswordValid = true;
                validationState.passwordInvalidText = '';
            }

            // password2
            if (!formState.passwordCheck) {
                validationState.isPasswordValid = false;
                validationState.passwordInvalidText = vm.$t('IDENTITY.USER.FORM.REQUIRED_FIELD');
            }
            if (password !== formState.passwordCheck) {
                validationState.isPasswordCheckValid = false;
                validationState.passwordCheckInvalidText = vm.$t('IDENTITY.USER.FORM.PASSWORD_CHECK_INVALID');
            } else {
                validationState.isPasswordCheckValid = true;
                validationState.passwordCheckInvalidText = '';
            }
        };

        const confirm = async () => {
            await checkUserID();
            if (!validationState.isUserIdValid) return;

            if (formState.activeTab === 'local') {
                checkPassword(formState.password);
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
