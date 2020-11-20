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
            <div class="user-input-wrapper">
                <div class="top-part">
                    <p-field-group :label="$t('IDENTITY.USER.FORM.USER_ID')"
                                   :required="true"
                                   :invalid="!validationState.isUserIdValid"
                                   :invalid-text="validationState.userIdInvalidText"
                                   :valid="validationState.isUserIdValid"
                                   :valid-text="validationState.userIdValidText"
                    >
                        <template #default="{invalid}">
                            <div>
                                <p-text-input v-model="formState.user_id"
                                              v-focus
                                              :placeholder="$t('IDENTITY.USER.FORM.NAME_PLACEHOLDER')"
                                              :disabled="updateMode"
                                              :class="{'is-invalid': invalid}"
                                />
                                <p-button style-type="primary-dark" :disabled="updateMode" class="user-id-check-button"
                                          @click="checkUserID"
                                >
                                    {{ $t('IDENTITY.USER.FORM.CHECK_USER_ID') }}
                                </p-button>
                            </div>
                        </template>
                    </p-field-group>
                </div>
                <p-hr class="p-divider" />
                <div class="bottom-part">
                    <div class="bottom-left-part">
                        <p-field-group v-if="isInternalAuth"
                                       :label="$t('IDENTITY.USER.FORM.PASSWORD')"
                                       :invalid="!validationState.isPasswordValid"
                                       :invalid-text="validationState.passwordInvalidText"
                                       :required="true"
                                       :help-text="$t('IDENTITY.USER.FORM.PASSWORD_HELP_TEXT')"
                        >
                            <template v-slot:default="{invalid}">
                                <p-text-input v-model="formState.password"
                                              type="password"
                                              class="block"
                                              :class="{'is-invalid':invalid}"
                                />
                            </template>
                        </p-field-group>

                        <p-field-group :label="$t('IDENTITY.USER.FORM.NAME')">
                            <p-text-input v-model="formState.name" class="block" />
                        </p-field-group>

                        <p-field-group :label="$t('IDENTITY.USER.FORM.MOBILE')">
                            <p-text-input v-model="formState.mobile" class="block" />
                        </p-field-group>

                        <p-field-group :label="$t('IDENTITY.USER.FORM.LANGUAGE')">
                            <p-select-dropdown v-model="formState.language" :items="languages" />
                        </p-field-group>

                        <p-field-group :label="$t('IDENTITY.USER.FORM.TIMEZONE')">
                            <p-select-dropdown v-model="formState.timezone" :items="timezones" />
                        </p-field-group>
                    </div>
                    <div class="bottom-right-part">
                        <p-field-group v-if="isInternalAuth"
                                       :label="$t('IDENTITY.USER.FORM.PASSWORD_CHECK')"
                                       :invalid="!validationState.isPasswordCheckValid"
                                       :invalid-text="validationState.passwordCheckInvalidText"
                                       :required="true"
                        >
                            <template v-slot:default="{invalid}">
                                <p-text-input v-model="formState.passwordCheck"
                                              type="password"
                                              class="block"
                                              :class="{'is-invalid':invalid}"
                                />
                            </template>
                        </p-field-group>

                        <p-field-group :label="$t('IDENTITY.USER.FORM.EMAIL')">
                            <p-text-input v-model="formState.email" class="block" />
                        </p-field-group>

                        <p-field-group :label="$t('IDENTITY.USER.FORM.GROUP')">
                            <p-text-input v-model="formState.group" class="block" />
                        </p-field-group>

                        <p-field-group :label="$t('IDENTITY.USER.FORM.TAGS')">
                            <p-dict-input-group ref="tagInputRef"
                                                :dict="formState.tags"
                                                show-validation
                                                class="tag-input"
                            />
                        </p-field-group>
                    </div>
                </div>
            </div>
        </template>
    </p-button-modal>
</template>

<script lang="ts">
/* eslint-disable camelcase */
import { TranslateResult } from 'vue-i18n';

import {
    reactive, toRefs, computed, getCurrentInstance, ComponentRenderProxy,
} from '@vue/composition-api';

import PButtonModal from '@/components/organisms/modals/button-modal/PButtonModal.vue';
import PDictInputGroup from '@/components/organisms/forms/dict-input-group/PDictInputGroup.vue';
import PSelectDropdown from '@/components/organisms/dropdown/select-dropdown/PSelectDropdown.vue';
import PFieldGroup from '@/components/molecules/forms/field-group/PFieldGroup.vue';
import PButton from '@/components/atoms/buttons/PButton.vue';
import PTextInput from '@/components/atoms/inputs/PTextInput.vue';
import PHr from '@/components/atoms/hr/PHr.vue';

import { makeProxy } from '@/lib/compostion-util';
import { SpaceConnector } from '@/lib/space-connector';
import { store } from '@/store';

