<script setup lang="ts">
import { computed, reactive } from 'vue';

import {
    PI, PButton, PTextInput, PFieldGroup,
} from '@cloudforet/mirinae';

import { store } from '@/store';
import { i18n } from '@/translations';

import { postEnableMfa, postUserProfileDisableMfa } from '@/lib/helper/multi-factor-auth-helper';
import { emailValidator } from '@/lib/helper/user-validation-helper';

import { useFormValidator } from '@/common/composables/form-validator';
import { useProxyValue } from '@/common/composables/proxy-state';

import type { UserListItemType } from '@/services/iam/types/user-type';
import { MULTI_FACTOR_AUTH_MODAL_TYPE } from '@/services/my-page/types/multi-factor-auth-type';

interface Props {
    email?: string
    type?: string
    isSentCode?: boolean
}

const props = withDefaults(defineProps<Props>(), {
    email: '',
    type: '',
    isSentCode: false,
});

const emit = defineEmits<{(e: 'update:is-sent-code'): void }>();

const state = reactive({
    loading: false,
    data: {} as UserListItemType,
    userId: computed(() => store.state.user.userId),
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
        if (props.type === MULTI_FACTOR_AUTH_MODAL_TYPE.EMAIL) {
            state.data = await postEnableMfa({
                mfa_type: props.type,
                options: {
                    email: email.value,
                },
            }, false) as UserListItemType;
            await store.dispatch('user/setUser', {
                email: state.data.email,
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
        <div v-if="props.type !== MULTI_FACTOR_AUTH_MODAL_TYPE.DISABLED"
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
                            {{ props.email || state.originEmail }}
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
