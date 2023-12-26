<script setup lang="ts">
import { computed, reactive } from 'vue';

import {
    PI, PTooltip, PDivider, PButton, PTextInput, PFieldGroup,
} from '@spaceone/design-system';

import { store } from '@/store';
import { i18n } from '@/translations';

import { postEnableMfa, postUserProfileDisableMfa } from '@/lib/helper/multi-factor-auth-helper';
import { emailValidator } from '@/lib/helper/user-validation-helper';

import { useFormValidator } from '@/common/composables/form-validator';
import { useProxyValue } from '@/common/composables/proxy-state';

interface Props {
    email?: string
    type?: string
    mfaType?: string
    isSentCode?: boolean
}

const props = withDefaults(defineProps<Props>(), {
    email: '',
    type: '',
    mfaType: '',
    isSentCode: false,
});

const emit = defineEmits<{(e: 'update:is-sent-code'): void }>();

const state = reactive({
    loading: false,
    userId: computed(() => store.state.user.userId),
    domainId: computed(() => store.state.domain.domainId),
    proxyIsSentCode: useProxyValue('isSentCode', props, emit),
    originEmail: props.email,
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
        if (props.type === 'new') {
            await postEnableMfa({
                mfa_type: props.mfaType,
                options: {
                    email: email.value,
                },
            });
        } else {
            const response = await postUserProfileDisableMfa();
            await store.dispatch('user/setUser', response);
        }
        state.proxyIsSentCode = true;
    } finally {
        state.loading = false;
    }
};
</script>

<template>
    <div class="email-info-wrapper">
        <div v-if="props.type === 'new'"
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
                              block
                              @update:value="setForm('email', $event)"
                />
            </p-field-group>
            <p-button style-type="secondary"
                      :loading="state.loading"
                      :disabled="email === ''"
                      @click="handleClickSendCodeButton"
            >
                {{ $t('COMMON.MFA_MODAL.SEND_CODE') }}
            </p-button>
        </div>
        <div v-else
             class="email-view-wrapper"
        >
            <div v-if="props.type === 'change'"
                 class="change-info-wrapper"
            >
                <div class="change-info">
                    <p>{{ $t('COMMON.MFA_MODAL.CHANGE.DESC') }}</p>
                    <p-tooltip
                        :contents="$t('COMMON.MFA_MODAL.CHANGE.TOOLTIP')"
                        position="bottom"
                    >
                        <p-i name="ic_info-circle"
                             class="icon-info"
                             height="1rem"
                             width="1rem"
                             color="inherit"
                        />
                    </p-tooltip>
                </div>
                <p-divider />
            </div>
            <div class="contents-wrapper">
                <div class="email-info">
                    <p>{{ props.type === 'verify' ? $t('COMMON.MFA_MODAL.SENT_DESC') : $t('COMMON.MFA_MODAL.ALT.EMAIL_INFO') }}</p>
                    <div class="email-wrapper">
                        <p-i name="ic_envelope-filled"
                             height="0.875rem"
                             width="0.875rem"
                             color="inherit"
                             class="icon-envelope"
                        />
                        <p class="email-text">
                            {{ props.email || state.originEmail }}
                        </p>
                    </div>
                </div>
                <p-button v-if="props.type !== 'verify'"
                          style-type="secondary"
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
    margin-bottom: 1rem;
    .email-form-wrapper {
        @apply flex items-end;
        gap: 1rem;
        .input-form {
            flex: 1;
        }
    }
    .email-view-wrapper {
        @apply flex flex-col bg-gray-100 rounded text-label-md text-gray-700;
        padding: 0.5rem;
        gap: 0.375rem;
        .change-info-wrapper {
            @apply flex flex-col;
            gap: 0.375rem;
            .change-info {
                @apply flex;
                gap: 0.25rem;
                .icon-info {
                    @apply text-gray-900;
                }
            }
        }
        .contents-wrapper {
            @apply flex justify-between items-center;
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
