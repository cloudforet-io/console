<template>
    <section class="account-wrapper">
        <p-breadcrumbs v-if="isAdmin" :routes="routeState.adminRoutes" />
        <p-breadcrumbs v-else :routes="routeState.userRoutes" />
        <p-page-title :title="$t('IDENTITY.USER.ACCOUNT.ACCOUNT_N_PROFILE')" />
        <p-pane-layout class="form-wrapper">
            <p class="form-title">
                {{ $t('IDENTITY.USER.ACCOUNT.BASE_INFORMATION') }}
            </p>
            <p-field-group required :label="$t('COMMON.PROFILE.ID')" class="input-form">
                <p-text-input v-model="userId" disabled class="text-input" />
            </p-field-group>
            <p-field-group required :label="$t('COMMON.PROFILE.NAME')" class="input-form">
                <p-text-input v-model="userName" class="text-input" />
            </p-field-group>
            <p-field-group required :label="$t('COMMON.PROFILE.ROLE')" class="input-form">
                <p-text-input v-model="userRole" disabled class="text-input" />
            </p-field-group>
            <p-field-group required :label="$t('COMMON.PROFILE.EMAIL')"
                           :invalid="validationState.isEmailValid === false"
                           :invalid-text="validationState.emailInvalidText"
                           class="input-form"
            >
                <template #default="{invalid}">
                    <p-text-input v-model="email"
                                  class="text-input"
                                  :invalid="invalid"
                    />
                </template>
            </p-field-group>
            <p-field-group required :label="$t('COMMON.PROFILE.TIMEZONE')" class="input-form"
                           :invalid="validationState.showValidation && !!validationState.timezoneInvalidText"
                           :invalid-text="validationState.timezoneInvalidText"
            >
                <template #default="{invalid}">
                    <p-autocomplete-search v-model="timezone" :menu="timezones"
                                           disable-icon
                                           :placeholder="$t('COMMON.PROFILE.TIMEZONE')"
                                           exact-mode
                                           :class="{invalid}"
                    />
                </template>
            </p-field-group>
            <p-field-group required :label="$t('COMMON.PROFILE.LANGUAGE')" class="input-form">
                <p-select-dropdown v-model="language"
                                   :items="languages"
                />
            </p-field-group>
            <div class="save-btn">
                <p-button style-type="primary-dark" @click="onClickProfileConfirm">
                    {{ $t('IDENTITY.USER.ACCOUNT.SAVE_CHANGES') }}
                </p-button>
            </div>
        </p-pane-layout>
        <div v-if="userType == 'LOCAL'">
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
                            <p-text-input v-model="password" type="password"
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
                            <p-text-input v-model="passwordCheck" type="password"
                                          class="text-input"
                                          :invalid="invalid"
                            />
                        </template>
                    </p-field-group>
                </form>
                <div class="save-btn">
                    <p-button style-type="primary-dark" @click="onClickPasswordConfirm">
                        {{ $t('IDENTITY.USER.ACCOUNT.SAVE_CHANGES') }}
                    </p-button>
                </div>
            </p-pane-layout>
        </div>
    </section>
</template>

<script lang="ts">
import {
    ComponentRenderProxy, computed, getCurrentInstance, reactive, toRefs,
} from '@vue/composition-api';

import {
    PPaneLayout, PButton, PBreadcrumbs, PFieldGroup, PTextInput, PSelectDropdown, PPageTitle, PAutocompleteSearch,
} from '@spaceone/design-system';

import { map } from 'lodash';
import { languages, timezoneList } from '@/store/modules/user/config';
import { LanguageCode, UpdateUserRequest } from '@/store/modules/user/type';
import { TranslateResult } from 'vue-i18n';
import { store } from '@/store';
import { showErrorMessage, showSuccessMessage } from '@/lib/helper/notice-alert-helper';

