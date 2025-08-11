<script setup lang="ts">
import { reactive } from 'vue';

import {
    PTextInput, PFieldGroup, PToggleButton, PDivider, PFieldTitle, PButton, PCopyButton,
} from '@cloudforet/mirinae';

import { i18n } from '@/translations';

import { useFormValidator } from '@/common/composables/form-validator';
import { useProxyValue } from '@/common/composables/proxy-state';

import { generatePassword } from '@/services/iam/helpers/generate-helper';

interface Props {
    isReset: boolean;
    password: string;
    disabledResetPassword: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    isReset: true,
    password: '',
    disabledResetPassword: false,
});

const emit = defineEmits<{(e: 'update:password', password: string): void,
}>();

const state = reactive({
    proxyIsReset: useProxyValue('isReset', props, emit),
    proxyPassword: useProxyValue('password', props, emit),
    isGenerate: false,
    copyButtonVisible: true,
});

const {
    forms: {
        password,
    },
    setForm,
    invalidState,
    invalidTexts,
} = useFormValidator({
    password: '',
}, {
    password(value: string) {
        if (value === '') return '';
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

        if (!passwordRegex.test(value)) {
            return i18n.t('IAM.USER.FORM.PASSWORD_VALIDATION_INVALID');
        }

        return '';
    },
});

/* Components */
const handleChangeInput = (value: string) => {
    setForm('password', value);

    if (!invalidState.password) {
        state.proxyPassword = value;
    } else {
        state.proxyPassword = '';
    }
};
const handleChangeToggleButton = () => {
    state.proxyIsReset = !state.proxyIsReset;
    if (state.proxyIsReset) {
        state.proxyPassword = '';
        handleChangeInput('');
    }
};
const handleClickGenerate = () => {
    const newPassword = generatePassword();
    handleChangeInput(newPassword);
};
</script>

<template>
    <div class="user-management-add-password">
        <div class="title-wrapper">
            <p-field-title :label="$t('IAM.USER.FORM.PASSWORD_SEND_LINK')" />
            <p-toggle-button v-model="state.proxyIsReset"
                             :disabled="props.disabledResetPassword"
                             @change-toggle="handleChangeToggleButton"
            />
        </div>
        <div v-if="!state.proxyIsReset"
             class="password-form-view"
        >
            <p-divider />
            <p-field-group
                :label="$t('IAM.USER.FORM.PASSWORD')"
                :required="true"
                :invalid="invalidState.password"
                :invalid-text="invalidTexts.password"
                class="password-form-wrapper"
            >
                <div class="password-form">
                    <p-button style-type="tertiary"
                              @click="handleClickGenerate"
                    >
                        {{ $t('IAM.USER.FORM.GENERATE') }}
                    </p-button>
                    <p-text-input :value="password"
                                  class="password-input"
                                  :placeholder="$t('IAM.USER.FORM.GENERATE_PLACEHOLDER')"
                                  :invalid="invalidState.password"
                                  @update:value="handleChangeInput"
                                  @focusin="() => state.copyButtonVisible = false"
                                  @focusout="() => state.copyButtonVisible = true"
                    >
                        <template #right-extra>
                            <p-copy-button v-if="state.copyButtonVisible && state.proxyPassword !== ''"
                                           class="icon"
                                           :value="state.proxyPassword"
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
