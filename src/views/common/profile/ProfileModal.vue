<template>
    <p-button-modal :header-title="$t('COMMON.PROFILE.TITLE')"
                    centered
                    fade
                    backdrop
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
                                   :invalid-text="invalidMsg.email"
                                   :invalid="invalidState.email"
                    >
                        <template #default="{invalid}">
                            <p-text-input v-model="userState.email"
                                          class="disabled block appearance-none w-full mb-1 text-base px-2 leading-normal bg-white text-grey-darker border border-grey rounded-sm"
                                          :class="{'is-invalid': invalid}"
                            />
                        </template>
                    </p-field-group>
                    <p-field-group :label="$t('COMMON.NAME')"
                                   :invalid-text="invalidMsg.name"
                                   :invalid="invalidState.name"
                    >
                        <template #default="{invalid}">
                            <p-text-input v-model="userState.name" block
                                          class="block appearance-none w-full mb-1 text-base px-2 leading-normal bg-white text-grey-darker border border-grey rounded-sm"
                                          :class="{'is-invalid': invalid}"
                            />
                        </template>
                    </p-field-group>
                    <form class="form">
                        <p-field-group v-if="showPassword"
                                       :label="$t('COMMON.PROFILE.PASSWORD')"
                                       :invalid-text="invalidMsg.password"
                                       :invalid="invalidState.password"
                        >
                            <template #default="{invalid}">
                                <p-text-input v-model="userState.password" block type="password"
                                              class="block appearance-none w-full mb-1 text-base px-2 leading-normal bg-white text-grey-darker border border-grey rounded-sm"

                                              :class="{'is-invalid': invalid}"
                                />
                            </template>
                        </p-field-group>
                        <p-field-group v-if="showPassword"
                                       :label="$t('COMMON.PROFILE.PASSWORD_CHECK')"
                                       :invalid-text="invalidMsg.passwordCheck"
                                       :invalid="invalidState.passwordCheck"
                        >
                            <template #default="{invalid}">
                                <p-text-input v-model="userState.passwordCheck" block type="password"
                                              class="block appearance-none w-full mb-1 text-base px-2 leading-normal bg-white text-grey-darker border border-grey rounded-sm"
                                              :class="{'is-invalid': invalid}"
                                />
                            </template>
                        </p-field-group>
                    </form>
                </div>
                <div class="form-div col-span-1">
                    <p-field-group :label="$t('COMMON.PROFILE.MOBILE')">
                        <br>
                        <p-text-input v-model="userState.mobile"
                                      block
                        />
                    </p-field-group>
                    <p-field-group :label="$t('COMMON.PROFILE.GROUP')">
                        <br>
                        <p-text-input v-model="userState.group"
                                      block
                        />
                    </p-field-group>
                    <p-field-group :label="$t('COMMON.PROFILE.LANGUAGE')">
                        <p-select-dropdown v-model="userState.language"
                                           :items="languages"
                                           auto-height
                        />
                    </p-field-group>
                    <p-field-group :label="$t('COMMON.PROFILE.TIMEZONE')">
                        <p-select-dropdown v-model="userState.timezone"
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
import {
    reactive, toRefs, computed, getCurrentInstance, ComponentRenderProxy,
} from '@vue/composition-api';

import PButtonModal from '@/components/organisms/modals/button-modal/PButtonModal.vue';
import PFieldGroup from '@/components/molecules/forms/field-group/PFieldGroup.vue';
import PTextInput from '@/components/atoms/inputs/PTextInput.vue';
import PSelectDropdown from '@/components/organisms/dropdown/select-dropdown/PSelectDropdown.vue';

import {
    makeProxy, formValidation, lengthMinValidation, lengthMaxValidation, Validation, requiredValidation,
} from '@/lib/compostion-util';
import { showErrorMessage, showSuccessMessage } from '@/lib/util';
import { store } from '@/store';

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
        const userState = reactive({
            password: '',
            passwordCheck: '',
            name: '',
            email: '',
            mobile: '',
            group: '',
            language: '',
            timezone: '',
        });

        const updateUserValidations = {
            name: [requiredValidation(vm.$t('COMMON.PROFILE.NAME_REQUIRED'))],
            email: [requiredValidation(vm.$t('COMMON.PROFILE.EMAIL_REQUIRED'))],
            password: [lengthMinValidation(5), lengthMaxValidation(12)],
            passwordCheck: [
                new Validation((value, data) => data.password === value, vm.$t('COMMON.PROFILE.PASSWORD_CHECK_INVALID')),
            ],
        };

        const state = reactive({
            loading: false,
            proxyVisible: makeProxy('visible', props, emit),
            showPassword: computed(() => state.isDomainOwner || state.isInternalAuth),
            userState,
            languages: [
                { type: 'item', label: 'English (default)', name: 'en' },
                { type: 'item', label: '한국어', name: 'ko' },
            ],
            timezones: [
                { type: 'item', label: 'UTC (default)', name: 'UTC' },
                { type: 'item', label: 'Asia/Seoul', name: 'Asia/Seoul' },
            ],
            showValidation: false,
            ...formValidation(userState, updateUserValidations),
            isInternalAuth: computed(() => store.getters['domain/isInternalAuth']),
            isDomainOwner: computed(() => store.getters['user/isDomainOwner']),
        });

        const getProfile = async (id) => {
            try {
                await store.dispatch('user/getUser', id);
                state.userState.name = store.state.user.name;
                state.userState.email = store.state.user.email;
                state.userState.mobile = store.state.user.mobile;
                state.userState.group = store.state.user.group;
                state.userState.language = store.state.user.language;
                state.userState.timezone = store.state.user.timezone;
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

        getProfile(props.userId);

        const onClickConfirm = async () => {
            state.showValidation = true;
            const result = await state.allValidation();
            if (!result) return;

            const userParam = { ...state.userState };
            delete userParam.passwordCheck;
            if (!state.showPassword) delete userParam.password;

            if (state.isDomainOwner) {
                userParam.owner_id = props.userId;
            } else {
                userParam.user_id = props.userId;
            }
            await updateProfile(userParam);

            state.proxyVisible = false;
        };

        return {
            ...toRefs(state),
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
