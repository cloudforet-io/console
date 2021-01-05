<template>
    <p-button-modal :header-title="$t('COMMON.PROFILE.TITLE')"
                    centered
                    fade
                    backdrop
                    scrollable
                    size="xl"
                    :footer-cancel-button-bind="{
                        styleType: 'gray900',
                        outline: true,
                    }"
                    :footer-confirm-button-bind="{
                        styleType: 'primary-dark',
                    }"
                    :visible.sync="proxyVisible"
                    :loading="loading"
                    @confirm="onClickConfirm"
    >
        <template #body>
            <div class="profile-form grid grid-cols-2">
                <div class="form-div col-span-1">
                    <p-field-group :label="$t('COMMON.PROFILE.ID')">
                        <br>
                        <p-text-input :value="userId" disabled block />
                    </p-field-group>
                    <p-field-group :label="$t('COMMON.PROFILE.EMAIL')"
                                   :invalid="validationState.isEmailValid === false"
                                   :invalid-text="validationState.emailInvalidText"
                    >
                        <template #default="{invalid}">
                            <p-text-input v-model="formState.email"
                                          class="w-full"
                                          :invalid="invalid"
                            />
                        </template>
                    </p-field-group>
                    <p-field-group :label="$t('COMMON.PROFILE.NAME')"
                                   :invalid="validationState.isNameValid === false"
                                   :invalid-text="validationState.nameInvalidText"
                    >
                        <template #default="{invalid}">
                            <p-text-input v-model="formState.name" block
                                          class="w-full"
                                          :invalid="invalid"
                            />
                        </template>
                    </p-field-group>
                    <form class="form">
                        <p-field-group v-if="showPassword"
                                       :label="$t('COMMON.PROFILE.PASSWORD')"
                                       :invalid="validationState.isPasswordValid === false"
                                       :invalid-text="validationState.passwordInvalidText"
                        >
                            <template #default="{invalid}">
                                <p-text-input v-model="formState.password" block type="password"
                                              class="w-full"
                                              :invalid="invalid"
                                />
                            </template>
                        </p-field-group>
                        <p-field-group v-if="showPassword"
                                       :label="$t('COMMON.PROFILE.PASSWORD_CHECK')"
                                       :invalid="validationState.isPasswordCheckValid === false"
                                       :invalid-text="validationState.passwordCheckInvalidText"
                        >
                            <template #default="{invalid}">
                                <p-text-input v-model="formState.passwordCheck" block type="password"
                                              class="w-full"
                                              :invalid="invalid"
                                />
                            </template>
                        </p-field-group>
                    </form>
                </div>
                <div class="form-div col-span-1">
                    <p-field-group :label="$t('COMMON.PROFILE.MOBILE')">
                        <br>
                        <p-text-input v-model="formState.mobile"
                                      block
                        />
                    </p-field-group>
                    <p-field-group :label="$t('COMMON.PROFILE.GROUP')">
                        <br>
                        <p-text-input v-model="formState.group"
                                      block
                        />
                    </p-field-group>
                    <p-field-group :label="$t('COMMON.PROFILE.LANGUAGE')">
                        <p-select-dropdown v-model="formState.language"
                                           :items="languages"
                                           auto-height
                        />
                    </p-field-group>
                    <p-field-group :label="$t('COMMON.PROFILE.TIMEZONE')">
                        <p-select-dropdown v-model="formState.timezone"
                                           :items="timezones"
                                           auto-height
                        />
                    </p-field-group>
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

import {
    PButtonModal, PFieldGroup, PTextInput, PSelectDropdown,
} from '@spaceone/design-system';

import { makeProxy } from '@/lib/compostion-util';
import { showErrorMessage, showSuccessMessage } from '@/lib/util';
import { UpdateUserRequest, LanguageCode, Timezone } from '@/store/modules/user/type';
import { store } from '@/store';
import { map } from 'lodash';
import { languages } from '@/store/modules/user/config';

