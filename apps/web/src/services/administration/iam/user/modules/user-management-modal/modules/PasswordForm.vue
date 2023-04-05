<template>
    <p-field-group :label="userPageState.visibleUpdateModal ? $t('COMMON.PROFILE.PASSWORD') : ''"
                   required
                   class="password-form-wrapper"
    >
        <div class="password-form-view">
            <p-radio v-for="(type, idx) in state.passwordType"
                     :key="type.name"
                     v-model="state.passwordStatus"
                     :value="idx"
                     @change="handleClickRadio(idx)"
            >
                {{ type.label }}
            </p-radio>
            <p-divider />
            <form class="form">
                <p-field-group
                    :label="$t('COMMON.PROFILE.PASSWORD')"
                    :required="true"
                    :invalid="validationState.isPasswordValid === false"
                    :invalid-text="validationState.passwordInvalidText"
                    class="input-form"
                >
                    <template #default="{invalid}">
                        <p-text-input v-model="formState.password"
                                      type="password"
                                      autocomplete="current-password"
                                      appearance-type="masking"
                                      class="text-input"
                                      :disabled="!state.isManually"
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
                        <p-text-input v-model="formState.passwordCheck"
                                      type="password"
                                      class="text-input"
                                      autocomplete="new-password"
                                      appearance-type="masking"
                                      :disabled="!state.isManually"
                                      :invalid="invalid"
                        />
                    </template>
                </p-field-group>
            </form>
        </div>
    </p-field-group>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue';
import type { TranslateResult } from 'vue-i18n';

import {
    PTextInput, PFieldGroup, PRadio, PDivider,
} from '@spaceone/design-system';

import { i18n } from '@/translations';

import { PasswordType } from '@/services/administration/iam/user/type';
import { useUserPageStore } from '@/services/administration/store/user-page-store';

const userPageStore = useUserPageStore();
const userPageState = userPageStore.$state;

const state = reactive({
    passwordStatus: 0,
    passwordType: computed(() => {
        if (userPageState.visibleUpdateModal) {
            return [
                {
                    name: PasswordType.KEEP,
                    label: i18n.t('COMMON.PROFILE.KEEP_PASSWORD'),
                },
                {
                    name: PasswordType.RESET,
                    label: i18n.t('COMMON.PROFILE.SEND_LINK'),
                },
                {
                    name: PasswordType.MANUALLY,
                    label: i18n.t('COMMON.PROFILE.SET_MANUALLY'),
                },
            ];
        }
        return [
            {
                name: PasswordType.RESET,
                label: i18n.t('COMMON.PROFILE.SEND_LINK'),
            },
            {
                name: PasswordType.MANUALLY,
                label: i18n.t('COMMON.PROFILE.SET_MANUALLY'),
            },
        ];
    }),
    isManually: false,
});


const formState = reactive({
    password: '',
    passwordCheck: '',
});
const validationState = reactive({
    isPasswordValid: undefined as undefined | boolean,
    passwordInvalidText: '' as TranslateResult | string,
    isPasswordCheckValid: undefined as undefined | boolean,
    passwordCheckInvalidText: '' as TranslateResult | string,
});

const handleClickRadio = (idx: number) => {
    state.isManually = state.passwordType[idx].name === PasswordType.MANUALLY;
};

</script>

<style lang="postcss" scoped>
.password-form-wrapper {
    @apply bg-white rounded-lg;
    padding: 0.75rem;
    .password-form-view {
        @apply flex flex-col;
        gap: 1rem;
        .form {
            @apply flex flex-col;
            gap: 1rem;
            .p-field-group {
                margin-bottom: 0;

                /* custom design-system component - p-text-input */
                :deep(.p-text-input) {
                    width: 100%;
                    .p-button {
                        @apply font-normal;
                    }
                    .input-container {
                        &.disabled {
                            .p-button {
                                @apply bg-transparent;
                            }
                        }
                    }
                }
            }
        }
    }
}
</style>
