<template>
    <p-button-modal class="user-update-form-modal"
                    :header-title="headerTitle"
                    :scrollable="true"
                    size="sm"
                    :fade="true"
                    :backdrop="true"
                    :visible.sync="proxyVisible"
                    @confirm="confirm"
    >
        <template #body>
            <p-field-group :label="$t('IDENTITY.USER.FORM.USER_ID')" required>
                <template #default>
                    <div class="id-input-form">
                        <p-text-input v-model="formState.user_id"
                                      disabled
                                      class="text-input"
                        />
                    </div>
                </template>
            </p-field-group>
            <p-field-group :label="$t('IDENTITY.USER.FORM.NAME')" class="input-form" required>
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
            <p-field-group :label="$t('IDENTITY.USER.FORM.ASSIGN_DOMAIN_ROLE')" class="input-form" required>
                <p-select-dropdown v-model="formState.domainRole"
                                   :items="formState.domainRoleItem"
                                   :disabled="formState.domainRoleItem.length < 2 || isSameId"
                                   use-fixed-menu-style
                                   class="dropdown"
                />
            </p-field-group>
            <form v-if="isAdmin && item.backend === 'LOCAL' && item.user_type !== 'API Only'"
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
        </template>
    </p-button-modal>
</template>

<script lang="ts">
import { TranslateResult } from 'vue-i18n';

import {
    reactive, toRefs, computed, getCurrentInstance, ComponentRenderProxy,
} from '@vue/composition-api';

import {
    PButtonModal, PSelectDropdown, PFieldGroup, PTextInput,
} from '@spaceone/design-system';

import { makeProxy } from '@/lib/helper/composition-helpers';
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { store } from '@/store';
import {
    checkEmailFormat, checkEmptyValue, checkMinLength, checkOneLowerCase, checkOneNumber, checkOneUpperCase, checkSamePassword,
    Validation,
} from '@/services/identity/user/lib/user-form-validations';

interface AuthType {
    label: string | null;
    user_type: string;
    backend: string;
}
type AuthTypeList = AuthType[];

export default {
    name: 'UserUpdateForm',
    components: {
        PButtonModal,
        PFieldGroup,
        PTextInput,
        PSelectDropdown,
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
        updateMode: {
            type: Boolean,
            default: false,
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
            authTypeList: [
                {
                    label: 'Local',
                    user_type: 'USER',
                    backend: 'LOCAL',
                }, {
                    label: 'API Only',
                    user_type: 'API_USER',
                    backend: 'LOCAL',
                },
            ] as AuthTypeList,
            selectedAuthType: {} as AuthType,
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
            isEmailValid: undefined as undefined | boolean,
            emailInvalidText: '' as TranslateResult | string,
            //
            isPasswordValid: undefined as undefined | boolean,
            passwordInvalidText: '' as TranslateResult | string,
            isPasswordCheckValid: undefined as undefined | boolean,
            passwordCheckInvalidText: '' as TranslateResult | string,
        });

        const checkEmail = async () => {
            if (formState.email.trim().length > 0) {
                const validation: Validation = await checkEmailFormat(formState.email);
                validationState.isEmailValid = validation.isValid;
                validationState.emailInvalidText = validation.invalidText;
            } else {
                validationState.isEmailValid = true;
                validationState.emailInvalidText = '';
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
            const passwordCheckValidation: Validation = await checkSamePassword(formState.passwordCheck, password);
            validationState.isPasswordCheckValid = passwordCheckValidation.isValid;
            validationState.passwordCheckInvalidText = passwordCheckValidation.invalidText;
        };

        const confirm = async () => {
            await checkEmail();
            if (!validationState.isEmailValid) return;
            if (props.isAdmin && props.item.backend === 'LOCAL' && props.item.user_type !== 'API Only') {
                if (formState.password || formState.passwordCheck) await checkPassword(formState.password);
                else {
                    validationState.isPasswordValid = true;
                    validationState.isPasswordCheckValid = true;
                }

                if (!(validationState.isPasswordValid && validationState.isPasswordCheckValid)) return;
            }
            const data = {
                user_id: formState.user_id,
                name: formState.name,
                email: formState.email,
                backend: props.item.backend,
                user_type: props.item.user_type,
                password: formState.password || '',
            };
            if (formState.domainRoleList.length > 0) {
                emit('confirm', data, formState.domainRoleList[0].name, formState.domainRole);
            } else {
                emit('confirm', data, null, null);
            }
        };

        /* Set(Initialize) Form */
        const getRoleList = async () => {
            try {
                const res = await SpaceConnector.client.identity.role.list({
                    role_type: 'DOMAIN',
                });
                formState.domainRoleList = res.results.map(d => ({
                    type: 'item',
                    label: d.name,
                    name: d.role_id,
                }));
            } catch (e) {
                console.error(e);
            }
        };

        const setCurrentDomainId = async () => {
            if (formState.domainRoleList[0]) {
                try {
                    const res = await SpaceConnector.client.identity.roleBinding.list({
                        resource_type: 'identity.User',
                        resource_id: formState.user_id,
                        role_type: 'DOMAIN',
                    });
                    if (res.total_count > 0) formState.domainRole = formState.domainRoleList[0].name;
                    else formState.domainRole = '';
                } catch (e) { console.error(e); }
            } else {
                formState.domainRole = '';
            }
        };

        const checkIsSameId = () => {
            const userAccountId = store.state.user.userId;
            if (formState.user_id === userAccountId) state.isSameId = true;
            else state.isSameId = false;
        };

        const setForm = async () => {
            formState.user_id = props.item.user_id;
            formState.name = props.item.name;
            formState.email = props.item.email;
            checkIsSameId();
            await setCurrentDomainId();
        };

        (async () => {
            await getRoleList();
            await setForm();
        })();

        return {
            ...toRefs(state),
            formState,
            validationState,
            confirm,
        };
    },
};
</script>

<style lang="postcss">
.user-update-form-modal {
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
    }
}
</style>
