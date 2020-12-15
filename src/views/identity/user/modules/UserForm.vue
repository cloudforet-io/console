<template>
    <p-button-modal class="user-form-modal"
                    :header-title="headerTitle"
                    :centered="true"
                    :scrollable="true"
                    size="lg"
                    :fade="true"
                    :backdrop="true"
                    :visible.sync="proxyVisible"
                    @confirm="confirm"
    >
        <template #body>
            <div v-if="!updateMode" class="auth-type-list">
                <div v-for="(item) in formState.authTypeList" :key="item.label"
                     class="auth-type-item"
                     :class="{'selected': item.label === formState.selectedAuthType.label}"
                     @click="selectAuthType(item)"
                >
                    <p class="auth-type-label">
                        <p-i v-if="item.label === formState.selectedAuthType.label"
                             name="ic_check" width="1.125rem" height="1.125rem"
                             color="transparent inherit"
                        />
                        {{ item.label }}
                    </p>
                </div>
            </div>
            <p-field-group :label="$t('IDENTITY.USER.FORM.USER_ID')"
                           :required="true"
                           :invalid="!validationState.isUserIdValid"
                           :invalid-text="validationState.userIdInvalidText"
                           :valid="validationState.isUserIdValid"
                           :valid-text="validationState.userIdValidText"
            >
                <template #default="{invalid}">
                    <div class="id-input-form">
                        <p-text-input v-model="formState.user_id"
                                      v-focus
                                      :placeholder="$t('IDENTITY.USER.FORM.NAME_PLACEHOLDER')"
                                      :disabled="updateMode"
                                      :invalid="invalid"
                                      class="text-input"
                        />
                        <p-button style-type="primary-dark" :disabled="updateMode" class="user-id-check-button"
                                  @click="checkUserID"
                        >
                            {{ $t('IDENTITY.USER.FORM.CHECK_USER_ID') }}
                        </p-button>
                    </div>
                </template>
            </p-field-group>
            <p-field-group :label="$t('IDENTITY.USER.FORM.NAME')" class="input-form">
                <p-text-input v-model="formState.name" class="text-input" />
            </p-field-group>
            <p-field-group :label="$t('IDENTITY.USER.FORM.EMAIL')" class="input-form">
                <p-text-input v-model="formState.email" class="text-input" />
            </p-field-group>
            <p-field-group :label="'Domain Role'" class="input-form">
                <p-select-dropdown v-model="formState.domainRole"
                                   :items="formState.domainRoleItem"
                                   auto-height
                                   class="dropdown"
                />
            </p-field-group>
            <form v-if="formState.selectedAuthType.label === 'Local'"
                  class="form"
            >
                <p-field-group
                    :label="$t('COMMON.PROFILE.PASSWORD')"
                    :invalid="!validationState.isPasswordValid"
                    :invalid-text="validationState.passwordInvalidText"
                    class="input-form"
                >
                    <template #default="{invalid}">
                        <p-text-input v-model="formState.password" type="password"
                                      class="text-input"
                                      :invalid="invalid"
                        />
                    </template>
                </p-field-group>
                <p-field-group
                    :label="$t('COMMON.PROFILE.PASSWORD_CHECK')"
                    :invalid="!validationState.isPasswordCheckValid"
                    :invalid-text="validationState.passwordCheckInvalidText"
                    class="input-form"
                >
                    <template #default="{invalid}">
                        <p-text-input v-model="formState.passwordCheck" type="password"
                                      class="text-input"
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

import PButtonModal from '@/components/organisms/modals/button-modal/PButtonModal.vue';
import PSelectDropdown from '@/components/organisms/dropdown/select-dropdown/PSelectDropdown.vue';
import PFieldGroup from '@/components/molecules/forms/field-group/PFieldGroup.vue';
import PButton from '@/components/atoms/buttons/PButton.vue';
import PTextInput from '@/components/atoms/inputs/PTextInput.vue';

import { makeProxy } from '@/lib/compostion-util';
import { SpaceConnector } from '@/lib/space-connector';
import { store } from '@/store';
import PI from '@/components/atoms/icons/PI.vue';

interface AuthType {
    label: string | null;
    user_type: string;
    backend: string;
}
type AuthTypeList = AuthType[];