export default {
    name: 'UserAccountPage',
    components: {
        PPageTitle,
        PBreadcrumbs,
        PButton,
        PSelectDropdown,
        PTextInput,
        PFieldGroup,
        PPaneLayout,
        PAutocompleteSearch,
    },
    props: {
        role: {
            type: String,
            default: '',
        },
    },
    setup(props, { context, root, emit }) {
        const vm = getCurrentInstance() as ComponentRenderProxy;

        const state = reactive({
            userId: computed(() => store.state.user.userId),
            userName: '' as string | undefined,
            isAdmin: computed(() => store.getters['user/isAdmin']).value,
            userRole: computed(() => {
                const roleArray = store.getters['user/getRoleNames'];
                return roleArray.join(', ');
            }),
            userType: computed(() => store.state.user.backend) as unknown as string,
            language: '' as LanguageCode | undefined,
            timezone: '' as string | undefined,
            formattedTimezone: computed(() => state.timezone.replace(' (default)', '')),
            languages: map(languages, (d, k) => ({
                type: 'item', label: k === 'en' ? `${d} (default)` : d, name: k,
            })),
            timezones: map(timezoneList, d => ({
                type: 'item', label: d === 'UTC' ? `${d} (default)` : d, name: d,
            })),
            email: '',
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
                if (!state.timezone || !timezoneList.includes(state.formattedTimezone)) return vm.$t('IDENTITY.USER.FORM.TIMEZONE_INVALID');
                return '';
            }),
            showValidation: false,
        });
        const routeState = reactive({
            userRoutes: computed(() => ([
                { name: vm.$t('IDENTITY.USER.MAIN.MY_ACCOUNT'), path: '/identity/user/account' },
                { name: vm.$t('IDENTITY.USER.ACCOUNT.ACCOUNT_N_PROFILE') },
            ])),
            adminRoutes: computed(() => ([
                { name: vm.$t('MENU.IDENTITY.IDENTITY'), path: '/identity' },
                { name: vm.$t('MENU.IDENTITY.USER'), path: '/identity/user/user-management' },
                { name: vm.$t('IDENTITY.USER.MAIN.MY_ACCOUNT'), path: '/identity/user/account' },
                { name: vm.$t('IDENTITY.USER.ACCOUNT.ACCOUNT_N_PROFILE') },
            ])),
        });

        const checkEmail = async () => {
            const regex = /\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/;
            if (state.email) {
                if (!regex.test(state.email)) {
                    validationState.isEmailValid = false;
                    validationState.emailInvalidText = vm.$t('IDENTITY.USER.FORM.EMAIL_INVALID');
                } else {
                    validationState.isEmailValid = true;
                    validationState.emailInvalidText = '';
                }
            } else validationState.isEmailValid = true;
        };

        const checkPassword = async (password) => {
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
            if (password !== state.passwordCheck) {
                validationState.isPasswordCheckValid = false;
                validationState.passwordCheckInvalidText = vm.$t('IDENTITY.USER.FORM.PASSWORD_CHECK_INVALID');
            } else {
                validationState.isPasswordCheckValid = true;
                validationState.passwordCheckInvalidText = '';
            }
        };


        const updateUser = async (userParam) => {
            try {
                await store.dispatch('user/setUser', userParam);

                if (userParam.language) {
                    vm.$i18n.locale = userParam.language as string;
                }
                showSuccessMessage(vm.$t('IDENTITY.USER.MAIN.ALT_S_UPDATE_USER'), '', root);
            } catch (e) {
                showErrorMessage(vm.$t('IDENTITY.USER.MAIN.ALT_E_UPDATE_USER'), e, root);
            }
        };

        const onClickProfileConfirm = async () => {
            if (!validationState.showValidation) validationState.showValidation = true;
            await checkEmail();
            if (!validationState.isEmailValid || validationState.timezoneInvalidText) return;

            const userParam: UpdateUserRequest = {
                name: state.userName,
                email: state.email,
                language: state.language,
                timezone: state.formattedTimezone,
            };
            await updateUser(userParam);
        };

        const onClickPasswordConfirm = async () => {
            await checkPassword(state.password);
            if (!(validationState.isPasswordValid && validationState.isPasswordCheckValid)) return;
            const userParam: UpdateUserRequest = {
                password: state.password,
            };
            await updateUser(userParam);
        };

        const getProfile = async (id) => {
            try {
                await store.dispatch('user/getUser', id);
                state.userName = store.state.user.name;
                state.email = store.state.user.email;
                state.language = store.state.user.language;
                state.timezone = store.state.user.timezone;
            } catch (e) {
                console.error(e);
            }
        };

        const init = async () => {
            await getProfile(state.userId);
        };
        init();

        return {
            ...toRefs(state),
            routeState,
            validationState,
            onClickProfileConfirm,
            onClickPasswordConfirm,
        };
    },
};
</script>

<style lang="postcss" scoped>
.account-wrapper {
    @apply mx-auto;
    max-width: 53rem;
}
.form-wrapper {
    padding: 2rem;
    max-width: 53rem;
}
.form-title {
    font-size: 1.375rem;
    line-height: 120%;
    margin-bottom: 2rem;
}
.input-form.p-field-group::v-deep {
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
.p-text-input::v-deep,
.p-select-dropdown::v-deep,
.p-autocomplete-search::v-deep {
    width: 100%;
    max-width: 25rem;
    flex-shrink: 0;
    flex-grow: 1;
}
.p-select-dropdown::v-deep {
    .p-dropdown-button {
        width: 100%;
    }
}
.p-autocomplete-search::v-deep {
    &.invalid .p-search {
        @apply border-alert;
    }
}

.save-btn {
    display: flex;
    justify-content: flex-end;
    margin-top: 2rem;
}

@screen mobile {
    .p-text-input::v-deep,
    .p-select-dropdown::v-deep,
    .p-autocomplete-search::v-deep {
        max-width: unset;
    }
}
</style>