export default {
    name: 'PUserForm',
    components: {
        PButtonModal,
        PFieldGroup,
        PTextInput,
        PDictInputGroup,
        PHr,
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
            isInternalAuth: computed(() => store.getters['domain/isInternalAuth']),
            tagInputRef: null as any,
            languages: [
                { type: 'item', label: 'English', name: 'en' },
                { type: 'item', label: '한국어', name: 'ko' },
            ],
            timezones: [
                { type: 'item', label: 'UTC', name: 'UTC' },
                { type: 'item', label: 'Asia/Seoul', name: 'Asia/Seoul' },
            ],
        });
        const formState = reactive({
            user_id: '',
            password: '',
            passwordCheck: '',
            name: '',
            email: '',
            mobile: '',
            group: '',
            language: 'en',
            timezone: 'UTC',
            tags: {},
        });
        const validationState = reactive({
            isUserIdValid: undefined as undefined | boolean,
            userIdInvalidText: '' as TranslateResult | string,
            userIdValidText: computed(() => vm.$t('IDENTITY.USER.FORM.NAME_VALID')),
            //
            isPasswordValid: undefined as undefined | boolean,
            passwordInvalidText: '' as TranslateResult | string,
            isPasswordCheckValid: undefined as undefined | boolean,
            passwordCheckInvalidText: '' as TranslateResult | string,
        });

        /* util */
        const checkUserID = async () => {
            validationState.isUserIdValid = undefined;
            validationState.userIdInvalidText = '';

            if (formState.user_id) {
                if (formState.user_id.replace(/ /g, '').length !== formState.user_id.length) {
                    validationState.isUserIdValid = false;
                    validationState.userIdInvalidText = vm.$t('IDENTITY.USER.FORM.EMPTY_SPACE_INVALID');
                    return;
                }
                if (!state.isInternalAuth) {
                    await SpaceConnector.client.identity.user.find({
                        search: { user_id: formState.user_id },
                        domain_id: store.state.domain.domainId,
                    }).catch(() => {
                        validationState.isUserIdValid = false;
                        validationState.userIdInvalidText = vm.$t('IDENTITY.USER.FORM.USER_ID_NOT_EXIST');
                    });
                }
                await SpaceConnector.client.identity.user.get({ user_id: formState.user_id })
                    .then(() => {
                        validationState.isUserIdValid = false;
                        validationState.userIdInvalidText = vm.$t('IDENTITY.USER.FORM.USER_ID_DUPLICATED');
                    })
                    .catch(() => {});
                if (typeof validationState.isUserIdValid !== 'boolean') validationState.isUserIdValid = true;
            } else {
                validationState.isUserIdValid = false;
                validationState.userIdInvalidText = vm.$t('IDENTITY.USER.FORM.REQUIRED_FIELD');
            }
        };
        const checkPassword = () => {
            // password1
            if (!formState.password) {
                validationState.isPasswordValid = false;
                validationState.passwordInvalidText = vm.$t('IDENTITY.USER.FORM.REQUIRED_FIELD');
            } else if (formState.password.replace(/ /g, '').length !== formState.password.length) {
                validationState.isPasswordValid = false;
                validationState.passwordInvalidText = vm.$t('IDENTITY.USER.FORM.EMPTY_SPACE_INVALID');
            } else if (formState.password.length < 5) {
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
                validationState.isPasswordCheckValid = false;
                validationState.passwordCheckInvalidText = vm.$t('IDENTITY.USER.FORM.REQUIRED_FIELD');
            } else if (formState.password !== formState.passwordCheck) {
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

            if (state.isInternalAuth) {
                await checkPassword();
                if (!validationState.isPasswordValid || !validationState.isPasswordCheckValid) {
                    return;
                }
            }

            const data = {} as any;
            if (state.isInternalAuth) {
                if (props.updateMode) {
                    if (formState.password) {
                        data.password = formState.password;
                    }
                } else {
                    data.password = formState.password;
                }
            }
            ['user_id', 'name', 'email', 'mobile', 'group', 'language', 'timezone'].forEach((key) => {
                if (formState[key]) {
                    data[key] = formState[key];
                }
            });
            state.tagInputRef.allValidation();
            data.tags = state.tagInputRef.getDict();
            emit('confirm', data);
        };

        const init = () => {
            if (props.updateMode) {
                formState.user_id = props.item.user_id;
                formState.password = props.item.password1;
                formState.passwordCheck = props.item.password2;
                formState.name = props.item.name;
                formState.email = props.item.email;
                formState.mobile = props.item.mobile;
                formState.group = props.item.group;
                formState.language = props.item.language;
                formState.timezone = props.item.timezone;
                formState.tags = props.item.tags;
            }
        };
        init();

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
    .user-input-wrapper {
        .top-part {
            padding-bottom: 0.25rem;
        }
        .bottom-part {
            padding-bottom: 2rem;
            .bottom-left-part {
                display: inline-grid;
                width: 50%;
            }
            .bottom-right-part {
                display: inline-grid;
                width: 50%;
            }
            .p-field-group {
                width: 100%;
            }
        }
        .p-text-input {
            @apply text-gray-900;
            width: 100%;
            max-width: 19rem;
            appearance: none;
            font-size: 0.875rem;
            line-height: 1.5;
            border-radius: 0.125rem;
            padding-left: 0.5rem;
            padding-right: 0.5rem;
        }
        .p-select-dropdown {
            max-width: 19rem;
            width: 100%;
        }
        .tag-input {
            @apply bg-primary4;
            padding-top: 0.5rem;
            .p-dict-input .input-box {
                width: auto;
            }
        }
        .user-id-check-button {
            margin-left: 0.5rem;
            min-height: 2rem;
        }
        .p-divider {
            margin-bottom: 1.5rem;
            margin-top: .5rem;
        }
    }
}
</style>
