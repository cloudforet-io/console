<template>
    <section>
        <p-page-title :title="$t('IDENTITY.USER.ACCOUNT.ACCOUNT_N_PROFILE')" />
        <p-pane-layout class="form-wrapper">
            <p class="form-title">
                {{ $t('IDENTITY.USER.ACCOUNT.BASE_INFORMATION') }}
            </p>
            <p-field-group required
                           :label="$t('COMMON.PROFILE.ID')"
                           class="input-form"
            >
                <p-text-input v-model="userId"
                              disabled
                              class="text-input"
                />
            </p-field-group>
            <p-field-group required
                           :label="$t('COMMON.PROFILE.NAME')"
                           class="input-form"
            >
                <p-text-input v-model="formState.userName"
                              class="text-input"
                />
            </p-field-group>
            <p-field-group required
                           :label="$t('COMMON.PROFILE.ROLE')"
                           class="input-form"
            >
                <p-text-input v-model="userRole"
                              disabled
                              class="text-input"
                />
            </p-field-group>
            <p-field-group required
                           :label="$t('COMMON.PROFILE.EMAIL')"
                           :invalid="validationState.isEmailValid === false"
                           :invalid-text="validationState.emailInvalidText"
                           class="input-form"
            >
                <template #default="{invalid}">
                    <p-text-input v-model="formState.email"
                                  class="text-input"
                                  :invalid="invalid"
                    />
                </template>
            </p-field-group>
            <p-field-group required
                           :label="$t('COMMON.PROFILE.TIMEZONE')"
                           class="input-form"
                           :invalid="validationState.showValidation && !!validationState.timezoneInvalidText"
                           :invalid-text="validationState.timezoneInvalidText"
            >
                <template #default="{invalid}">
                    <p-filterable-dropdown :menu="timezones"
                                           :selected.sync="formState.timezone"
                                           :invalid="invalid"
                                           :placeholder="$t('COMMON.PROFILE.TIMEZONE')"
                                           :page-size="10"
                    />
                </template>
            </p-field-group>
            <p-field-group required
                           :label="$t('COMMON.PROFILE.LANGUAGE')"
                           class="input-form"
            >
                <p-select-dropdown v-model="formState.language"
                                   :items="languages"
                />
            </p-field-group>
            <div class="save-button">
                <p-button style-type="primary"
                          @click="onClickProfileConfirm"
                >
                    {{ $t('IDENTITY.USER.ACCOUNT.SAVE_CHANGES') }}
                </p-button>
            </div>
        </p-pane-layout>
        <div v-if="userType === 'LOCAL'">
            <p-pane-layout class="mt-6 form-wrapper">
                <p class="form-title">
                    {{ $t('IDENTITY.USER.ACCOUNT.CHANGE_PASSWORD') }}
                </p>
                <form class="form">
                    <p-field-group
                        :label="$t('COMMON.PROFILE.PASSWORD')"
                        required
                        :invalid="validationState.isPasswordValid === false"
                        :invalid-text="validationState.passwordInvalidText"
                        class="input-form"
                    >
                        <template #default="{invalid}">
                            <p-text-input v-model="formState.password"
                                          type="password"
                                          class="text-input"
                                          :invalid="invalid"
                            />
                        </template>
                    </p-field-group>
                    <p-field-group
                        :label="$t('COMMON.PROFILE.PASSWORD_CHECK')"
                        required
                        :invalid="validationState.isPasswordCheckValid === false"
                        :invalid-text="validationState.passwordCheckInvalidText"
                        class="input-form"
                    >
                        <template #default="{invalid}">
                            <p-text-input v-model="formState.passwordCheck"
                                          type="password"
                                          class="text-input"
                                          :invalid="invalid"
                            />
                        </template>
                    </p-field-group>
                </form>
                <div class="save-button">
                    <p-button style-type="primary"
                              @click="onClickPasswordConfirm"
                    >
                        {{ $t('IDENTITY.USER.ACCOUNT.SAVE_CHANGES') }}
                    </p-button>
                </div>
            </p-pane-layout>
        </div>
    </section>
</template>

<script lang="ts">

import {
    computed, reactive, toRefs, watch,
} from 'vue';
import type { TranslateResult } from 'vue-i18n';

import {
    PPaneLayout, PButton, PFieldGroup, PTextInput, PSelectDropdown, PPageTitle, PFilterableDropdown,
} from '@spaceone/design-system';
import type { MenuItem } from '@spaceone/design-system/types/inputs/context-menu/type';
import type { FilterableDropdownMenuItem } from '@spaceone/design-system/types/inputs/dropdown/filterable-dropdown/type';
import { map } from 'lodash';

import { store } from '@/store';
import { i18n } from '@/translations';

import { languages, timezoneList } from '@/store/modules/user/config';
import type { LanguageCode, UpdateUserRequest } from '@/store/modules/user/type';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { getPasswordValidationInfo } from '@/services/auth/lib/helper';

