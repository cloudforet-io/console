<template>
    <div class="multi-factor-authentication-page">
        <div class="form-wrapper">
            <div class="headline-wrapper">
                <p class="title">
                    {{ $t('AUTH.MFA.TITLE') }}
                </p>
                <p class="subtitle">
                    {{ $t('AUTH.MFA.SUB_TITLE') }}
                </p>
            </div>
            <div class="email-info-wrapper">
                <span class="email-info-desc">
                    <i18n path="AUTH.MFA.EMAIL_INFO">
                        <template #code>
                            <strong>{{ $t('AUTH.MFA.AUTHENTICATION_CODE') }}</strong>
                        </template>
                    </i18n>
                </span>
                <div class="email-wrapper">
                    <p-i name="ic_envelope-filled"
                         height="1.125rem"
                         width="1.125rem"
                         color="inherit"
                         class="icon-envelope"
                    />
                    <strong class="email-text">
                        {{ route.query.userId }}
                    </strong>
                </div>
            </div>
            <p-field-group :label="$t('AUTH.MFA.AUTHENTICATION_CODE')"
                           :invalid="validationState.isVerificationCodeValid"
                           :invalid-text="validationState.verificationCodeInvalidText"
                           required
                           class="input-form"
            >
                <p-text-input :value="validationState.verificationCode"
                              :invalid="validationState.isVerificationCodeValid"
                              class="text-input"
                              @update:value="handleChangeInput"
                />
            </p-field-group>
            <div>
                <p-collapsible-toggle v-if="state.isCollapsed"
                                      v-model="state.isCollapsed"
                >
                    {{ $t('AUTH.COLLAPSED.EXTENSION_TITLE_1') }}
                </p-collapsible-toggle>
                <collapsible-contents v-else
                                      @click-resend="handleClickResend"
                />
            </div>
            <p-button size="lg"
                      class="confirm-button"
                      @click="handleClickConfirmButton"
            >
                {{ $t('AUTH.MFA.CONFIRM') }}
            </p-button>
            <div class="go-back-wrapper">
                <p-icon-button name="ic_arrow-left"
                               size="sm"
                               class="go-back-button mr-2"
                />
                <p class="go-back-button">
                    <router-link :to="{ name: AUTH_ROUTE.SIGN_IN._NAME}">
                        {{ $t('AUTH.MFA.GO_BACK') }}
                    </router-link>
                </p>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { computed, reactive } from 'vue';
import type { TranslateResult } from 'vue-i18n';
import { useRoute } from 'vue-router/composables';

import {
    PButton,
    PCollapsibleToggle, PFieldGroup, PI, PIconButton, PTextInput,
} from '@spaceone/design-system';

import { store } from '@/store';

import { postEnableMfa } from '@/lib/helper/multi-factor-authentication-helper';

import CollapsibleContents from '@/services/auth/components/CollapsibleContents.vue';
import { AUTH_ROUTE } from '@/services/auth/route-config';

const route = useRoute();

const state = reactive({
    loading: false,
    domainId: computed(() => store.state.domain.domainId),
    isCollapsed: true,
});

const validationState = reactive({
    verificationCode: '',
    isVerificationCodeValid: undefined as undefined | boolean,
    verificationCodeInvalidText: '' as TranslateResult | string,
});

const handleChangeInput = (value: string) => {
    validationState.verificationCode = value;
};
const handleClickResend = async () => {
    state.loading = true;

    await postEnableMfa({
        user_id: route.query.userId,
        mfa_type: 'EMAIL',
        options: {
            email: route.query.userId,
        },
        domain_id: state.domainId,
    });

    state.loading = false;
};
// TODO: will be updated
const handleClickConfirmButton = () => {};
</script>

<style lang="postcss" scoped>
.multi-factor-authentication-page {
    @apply flex flex-col bg-white;
    flex-grow: 1;
    overflow-y: auto;
    padding: 2.5rem;
    .form-wrapper {
        @apply relative flex flex-col;
        width: 100%;
        margin: auto 2.5rem;
        align-self: center;
        gap: 1rem;

        @screen xs {
            width: 25rem;
            margin: auto;
        }
        .headline-wrapper {
            @apply flex flex-col;
            gap: 1rem;
            .title {
                @apply text-display-lg text-primary1;
            }
            .subtitle {
                @apply text-paragraph-md text-gray-700;
            }
        }
        .email-info-wrapper {
            .email-info-desc {
                @apply text-label-lg text-gray-900;
            }
            .email-wrapper {
                @apply flex items-center bg-gray-100 rounded;
                width: auto;
                padding: 0.5rem 1rem;
                gap: 0.25rem;
                .icon-envelope {
                    @apply text-gray-700;
                }
                .email-text {
                    @apply text-paragraph-lg;
                }
            }
        }
        .input-form {
            margin-top: 0.5rem;
            .text-input {
                width: 100%;
            }
        }
        .confirm-button {
            margin-top: 1.5rem;
        }
        .go-back-wrapper {
            @apply flex items-center justify-center;
            margin-top: 1.5rem;
            .go-back-button {
                @apply text-blue-700 text-paragraph-md;
                margin-right: 0.25rem;
            }
        }
    }
}
</style>
