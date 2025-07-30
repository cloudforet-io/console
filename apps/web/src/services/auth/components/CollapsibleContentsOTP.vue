<script setup lang="ts">
import { PLink, PDataLoader } from '@cloudforet/mirinae';

interface Props {
    loading: boolean
}

const props = withDefaults(defineProps<Props>(), {
    loading: false,
});
</script>

<template>
    <p-data-loader class="collapsible-contents-wrapper"
                   :loading="props.loading"
    >
        <div class="contents-item">
            <p class="title">
                {{ $t('AUTH.COLLAPSED.OTP_EXTENSION_TITLE_1') }}
            </p>
            <ul class="list">
                <li>{{ $t('AUTH.COLLAPSED.OTP_EXTENSION_REASON_1') }}</li>
                <li>{{ $t('AUTH.COLLAPSED.OTP_EXTENSION_REASON_2') }}</li>
            </ul>
        </div>
        <div class="contents-item">
            <p class="title">
                {{ $t('AUTH.COLLAPSED.OTP_EXTENSION_TITLE_2') }}
            </p>
            <p>
                <i18n path="AUTH.COLLAPSED.OTP_EXTENSION_DESC_1">
                    <template #guide>
                        <p-link href="https://support.microsoft.com/en-us/account-billing/about-microsoft-authenticator-9783c865-0308-42fb-a519-8cf666fe0acc"
                                new-tab
                                :text="$t('AUTH.COLLAPSED.GOOGLE_GUIDE')"
                                highlight
                        />
                    </template>
                    <template #contact>
                        <span class="contact-help-text">
                            {{ $t('AUTH.COLLAPSED.EXTENSION_CONTACT') }}
                        </span>
                    </template>
                </i18n>
            </p>
        </div>
    </p-data-loader>
</template>

<style lang="postcss" scoped>
.collapsible-contents-wrapper {
    @apply text-paragraph-sm;
    max-width: 23rem;
    .contents-item {
        .title {
            @apply font-bold;
        }
        .contact-help-text {
            @apply text-violet-600;
        }
        li {
            @apply relative;
            padding-left: 1.25rem;
            &::before {
                @apply absolute;
                content: '·';
                top: 0;
                left: 0.5rem;
            }
            .re-send-button {
                @apply inline-block text-paragraph-sm text-blue-700;
                padding: 0;
            }
        }
        & + .contents-item {
            margin-top: 1.625rem;
        }
        a {
            @apply text-blue-700;
        }
    }
}
</style>
