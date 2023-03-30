<template>
    <div class="collapsible-contents-wrapper">
        <div class="contents-item">
            <p class="title">
                {{ $t('AUTH.PASSWORD.RESET.EMAIL.DONE.EXTENSION_TITLE_1') }}
            </p>
            <ul class="list">
                <li>{{ $t('AUTH.PASSWORD.RESET.EMAIL.DONE.EXTENSION_REASON_1') }}</li>
                <li>{{ $t('AUTH.PASSWORD.RESET.EMAIL.DONE.EXTENSION_REASON_2') }}</li>
                <li>
                    <p-text-button class="re-send-button"
                                   @click="handleClickResend"
                    >
                        {{ $t('AUTH.PASSWORD.RESET.EMAIL.DONE.CLICK_HERE') }}
                    </p-text-button>
                    {{ $t('AUTH.PASSWORD.RESET.EMAIL.DONE.EXTENSION_REASON_3') }}
                </li>
            </ul>
        </div>
        <div class="contents-item">
            <p class="title">
                {{ $t('AUTH.PASSWORD.RESET.EMAIL.DONE.EXTENSION_TITLE_2') }}
            </p>
            <p>
                {{ $t('AUTH.PASSWORD.RESET.EMAIL.DONE.EXTENSION_DESC_1') }}
                <span class="contact-help-text">
                    {{ $t('AUTH.PASSWORD.RESET.EMAIL.DONE.EXTENSION_CONTACT') }}
                </span>
            </p>
        </div>
    </div>
</template>

<script setup lang="ts">

import { PTextButton } from '@spaceone/design-system';

import { SpaceRouter } from '@/router';

import { usePasswordPageStore } from '@/services/auth/store/password-page-store';

const passwordPageStore = usePasswordPageStore();

const { query } = SpaceRouter.router.currentRoute;
const handleClickResend = () => {
    passwordPageStore.sendResetEmail(query.userId as string);
};
</script>

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
