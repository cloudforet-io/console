<script setup lang="ts">
import { computed, reactive } from 'vue';

import {
    PI, PButton, PTextInput, PFieldGroup,
} from '@cloudforet/mirinae';

import { MULTI_FACTOR_AUTH_TYPE } from '@/api-clients/identity/user-profile/schema/constant';
import { i18n } from '@/translations';

import { useUserStore } from '@/store/user/user-store';

import { postEnableMfa, postUserProfileDisableMfa } from '@/lib/helper/multi-factor-auth-helper';
import { emailValidator } from '@/lib/helper/user-validation-helper';

import { useFormValidator } from '@/common/composables/form-validator';
import { useProxyValue } from '@/common/composables/proxy-state';

import { useMultiFactorAuthStore } from '@/services/my-page/stores/multi-factor-auth-store';

interface Props {
    isSentCode?: boolean
}

const props = withDefaults(defineProps<Props>(), {
    isSentCode: false,
});

const multiFactorAuthStore = useMultiFactorAuthStore();
const multiFactorAuthState = multiFactorAuthStore.state;
const userStore = useUserStore();

const emit = defineEmits<{(e: 'update:is-sent-code'): void }>();

const storeState = reactive({
    email: computed<string|undefined>(() => userStore.state.mfa?.options?.email),
    isFormModal: computed(() => multiFactorAuthState.modalType === 'FORM'),
});
const state = reactive({
    loading: false,
    proxyIsSentCode: useProxyValue('isSentCode', props, emit),
    originEmail: storeState.email,
});

const {
    forms: {
        email,
    },
    setForm,
    invalidState,
    invalidTexts,
} = useFormValidator({
    email: '',
}, {
    email(value: string) { return !emailValidator(value) ? '' : i18n.t('MY_PAGE.NOTIFICATION_EMAIL.EMAIL_INVALID'); },
});

const handleClickSendCodeButton = async () => {
    state.loading = true;
    try {
        if (storeState.isFormModal) {
            await postEnableMfa({
                mfa_type: MULTI_FACTOR_AUTH_TYPE.EMAIL,
                options: {
                    email: email.value,
                },
            });
            userStore.setMfa({
                options: {
                    email: email.value,
                },
            });
        } else {
            await postUserProfileDisableMfa();
        }
        state.proxyIsSentCode = true;
    } finally {
        state.loading = false;
    }
};
</script>

<template>
    <div class="email-info-wrapper"
         :class="{'form-modal': storeState.isFormModal}"
    >
        <div v-if="storeState.isFormModal"
             class="email-form-wrapper"
        >
            <p-field-group
                required
                :invalid="invalidState.email"
                :invalid-text="invalidTexts.email"
                :label="$t('COMMON.MFA_MODAL.EMAIL')"
                class="input-form"
            >
                <p-text-input :value="email"
                              :invalid="invalidState.email"
                              is-focused
                              :disabled="state.loading || state.proxyIsSentCode"
                              block
                              @update:value="setForm('email', $event)"
                />
            </p-field-group>
            <p-button style-type="secondary"
                      class="send-code-button"
                      :loading="state.loading"
                      :disabled="email === '' || state.proxyIsSentCode"
                      @click="handleClickSendCodeButton"
            >
                {{ $t('COMMON.MFA_MODAL.SEND_CODE') }}
            </p-button>
        </div>
        <div v-else
             class="email-view-wrapper"
        >
            <div class="contents-wrapper">
                <div class="email-info">
                    <p>{{ $t('COMMON.MFA_MODAL.ALT.EMAIL_INFO') }}</p>
                    <div class="email-wrapper">
                        <p-i name="ic_envelope-filled"
                             height="0.875rem"
                             width="0.875rem"
                             color="inherit"
                             class="icon-envelope"
                        />
                        <p class="email-text">
                            {{ storeState.email || state.originEmail }}
                        </p>
                    </div>
                </div>
                <p-button style-type="secondary"
                          :loading="state.loading"
                          :disabled="state.proxyIsSentCode"
                          @click="handleClickSendCodeButton"
                >
                    {{ $t('COMMON.MFA_MODAL.SEND_CODE') }}
                </p-button>
            </div>
        </div>
    </div>
</template>

<style scoped lang="postcss">
.email-info-wrapper {
    margin-bottom: 1.25rem;
    &.form-modal {
        margin-top: 1.625rem;
    }
    .email-form-wrapper {
        @apply flex items-start;
        gap: 1rem;
        .input-form {
            flex: 1;
        }
        .send-code-button {
            margin-top: 1.45rem;
        }
    }
    .email-view-wrapper {
        @apply flex flex-col bg-gray-100 rounded text-label-md text-gray-700;
        padding: 0.5rem;
        gap: 0.375rem;
        .contents-wrapper {
            @apply flex justify-between items-center;

            @screen mobile {
                flex-direction: column;
                align-items: flex-start;
                gap: 0.5rem;
            }
            .email-info {
                @apply flex flex-col;
            }
            .email-wrapper {
                @apply flex items-center font-bold;
                gap: 0.375rem;
                .icon-envelope {
                    margin-bottom: -0.25rem;
                }
            }
        }
    }
}
</style>