export default {
    name: 'PUserForm',
    components: {
        PI,
        PButtonModal,
        PFieldGroup,
        PTextInput,
        PSelectDropdown,
        PButton,
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
    },
    setup(props, { emit }) {
        const vm = getCurrentInstance() as ComponentRenderProxy;

        const state = reactive({
            proxyVisible: makeProxy('visible', props, emit),
        });
        const formState = reactive({
            authTypeList: [
                {
                    label: 'Local',
                    user_type: 'USER',
                    backend: 'LOCAL',
                }, {
                    label: 'Api Only',
                    user_type: 'API_USER',
                    backend: 'LOCAL',
                },
            ] as AuthTypeList,
            selectedAuthType: {} as AuthType,
            user_id: '',
            name: '',
            email: '',
            domainRole: '',
            domainRoleItem: [
                { type: 'item', label: 'Not select role', name: '' },
                { type: 'item', label: 'Domain Admin', name: '' },
            ],
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

        const selectAuthType = (item) => {
            formState.selectedAuthType = item;
        };

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

        watch(() => formState.selectedAuthType, (after) => {
            if (after && !props.updateMode) {
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
                console.error(e);
            }
        };

        const checkUserID = async () => {
            validationState.isUserIdValid = undefined;
            validationState.userIdInvalidText = '';

            if (formState.user_id) {
                if (formState.user_id.replace(/ /g, '').length !== formState.user_id.length) {
                    validationState.isUserIdValid = false;
                    validationState.userIdInvalidText = vm.$t('IDENTITY.USER.FORM.EMPTY_SPACE_INVALID');
                    return;
                }
                if (formState.selectedAuthType.backend === 'EXTERNAL') {
                    await checkOauth();
                }
                await checkDuplicatedId();
                if (typeof validationState.isUserIdValid !== 'boolean') validationState.isUserIdValid = true;
            } else {
                validationState.isUserIdValid = false;
                validationState.userIdInvalidText = vm.$t('IDENTITY.USER.FORM.REQUIRED_FIELD');
            }
        };

        // TODO: Email 정규식 넣기
        // const checkEmail = async () => {
        //     if (!formState.email) {
        //         validationState.isEmailValid = false;
        //         validationState.emailInvalidText = vm.$t('IDENTITY.USER.FORM.REQUIRED_FIELD');
        //     } else {
        //         validationState.isEmailValid = true;
        //         validationState.emailInvalidText = '';
        //     }
        // };

        const checkPassword = async () => {
            // password1
            if (!formState.password) {
                validationState.isPasswordValid = false;
                validationState.passwordInvalidText = vm.$t('IDENTITY.USER.FORM.REQUIRED_FIELD');
            } else if (formState.password.replace(/ /g, '').length !== formState.password.length) {
                validationState.isPasswordValid = false;
                validationState.passwordInvalidText = vm.$t('IDENTITY.USER.FORM.EMPTY_SPACE_INVALID');
            } else if (formState.password && formState.password.length < 5) {
                validationState.isPasswordValid = false;
                validationState.passwordInvalidText = vm.$t('IDENTITY.USER.FORM.MIN_LENGTH_INVALID', { min: 5 });
            } else if (formState.password.length > 12) {
                validationState.isPasswordValid = false;
                validationState.passwordInvalidText = vm.$t('IDENTITY.USER.FORM.MAX_LENGTH_INVALID', { max: 12 });
            } else {
                validationState.isPasswordValid = true;
                validationState.passwordInvalidText = '';
            }

            // password2
            if (!formState.passwordCheck) {
                validationState.isPasswordValid = false;
                validationState.passwordInvalidText = vm.$t('IDENTITY.USER.FORM.REQUIRED_FIELD');
            }
            if (formState.password !== formState.passwordCheck) {
                validationState.isPasswordCheckValid = false;
                validationState.passwordCheckInvalidText = vm.$t('IDENTITY.USER.FORM.PASSWORD_CHECK_INVALID');
            } else {
                validationState.isPasswordCheckValid = true;
                validationState.passwordCheckInvalidText = '';
            }
        };

        const confirm = async () => {
            if (!props.updateMode) {
                await checkUserID();
                if (!validationState.isUserIdValid) {
                    return;
                }
            }
            if (formState.selectedAuthType.label === 'Local') {
                await checkPassword();
                if (!(validationState.isPasswordValid && validationState.isPasswordCheckValid)) return;
            }
            const data = {
                user_id: formState.user_id,
                name: formState.name,
                email: formState.email,
                backend: formState.selectedAuthType.backend,
                user_type: formState.selectedAuthType.user_type,
                password: formState.password || '',
            };
            emit('confirm', data);
        };

        const init = () => {
            if (props.updateMode) {
                console.log(props.item)
                formState.user_id = props.item.user_id;
                formState.name = props.item.name;
                formState.email = props.item.email;
                console.log(formState);
            }
            if (store.state.domain.extendedAuthType !== undefined) {
                formState.authTypeList.splice(0, 0, {
                    label: computed(() => store.getters['domain/extendedAuthTypeLabel']).value,
                    user_type: 'USER',
                    backend: 'EXTERNAL',
                });
            }
            formState.selectedAuthType = formState.authTypeList[0];
        };
        init();

        return {
            ...toRefs(state),
            formState,
            validationState,
            selectAuthType,
            confirm,
            checkUserID,
        };
    },
};
</script>

<style lang="postcss">
.user-form-modal {
    .auth-type-list {
        display: flex;
        justify-content: space-between;
        margin-bottom: 1.5rem;
        .auth-type-item {
            @apply bg-gray-100 cursor-pointer text-gray-500;
            display: flex;
            place-content: center;
            width: 33%;
            height: 3.25rem;
            border-radius: 0.125rem;
            .auth-type-label {
                @apply font-bold text-center;
                align-self: center;
                font-size: 0.875rem;
                line-height: 140%;
            }
            &:hover {
                @apply bg-blue-100 text-indigo-400;
            }
            &.selected {
                @apply bg-primary1 text-white;
            }
        }
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
