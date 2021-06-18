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
            <p-field-group :label="$t('IDENTITY.USER.FORM.USER_ID')">
                <template #default>
                    <div class="id-input-form">
                        <p-text-input v-model="formState.user_id"
                                      disabled
                                      class="text-input"
                        />
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
/* eslint-disable camelcase */
import { TranslateResult } from 'vue-i18n';

import {
    reactive, toRefs, computed, getCurrentInstance, ComponentRenderProxy, watch,
} from '@vue/composition-api';

import {
    PButtonModal, PSelectDropdown, PFieldGroup, PButton, PTextInput, PI,
} from '@spaceone/design-system';

import { makeProxy } from '@/lib/compostion-util';
import { SpaceConnector } from '@/lib/space-connector';
import { store } from '@/store';

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
            await checkEmail();
            if (!validationState.isEmailValid) return;
            if (props.isAdmin && props.item.backend === 'LOCAL' && props.item.user_type !== 'API Only') {
                checkPassword(formState.password);
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

        const setCurrentDomainId = async () => {
            if (props.updateMode && formState.domainRoleList[0]) {
                const res = await SpaceConnector.client.identity.roleBinding.list({
                    resource_type: 'identity.User',
                    resource_id: formState.user_id,
                    role_type: 'DOMAIN',
                });
                if (res.total_count > 0) formState.domainRole = formState.domainRoleList[0].name;
                else formState.domainRole = '';
            } else {
                formState.domainRole = '';
            }
        };

        const checkIsSameId = () => {
            const userAccountId = store.state.user.userId;
            if (formState.user_id === userAccountId) state.isSameId = true;
            else state.isSameId = false;
        };

        (async () => {
            formState.user_id = props.item.user_id;
            formState.name = props.item.name;
            formState.email = props.item.email;
            await checkIsSameId();
            await Promise.all([getRoleList()]);
            await setCurrentDomainId();
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
        .p-select-dropdown {
            max-width: 14rem;
        }
    }
}
</style>
