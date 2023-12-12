<script setup lang="ts">
import { reactive } from 'vue';
import type { TranslateResult } from 'vue-i18n';

import {
    PTextInput, PFieldGroup, PToggleButton, PDivider, PFieldTitle, PButton, PCopyButton,
} from '@spaceone/design-system';

import { generatePassword } from '@/services/administration/helpers/generate-helper';

const emit = defineEmits<{(e: 'change-input', password: string): void,
    (e: 'change-toggle', value: boolean): void
}>();

const state = reactive({
    passwordStatus: true,
    isGenerate: false,
    copyButtonVisible: true,
});
const formState = reactive({
    password: '',
});
const validationState = reactive({
    isPasswordValid: undefined as undefined | boolean,
    passwordInvalidText: '' as TranslateResult | string,
});

/* Components */
const handleChangeToggleButton = () => {
    state.passwordStatus = !state.passwordStatus;
    emit('change-toggle', state.passwordStatus);
};
const handleChangeInput = (value) => {
    formState.password = value;
    emit('change-input', formState.password);
};
const handleClickGenerate = () => {
    formState.password = generatePassword();
};
</script>

<template>
    <div class="user-management-add-password">
        <div class="title-wrapper">
            <p-field-title :label="$t('IDENTITY.USER.FORM.PASSWORD_SEND_LINK')" />
            <p-toggle-button v-model="state.passwordStatus"
                             @change-toggle="handleChangeToggleButton"
            />
        </div>
        <div v-if="!state.passwordStatus"
             class="password-form-view"
        >
            <p-divider />
            <p-field-group
                :label="$t('IDENTITY.USER.FORM.PASSWORD')"
                :required="true"
                :invalid="validationState.isPasswordValid"
                :invalid-text="validationState.passwordInvalidText"
                class="password-form-wrapper"
            >
                <div class="password-form">
                    <p-button style-type="tertiary"
                              @click="handleClickGenerate"
                    >
                        {{ $t('IDENTITY.USER.FORM.GENERATE') }}
                    </p-button>
                    <p-text-input :value="formState.password"
                                  class="password-input"
                                  :placeholder="$t('IDENTITY.USER.FORM.GENERATE_PLACEHOLDER')"
                                  :invalid="validationState.isPasswordValid"
                                  @update:value="handleChangeInput"
                                  @focusin="() => state.copyButtonVisible = false"
                                  @focusout="() => state.copyButtonVisible = true"
                    >
                        <template #right-extra>
                            <p-copy-button v-if="state.copyButtonVisible && formState.password !== ''"
                                           class="icon"
                                           :value="formState.password"
                            />
                        </template>
                    </p-text-input>
                </div>
            </p-field-group>
        </div>
    </div>
</template>

<style lang="postcss" scoped>
.user-management-add-password {
    @apply flex flex-col bg-white border border-primary-3 rounded-md;
    padding: 0.75rem;
    gap: 0.75rem;
    .title-wrapper {
        @apply flex justify-between;
    }
    .password-form-view {
        @apply flex flex-col;
        gap: 0.75rem;
        .password-form-wrapper {
            margin-bottom: 0;
            .password-form {
                @apply flex;
                gap: 0.5rem;
                .password-input {
                    width: 100%;
                }
            }
        }
    }
}

</style>
