<template>
    <div class="user-account-page">
        <p-page-navigation v-if="isAdmin" :routes="routeState.adminRoutes" />
        <p-page-navigation v-else :routes="routeState.userRoutes" />
        <p-page-title :title="$t('IDENTITY.USER.MAIN.ACCOUNT_N_PROFILE')" />
        <p-pane-layout class="form-wrapper">
            <p class="form-title">
                {{ $t('IDENTITY.USER.MAIN.BASE_INFORMATION') }}
            </p>
            <p-field-group :label="'ID'" class="input-form">
                <p-text-input v-model="userId" disabled class="text-input" />
            </p-field-group>
            <p-field-group :label="'Role'" class="input-form">
                <p-text-input v-model="userRole" disabled class="text-input" />
            </p-field-group>
            <p-field-group :label="$t('COMMON.PROFILE.EMAIL')"
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
            <p-field-group :label="$t('COMMON.PROFILE.TIMEZONE')" class="input-form">
                <p-select-dropdown v-model="timezone"
                                   :items="timezones"
                                   auto-height
                                   class="dropdown"
                />
            </p-field-group>
            <p-field-group :label="$t('COMMON.PROFILE.LANGUAGE')" class="input-form">
                <p-select-dropdown v-model="language"
                                   :items="languages"
                                   auto-height
                                   class="dropdown"
                />
            </p-field-group>
            <div class="save-btn">
                <p-button style-type="primary-dark" @click="onClickProfileConfirm">
                    {{ $t('IDENTITY.USER.MAIN.SAVE_CHANGES') }}
                </p-button>
            </div>
        </p-pane-layout>
        <div v-if="userType == 'LOCAL'">
            <p-pane-layout class="mt-6 form-wrapper">
                <p class="form-title">
                    {{ $t('IDENTITY.USER.MAIN.CHANGE_PASSWORD') }}
                </p>
                <form class="form">
                    <p-field-group
                        :label="$t('COMMON.PROFILE.PASSWORD')"
                        :required="true"
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
                        :required="true"
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
                        {{ $t('IDENTITY.USER.MAIN.SAVE_CHANGES') }}
                    </p-button>
                </div>
            </p-pane-layout>
        </div>
    </div>
</template>

<script lang="ts">
import PPaneLayout from '@/components/molecules/layouts/pane-layout/PPaneLayout.vue';
import PFieldGroup from '@/components/molecules/forms/field-group/PFieldGroup.vue';
import PTextInput from '@/components/atoms/inputs/PTextInput.vue';
import PSelectDropdown from '@/components/organisms/dropdown/select-dropdown/PSelectDropdown.vue';

import {
    ComponentRenderProxy, computed, getCurrentInstance, reactive, toRefs,
} from '@vue/composition-api';
import { map } from 'lodash';
import { languages } from '@/store/modules/user/config';
import { LanguageCode, Timezone, UpdateUserRequest } from '@/store/modules/user/type';
import { TranslateResult } from 'vue-i18n';
import PButton from '@/components/atoms/buttons/PButton.vue';
import { store } from '@/store';
import { showErrorMessage, showSuccessMessage } from '@/lib/util';
import PPageNavigation from '@/components/molecules/page-navigation/PPageNavigation.vue';
import PPageTitle from '@/components/organisms/title/page-title/PPageTitle.vue';

export default {
    name: 'UserAccountPage',
    components: {
        PPageTitle,
        PPageNavigation,
        PButton,
        PSelectDropdown,
        PTextInput,
        PFieldGroup,
        PPaneLayout,
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
            isAdmin: computed(() => store.getters['user/isAdmin']).value,
            userRole: computed(() => {
                const roleArray = store.getters['user/getRoleNames'];
                return roleArray.join(', ');
            }),
            userType: computed(() => store.state.user.backend) as unknown as string,
            language: '' as LanguageCode | undefined,
            timezone: '' as Timezone | undefined,
            languages: map(languages, (d, k) => ({
                type: 'item', label: d === 'en' ? `${d} (default)` : d, name: k,
            })),
            timezones: [
                { type: 'item', label: 'UTC (default)', name: 'UTC' },
                { type: 'item', label: 'Asia/Seoul', name: 'Asia/Seoul' },
                { type: 'item', label: 'Asia/Tokyo', name: 'Asia/Tokyo' },
            ],
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
        });
        const routeState = reactive({
            userRoutes: computed(() => ([
                { name: vm.$t('IDENTITY.USER.MAIN.MY_ACCOUNT'), path: '/identity/user/account' },
                { name: vm.$t('IDENTITY.USER.MAIN.ACCOUNT_N_PROFILE'), path: '/identity/user/account' },
            ])),
            adminRoutes: computed(() => ([
                { name: vm.$t('MENU.IDENTITY.IDENTITY'), path: '/identity' },
                { name: vm.$t('MENU.IDENTITY.USER'), path: '/identity/user/user-management' },
                { name: vm.$t('IDENTITY.USER.MAIN.MY_ACCOUNT'), path: '/identity/user/account' },
                { name: vm.$t('IDENTITY.USER.MAIN.ACCOUNT_N_PROFILE'), path: '/identity/user/account' },
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
            console.log(userParam);
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
            await checkEmail();
            if (!validationState.isEmailValid) return;

            const userParam: UpdateUserRequest = {
                email: state.email,
                language: state.language,
                timezone: state.timezone,
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
.user-account-page {
    @apply mx-auto;
    max-width: 53rem;
}
.form-wrapper {
    padding: 2rem;
    max-width: 53rem;
    max-height: 30.75rem;
}
.form-title {
    font-size: 1.375rem;
    line-height: 120%;
    margin-bottom: 2rem;
}
.input-form {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    max-width: 33.5rem;
    .text-input {
        width: 25rem;
    }
    >>> .invalid-feedback {
        margin-left: 8.5rem;
    }
    .p-select-dropdown::v-deep {
        width: 25rem;
    }
}

.save-btn {
    display: flex;
    justify-content: flex-end;
    margin-top: 2rem;
}
</style>
