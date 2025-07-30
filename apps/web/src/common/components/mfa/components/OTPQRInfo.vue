<script setup lang="ts">
import { useWindowSize } from '@vueuse/core';
import { useQRCode } from '@vueuse/integrations/useQRCode';
import { reactive, computed, onMounted } from 'vue';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PTextInput, PIconButton, PSpinner, screens, PTextarea,
} from '@cloudforet/mirinae';

import { MULTI_FACTOR_AUTH_TYPE } from '@/schema/identity/user-profile/constant';

import ErrorHandler from '@/common/composables/error/errorHandler';


const { width } = useWindowSize();
const isMobileSize = computed<boolean>(() => width.value < screens.mobile.max);

const state = reactive({
    qrUri: '',
    qrCode: computed<string>(() => useQRCode(state.qrUri, { margin: 0 })),
    passKey: computed<string>(() => state.qrUri?.match(/secret=([^&]*)/)?.[1] || ''),
    loading: false,
});

/* Api */
const enableMfa = async () => {
    try {
        state.loading = true;
        const data = await SpaceConnector.clientV2.identity.userProfile.enableMfa({
            mfa_type: MULTI_FACTOR_AUTH_TYPE.OTP,
            options: {},
        });
        state.qrUri = data.mfa?.options?.otp_qrcode_uri || '';
    } catch (error) {
        ErrorHandler.handleError(error);
    } finally {
        state.loading = false;
    }
};

/* Event */
const handleClickRefreshButton = async () => {
    await enableMfa();
};

onMounted(() => {
    enableMfa();
});
</script>

<template>
    <div class="user-account-multi-factor-auth-modal-ms-info">
        <p class="set-up-title">
            <i18n path="MY_PAGE.MFA.STEP_DESC"
                  tag="p"
            >
                <template #type>
                    <a href="https://www.microsoft.com/en-us/security/mobile-authenticator-app"
                       target="_blank"
                       class="auth-link"
                    >
                        Microsoft Authenticator App
                    </a>
                </template>
            </i18n>
        </p>
        <ol class="set-up-desc">
            <li>{{ $t('MY_PAGE.MFA.STEP1') }}</li>
            <li>{{ $t('MY_PAGE.MFA.STEP2') }}</li>
        </ol>
        <p-spinner v-if="state.loading"
                   size="md"
                   class="loading qrcode"
        />
        <img v-else
             :src="state.qrCode.value"
             alt="QR Code"
             class="qrcode"
        >
        <div class="passkey-wrapper">
            <p-text-input v-if="!isMobileSize"
                          :value="state.passKey"
                          class="passkey"
                          disabled
                          block
            />
            <p-textarea v-else
                        :value="state.passKey"
                        class="passkey"
                        disabled
                        block
            />
            <p-icon-button name="ic_refresh"
                           class="refresh-btn"
                           size="md"
                           style-type="tertiary"
                           @click="handleClickRefreshButton"
            />
        </div>
        <ol class="set-up-desc"
            start="3"
        >
            <li>{{ $t('MY_PAGE.MFA.STEP3') }}</li>
        </ol>
    </div>
</template>

<style scoped lang="postcss">
.user-account-multi-factor-auth-modal-ms-info {
    @apply flex flex-col text-paragraph-md;
    margin-top: 1.625rem;
    margin-bottom: 1rem;
    .auth-link {
        @apply underline;
    }
    .loading {
        @apply flex items-center justify-center;
    }
    .qrcode {
        width: 6.25rem;
        height: 6.25rem;
        margin: 1rem auto;
    }
    .set-up-desc {
        list-style: decimal;
        padding-left: 1rem;

        @screen mobile {
            margin-left: 0.25rem;
        }
    }
    .passkey-wrapper {
        @apply flex;
        margin-bottom: 0.5rem;
        gap: 0.5rem;

        /* custom design-system component - p-text-input */
        :deep(.p-text-input) {
            .input-container.disabled {
                background-color: white;
            }
        }

        /* custom design-system component - p-textarea */
        :deep(.p-textarea) {
            @apply bg-white text-gray-900 resize-none;
            min-height: 2rem;
        }
        .refresh-btn {
            border-radius: 0.25rem;
        }
    }
}
</style>
