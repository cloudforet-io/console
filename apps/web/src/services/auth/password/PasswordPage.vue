<template>
    <p-data-loader
        class="password-page"
        :loading="passwordPageState.loading"
    >
        <div class="contents-wrapper">
            <div class="headline-wrapper">
                <h1 class="title">
                    {{ state.pageTitle }}
                </h1>
                <div class="help-text-wrapper">
                    <p v-if="passwordPageState.status === AUTH_ROUTE.PASSWORD.STATUS.RESET._NAME"
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
            <password-form
                ref="passwordFormEl"
                v-model="formState"
                @change-input="handleChangeInput"
                @click-input="handleClickButton"
            />
            <div class="button-wrapper">
                <p-button
                    v-if="passwordPageState.status === AUTH_ROUTE.PASSWORD.STATUS.RESET._NAME"
                    :disabled="
                        formState.password === ''
                            || formState.confirmPassword === ''
                            || formState.password !== formState.confirmPassword
                            || formState.password.length< 8
                    "
                    @click="handleClickButton"
                >
                    {{ $t('AUTH.PASSWORD.RESET.RESET_PASSWORD') }}
                </p-button>
                <p-button
                    v-else
                    :disabled="formState.userId === ''"
                    @click="handleClickButton"
                >
                    {{ $t('AUTH.PASSWORD.FIND.SEND') }}
                </p-button>
            </div>
            <div v-if="passwordPageState.status === AUTH_ROUTE.PASSWORD.STATUS.FIND._NAME"
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
import type { ComponentPublicInstance } from 'vue';
import {
    computed,
    getCurrentInstance, reactive, ref,
} from 'vue';
import type { TranslateResult } from 'vue-i18n';
import type { Vue } from 'vue/types/vue';

import { PButton, PDataLoader, PIconButton } from '@spaceone/design-system';

import { store } from '@/store';

import type { UserState } from '@/store/modules/user/type';

import { emailValidator } from '@/lib/helper/user-validation-helper';

import PasswordForm from '@/services/auth/password/moduels/PasswordForm.vue';
import { AUTH_ROUTE } from '@/services/auth/route-config';
import { usePasswordPageStore } from '@/services/auth/store/password-page-store';
import type { PasswordFormExpose } from '@/services/auth/type';

const vm = getCurrentInstance()?.proxy as Vue;

const passwordPageStore = usePasswordPageStore();
const passwordPageState = passwordPageStore.$state;

const passwordFormEl = ref<ComponentPublicInstance<PasswordFormExpose>>();
const state = reactive({
    pageTitle: '' as TranslateResult | string,
    domainId: computed<string>(() => store.state.domain.domainId),
    userInfo: computed<UserState>(() => store.state.user),
    // TODO: tags?
    tags: {},
});
const formState = reactive({
    userId: '',
    password: '',
    confirmPassword: '',
});

/* Components */
const handleChangeInput = (value) => {
    formState.userId = value.userId;
    formState.password = value.password;
    formState.confirmPassword = value.confirmPassword;
};
const resetInputs = () => {
    formState.userId = '';
    formState.password = '';
    formState.confirmPassword = '';
};

/* API */
const handleClickButton = () => {
    if (formState.userId !== '') {
        if (emailValidator(formState.userId)) {
            if (passwordFormEl.value) {
                passwordFormEl.value.validationState.isIdValid = false;
                // TODO: babel edit;
                passwordFormEl.value.validationState.idInvalidText = 'Invalid email';
            }
            return;
        }
        passwordPageStore.postSendResetEmail(formState.userId, state.domainId);
    } else {
        const {
            userId, name, email, language, timezone,
        } = state.userInfo;
        const request = {
            user_id: userId,
            password: formState.password,
            name,
            email,
            language,
            timezone,
            tags: state.tags,
            domain_id: state.domainId,
        };
        passwordPageStore.postResetPassword(request);
    }
    resetInputs();
};

/* Init */
(async () => {
    if (passwordPageState.status === AUTH_ROUTE.PASSWORD.STATUS.FIND._NAME) {
        state.pageTitle = vm.$t('AUTH.PASSWORD.FIND.TITLE');
    } else if (passwordPageState.status === AUTH_ROUTE.EMAIL.INVALID._NAME) {
        state.pageTitle = 'The link is invalid';
    } else {
        state.pageTitle = vm.$t('AUTH.PASSWORD.RESET.TITLE');
    }
})();
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
