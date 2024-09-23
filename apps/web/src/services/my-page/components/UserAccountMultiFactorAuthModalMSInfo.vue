<script setup lang="ts">
import { useQRCode } from '@vueuse/integrations/useQRCode';
import { reactive } from 'vue';

import {
    PTextInput, PIconButton,
} from '@cloudforet/mirinae';

const qrcode = useQRCode('https://vueuse.org', {
    margin: 0,
});

const state = reactive({
    // TEMP DATA
    passkey: '5PFZQPE3HQTY7D74',
});

const handleClickRefreshButton = () => {};
</script>

<template>
    <div class="user-account-multi-factor-auth-modal-ms-info">
        <p class="set-up-title">
            <i18n path="MY_PAGE.MFA.STEP_DESC">
                <template #type>
                    <router-link to="https://www.microsoft.com/en-us/security/mobile-authenticator-app">
                        <u>Microsoft Authenticator App</u>
                    </router-link>
                </template>
            </i18n>
        </p>
        <ol class="set-up-desc">
            <li>{{ $t('MY_PAGE.MFA.STEP1') }}</li>
            <li>{{ $t('MY_PAGE.MFA.STEP2') }}</li>
        </ol>
        <img :src="qrcode"
             alt="QR Code"
             class="qrcode"
        >
        <div class="passkey-wrapper">
            <p-text-input :value="state.passkey"
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
    margin-bottom: 0.5rem;
    .qrcode {
        width: 6.25rem;
        height: 6.25rem;
        margin: 1rem auto;
    }
    .set-up-desc {
        list-style: decimal;
        padding-left: 1rem;
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
        .refresh-btn {
            border-radius: 0.25rem;
        }
    }
}
</style>