export default {
    name: 'UserAccountPage',
    components: {
        PPageTitle,
        PButton,
        PSelectDropdown,
        PTextInput,
        PFieldGroup,
        PPaneLayout,
        PFilterableDropdown,
    },
    props: {
        role: {
            type: String,
            default: '',
        },
    },
    setup() {
        const state = reactive({
            userId: computed(() => store.state.user.userId),
            userRole: computed(() => {
                const roleArray = store.getters['user/roleNames'];
                return roleArray.join(', ');
            }),
            userType: computed(() => store.state.user.backend) as unknown as string,
            languages: map(languages, (d, k) => ({
                type: 'item', label: k === 'en' ? `${d} (default)` : d, name: k,
            })) as MenuItem[],
            timezones: map(timezoneList, (d) => ({
                type: 'item', label: d === 'UTC' ? `${d} (default)` : d, name: d,
            })) as FilterableDropdownMenuItem[],
        });

        const formState = reactive({
            userName: '' as string | undefined,
            email: '',
            timezone: [] as FilterableDropdownMenuItem[],
            language: '' as LanguageCode | undefined,
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
            timezoneInvalidText: computed(() => {
                if (!formState.timezone.length) return i18n.t('IDENTITY.USER.FORM.TIMEZONE_INVALID');
                return '';
            }),
            showValidation: false,
        });

        const checkEmail = async () => {
            const regex = /\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/;
            if (formState.email) {
                if (!regex.test(formState.email)) {
                    validationState.isEmailValid = false;
                    validationState.emailInvalidText = i18n.t('IDENTITY.USER.FORM.EMAIL_INVALID');
                } else {
                    validationState.isEmailValid = true;
                    validationState.emailInvalidText = '';
                }
            } else validationState.isEmailValid = true;
        };

        const checkPassword = async (password) => {
            // password1
            const { isValid, invalidText } = getPasswordValidationInfo(password);
            validationState.isPasswordValid = isValid;
            validationState.passwordInvalidText = invalidText;

            // password2
            if (password !== formState.passwordCheck) {
                validationState.isPasswordCheckValid = false;
                validationState.passwordCheckInvalidText = i18n.t('IDENTITY.USER.FORM.PASSWORD_CHECK_INVALID');
            } else {
                validationState.isPasswordCheckValid = true;
                validationState.passwordCheckInvalidText = '';
            }
        };

        const updateUser = async (userParam) => {
            try {
                await store.dispatch('user/setUser', userParam);
                showSuccessMessage(i18n.t('IDENTITY.USER.MAIN.ALT_S_UPDATE_USER'), '');
            } catch (e) {
                ErrorHandler.handleRequestError(e, i18n.t('IDENTITY.USER.MAIN.ALT_E_UPDATE_USER'));
            }
        };

        const onClickProfileConfirm = async () => {
            if (!validationState.showValidation) validationState.showValidation = true;
            await checkEmail();
            if (!validationState.isEmailValid || validationState.timezoneInvalidText) return;

            const userParam: UpdateUserRequest = {
                name: formState.userName,
                email: formState.email,
                language: formState.language,
                timezone: formState.timezone[0].name,
            };
            await updateUser(userParam);
        };

        const resetPasswordForm = () => {
            formState.password = '';
            formState.passwordCheck = '';
        };

        const onClickPasswordConfirm = async () => {
            await checkPassword(formState.password);
            if (!(validationState.isPasswordValid && validationState.isPasswordCheckValid)) {
                resetPasswordForm();
                return;
            }
            const userParam: UpdateUserRequest = {
                password: formState.password,
            };
            await updateUser(userParam);
            resetPasswordForm();
        };

        const getProfile = async () => {
            try {
                formState.userName = store.state.user.name;
                formState.email = store.state.user.email;
                formState.language = store.state.user.language;
                formState.timezone = state.timezones.filter((d) => d.name === store.state.user.timezone);
            } catch (e) {
                ErrorHandler.handleError(e);
            }
        };

        watch(() => store.state.user.language, (language) => {
            if (language !== formState.language) {
                formState.language = language;
            }
        });

        const init = async () => {
            await getProfile();
        };
        init();

        return {
            ...toRefs(state),
            validationState,
            formState,
            onClickProfileConfirm,
            onClickPasswordConfirm,
        };
    },
};
</script>

<style lang="postcss" scoped>
.form-wrapper {
    padding: 2rem;
}
.form-title {
    font-size: 1.375rem;
    line-height: 120%;
    margin-bottom: 2rem;
}

/* custom design-system component - p-field-group */
:deep(.input-form.p-field-group) {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    max-width: 33.5rem;
    .form-label {
        margin-right: 1rem;
    }
    .invalid-feedback {
        margin-left: 8.5rem;
    }
}
.p-text-input,
.p-select-dropdown,
.p-filterable-dropdown {
    width: 100%;
    max-width: 25rem;
    flex-shrink: 0;
    flex-grow: 1;
}

.save-button {
    display: flex;
    margin-top: 2rem;
}

@screen mobile {
    .p-text-input,
    .p-select-dropdown,
    .p-filterable-dropdown {
        max-width: unset;
    }
}
</style>