export default {
    name: 'ProfileModalTemplate',
    components: {
        PSelectDropdown,
        PButtonModal,
        PFieldGroup,
        PTextInput,
    },
    props: {
        visible: {
            type: Boolean,
            required: true,
        },
        userId: {
            type: String,
            required: true,
        },
    },
    setup(props, { root, emit }) {
        const vm = getCurrentInstance() as ComponentRenderProxy;

        const state = reactive({
            loading: false,
            proxyVisible: makeProxy('visible', props, emit),
            showPassword: computed(() => state.isDomainOwner),
            languages: map(languages, (d, k) => ({
                type: 'item', label: d === 'en' ? `${d} (default)` : d, name: k,
            })),
            timezones: [
                { type: 'item', label: 'UTC (default)', name: 'UTC' },
                { type: 'item', label: 'Asia/Seoul', name: 'Asia/Seoul' },
                { type: 'item', label: 'Asia/Tokyo', name: 'Asia/Tokyo' },
            ],
            // isInternalAuth: computed(() => store.getters['domain/isInternalAuth']),
            isDomainOwner: computed(() => store.getters['user/isDomainOwner']),
        });
        const formState = reactive({
            password: '',
            passwordCheck: '',
            name: '' as string | undefined,
            email: '' as string | undefined,
            mobile: '' as string | undefined,
            group: '' as string | undefined,
            language: '' as LanguageCode | undefined,
            timezone: '' as Timezone | undefined,
        });
        const validationState = reactive({
            isNameValid: undefined as undefined | boolean,
            nameInvalidText: '' as TranslateResult | string,
            isEmailValid: undefined as undefined | boolean,
            emailInvalidText: '' as TranslateResult | string,
            //
            isPasswordValid: undefined as undefined | boolean,
            passwordInvalidText: '' as TranslateResult | string,
            isPasswordCheckValid: undefined as undefined | boolean,
            passwordCheckInvalidText: '' as TranslateResult | string,
        });

        /* util */
        const checkName = () => {
            if (!formState.name) {
                validationState.isNameValid = false;
                validationState.nameInvalidText = vm.$t('IDENTITY.USER.FORM.REQUIRED_FIELD');
            } else {
                validationState.isNameValid = true;
                validationState.nameInvalidText = '';
            }
        };
        const checkEmail = () => {
            if (!formState.email) {
                validationState.isEmailValid = false;
                validationState.emailInvalidText = vm.$t('IDENTITY.USER.FORM.REQUIRED_FIELD');
            } else {
                validationState.isEmailValid = true;
                validationState.emailInvalidText = '';
            }
        };
        const checkPassword = () => {
            // password1
            if (formState.password.replace(/ /g, '').length !== formState.password.length) {
                validationState.isPasswordValid = false;
                validationState.passwordInvalidText = vm.$t('IDENTITY.USER.FORM.EMPTY_SPACE_INVALID');
            } else if (formState.password && formState.password.length < 5) {
                validationState.isPasswordValid = false;
                validationState.passwordInvalidText = vm.$t('IDENTITY.USER.FORM.MIN_LENGTH_INVALID', { min: 5 });
            } else {
                validationState.isPasswordValid = true;
                validationState.passwordInvalidText = '';
            }

            // password2
            if (formState.password !== formState.passwordCheck) {
                validationState.isPasswordCheckValid = false;
                validationState.passwordCheckInvalidText = vm.$t('IDENTITY.USER.FORM.PASSWORD_CHECK_INVALID');
            } else {
                validationState.isPasswordCheckValid = true;
                validationState.passwordCheckInvalidText = '';
            }
        };

        /* api */
        const getProfile = async (id) => {
            try {
                await store.dispatch('user/getUser', id);
                formState.name = store.state.user.name;
                formState.email = store.state.user.email;
                // formState.mobile = store.state.user.mobile;
                // formState.group = store.state.user.group;
                formState.language = store.state.user.language;
                formState.timezone = store.state.user.timezone;
            } catch (e) {
                console.error(e);
            }
        };
        const updateProfile = async (parameters) => {
            try {
                await store.dispatch('user/setUser', parameters);
                showSuccessMessage(vm.$t('COMMON.PROFILE.ALT_S_UPDATE'), '', root);
                state.proxyVisible = false;
            } catch (e) {
                showErrorMessage(vm.$t('COMMON.PROFILE.ALT_E_UPDATE'), e, root);
            }
        };

        const onClickConfirm = async () => {
            // check validation
            checkName();
            checkEmail();
            if (state.showPassword) checkPassword();
            if (!validationState.isNameValid || !validationState.isEmailValid) {
                return;
            }
            if (state.showPassword && !(validationState.isPasswordValid && validationState.isPasswordCheckValid)) {
                return;
            }

            // update profile
            const userParam: UpdateUserRequest = {
                password: formState.password,
                name: formState.name,
                email: formState.email,
                // mobile: formState.mobile,
                // group: formState.group,
                language: formState.language,
                timezone: formState.timezone,
            };
            if (state.showPassword) {
                userParam.password = formState.password;
            }
            await updateProfile(userParam);
        };

        const init = () => {
            getProfile(props.userId);
        };
        init();

        return {
            ...toRefs(state),
            formState,
            validationState,
            onClickConfirm,
        };
    },
};
</script>

<style lang="postcss" scoped>
.profile-form {
    text-align: left;
    .form-div {
        padding: 0 1rem;
    }
    .dropdown {
        text-align: left;
    }
}
</style>
