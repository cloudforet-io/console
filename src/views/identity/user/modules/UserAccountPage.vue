<template>
    <div class="user-account-page">
        <p-pane-layout class="form-wrapper">
            <p class="form-title">
                Base Information
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
                    Save Changes
                </p-button>
            </div>
        </p-pane-layout>
        <div v-if="userType === 'LOCAL'">
            <p-pane-layout class="mt-6 form-wrapper">
                <p class="form-title">
                    Change Password
                </p>
                <form class="form">
                    <p-field-group
                        :label="$t('COMMON.PROFILE.PASSWORD')"
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
                        Save Changes
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
import { SpaceConnector } from '@/lib/space-connector';
import { store } from '@/store';
import { showErrorMessage, showSuccessMessage } from '@/lib/util';

export default {
    name: 'UserAccountPage',
    components: {
        PButton,
        PSelectDropdown,
        PTextInput,
        PFieldGroup,
        PPaneLayout,
    },
    props: {
        userId: {
            type: String,
            default: '',
        },
        role: {
            type: String,
            default: '',
        },
        userType: {
            type: String,
            default: '',
        },
        isAdmin: {
            type: Boolean,
            default: false,
        },
    },
    setup(props, { context, root, emit }) {
        const vm = getCurrentInstance() as ComponentRenderProxy;

        const role = props.isAdmin;
        const state = reactive({
            userRole: role ? 'ADMIN' : 'USER',
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

        const checkEmail = async () => {
            if (!state.email) {
                validationState.isEmailValid = false;
                validationState.emailInvalidText = vm.$t('IDENTITY.USER.FORM.REQUIRED_FIELD');
            } else {
                validationState.isEmailValid = true;
                validationState.emailInvalidText = '';
            }
        };

        const checkPassword = async () => {
            // password1
            if (state.password.replace(/ /g, '').length !== state.password.length) {
                validationState.isPasswordValid = false;
                validationState.passwordInvalidText = vm.$t('IDENTITY.USER.FORM.EMPTY_SPACE_INVALID');
            } else if (state.password && state.password.length < 5) {
                validationState.isPasswordValid = false;
                validationState.passwordInvalidText = vm.$t('IDENTITY.USER.FORM.MIN_LENGTH_INVALID', { min: 5 });
            } else if (state.password.length > 12) {
                validationState.isPasswordValid = false;
                validationState.passwordInvalidText = vm.$t('IDENTITY.USER.FORM.MAX_LENGTH_INVALID', { max: 12 });
            } else {
                validationState.isPasswordValid = true;
                validationState.passwordInvalidText = '';
            }

            // password2
            if (state.password !== state.passwordCheck) {
                validationState.isPasswordCheckValid = false;
                validationState.passwordCheckInvalidText = vm.$t('IDENTITY.USER.FORM.PASSWORD_CHECK_INVALID');
            } else {
                validationState.isPasswordCheckValid = true;
                validationState.passwordCheckInvalidText = '';
            }
        };

        const updateUser = async (userParam) => {
            try {
                await SpaceConnector.client.identity.user.update({
                    user_id: props.userId,
                    ...userParam,
                });
                if (store.state.user.userId === props.userId) {
                    await store.dispatch('user/setUser', 'USER', props.userId);
                }
                if (userParam.language) {
                    vm.$i18n.locale = userParam.language as string;
                }
                showSuccessMessage(vm.$t('IDENTITY.USER.ALT_S_UPDATE_USER'), '', root);
            } catch (e) {
                showErrorMessage(vm.$t('IDENTITY.USER.ALT_E_UPDATE_USER'), e, root);
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
            await checkPassword();
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
            await getProfile(props.userId);
        };
        init();

        return {
            ...toRefs(state),
            validationState,
            onClickProfileConfirm,
            onClickPasswordConfirm,
        };
    },
};
</script>

<style lang="postcss" scoped>
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
    justify-content: space-between;
    max-width: 33.5rem;
    .text-input {
        width: 25rem;
    }
    .p-select-dropdown::v-deep {
        width: 25rem;
        .dropdown-btn {
            margin-left: -9rem;
        }
    }
}

.save-btn {
    display: flex;
    justify-content: flex-end;
    margin-top: 1rem;
}
</style>
