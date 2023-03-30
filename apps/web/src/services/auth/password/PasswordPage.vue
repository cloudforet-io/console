<template>
    <p-data-loader
        class="password-page"
        :loading="passwordPageState.loading"
    >
        <div class="contents-wrapper">
            <div class="headline-wrapper">
                <h1 class="title">
                    {{ markUpTitle }}
                </h1>
                <div class="help-text-wrapper">
                    <p v-if="currentPageName === AUTH_ROUTE.PASSWORD.STATUS.RESET._NAME"
                       class="help-text"
                    >
                        {{ $t('AUTH.PASSWORD.RESET.HELP_TEXT') }}
                        <span class="emphasis">
                            {{ state.email }}
                        </span>
                    </p>
                    <p v-else
                       class="help-text"
                    >
                        {{ $t('AUTH.PASSWORD.FIND.HELP_TEXT') }}
                    </p>
                </div>
            </div>
            <password-form :status="currentPageName"
                           @change-input="handleChangeInput"
            />
            <div class="button-wrapper">
                <p-button
                    v-if="currentPageName === AUTH_ROUTE.PASSWORD.STATUS.RESET._NAME"
                    :disabled="
                        state.password === ''
                            || state.confirmPassword === ''
                            || state.password !== state.confirmPassword
                    "
                    @click="handleClickResetButton"
                >
                    {{ $t('AUTH.PASSWORD.RESET.RESET_PASSWORD') }}
                </p-button>
                <p-button
                    v-else
                    :disabled="state.userId === ''"
                    @click="handleClickButton"
                >
                    {{ $t('AUTH.PASSWORD.FIND.SEND') }}
                </p-button>
            </div>
            <div v-if="currentPageName === AUTH_ROUTE.PASSWORD.STATUS.FIND._NAME"
                 class="util-wrapper"
            >
                <p-icon-button name="ic_arrow-left"
                               size="sm"
                               class="go-back-button mr-2"
                />
                <p class="go-back-button">
                    <router-link :to="{name: AUTH_ROUTE.SIGN_IN._NAME}">
                        {{ $t('AUTH.PASSWORD.FIND.BACK_TO_SIGN_IN') }}
                    </router-link>
                </p>
            </div>
        </div>
    </p-data-loader>
</template>

<script setup lang="ts">
import {
    computed, getCurrentInstance, reactive,
} from 'vue';
import type { Vue } from 'vue/types/vue';

import { PButton, PDataLoader, PIconButton } from '@spaceone/design-system';

import { SpaceRouter } from '@/router';

import PasswordForm from '@/services/auth/password/moduels/PasswordForm.vue';
import { AUTH_ROUTE } from '@/services/auth/route-config';
import { usePasswordPageStore } from '@/services/auth/store/password-page-store';

const vm = getCurrentInstance()?.proxy as Vue;
const passwordPageStore = usePasswordPageStore();
const passwordPageState = passwordPageStore.$state;

const state = reactive({
    loading: false,
    // TODO: email에 있는걸로 변경 확인해야함
    email: 'nayeongkim@megazone.com',
    userId: '',
    password: '',
    confirmPassword: '',
});
const currentPageName = SpaceRouter.router.currentRoute.name;
const markUpTitle = computed(() => {
    if (currentPageName === AUTH_ROUTE.PASSWORD.STATUS.FIND._NAME) {
        return vm.$t('AUTH.PASSWORD.FIND.TITLE');
    } if (currentPageName === AUTH_ROUTE.EMAIL.INVALID._NAME) {
        return 'The link is invalid';
    }
    return vm.$t('AUTH.PASSWORD.RESET.TITLE');
});
const handleChangeInput = (value) => {
    state.userId = value.userId;
    state.password = value.password;
    state.confirmPassword = value.confirmPassword;
};
const handleClickButton = () => {
    passwordPageStore.sendResetEmail(state.userId);
    state.userId = '';
};
const handleClickResetButton = () => {
    console.log(state.email, state.password);
    passwordPageStore.resetPassword(state.email, state.password);
};

</script>

<style lang="postcss" scoped>
.password-page {
    position: relative;
    width: 100%;
    height: 100%;
    justify-content: center;
    .contents-wrapper {
        @apply flex flex-col;
        gap: 2.5rem;
        position: absolute;
        width: 25rem;
        min-width: 17.5rem;
        top: 45%;
        left: 50%;
        transform: translate(-50%, -50%);
        .headline-wrapper {
            @apply flex flex-col;
            width: 100%;
            gap: 0.75rem;
            .title {
                @apply font-bold text-display-md;
            }
            .help-text {
                @apply text-gray-700 text-paragraph-md;
                .emphasis {
                    @apply font-bold;
                }
            }
        }

        /* custom design-system component - p-button */
        :deep(.p-button) {
            width: 100%;
        }
        .button-wrapper {
            margin-top: 1rem;
        }
        .util-wrapper {
            @apply flex items-center justify-center;

            /* custom design-system component - p-icon-button */
            :deep(.p-icon-button) {
                margin-right: 0.25rem;
            }
            .go-back-button {
                @apply text-blue-700 text-paragraph-md;
            }
        }
    }
}
</style>
