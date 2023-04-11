<template>
    <user-account-module-container
        class="notification-email-wrapper"
    >
        <template #headline>
            <div class="headline-wrapper">
                <p class="form-title">
                    {{ $t('IDENTITY.USER.ACCOUNT.NOTIFICATION_EMAIL.TITLE') }}
                </p>
                <div class="verify-status-wrapper">
                    <div v-if="state.verified"
                         class="verified"
                    >
                        <p-i name="ic_verified"
                             height="1rem"
                             width="1rem"
                             class="verified-icon"
                             color="#60B731"
                        />
                        <span>
                            {{ $t('IDENTITY.USER.ACCOUNT.NOTIFICATION_EMAIL.VERIFIED') }}
                        </span>
                    </div>
                    <span v-else
                          class="not-verified"
                    >
                        {{ $t('IDENTITY.USER.ACCOUNT.NOTIFICATION_EMAIL.NOT_VERIFIED') }}
                    </span>
                </div>
            </div>
        </template>
        <span class="help-text">
            {{ $t('IDENTITY.USER.ACCOUNT.NOTIFICATION_EMAIL.HELP_TEXT') }}
        </span>
        <form class="form"
              onsubmit="return false"
        >
            <p-field-group
                :invalid="validationState.isNotificationEmailValid"
                :invalid-text="validationState.notificationEmailInvalidText"
                required
                class="field-group"
            >
                <p-text-input v-model="formState.notificationEmail"
                              :placeholder="state.userId"
                              :disabled="state.verified"
                              :invalid="validationState.isNotificationEmailValid"
                              block
                              @update:value="handleChangeInput"
                />
            </p-field-group>
            <verify-button
                :email="formState.notificationEmail"
                :user-id="state.userId"
                :domain-id="state.domainId"
            />
        </form>
    </user-account-module-container>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue';
import type { TranslateResult } from 'vue-i18n';

import { PI, PTextInput, PFieldGroup } from '@spaceone/design-system';

import { store } from '@/store';

import { emailValidator } from '@/lib/helper/user-validation-helper';

import VerifyButton from '@/common/modules/button/verify-button/VerifyButton.vue';

import UserAccountModuleContainer
    from '@/services/my-page/my-account/user-account/modules/UserAccountModuleContainer.vue';

const state = reactive({
    userType: computed(() => store.state.user.backend),
    verified: computed(() => store.state.user.emailVerified),
    userId: computed(() => store.state.user.userId),
    domainId: computed(() => store.state.domain.domainId),
    email: computed(() => store.state.user.email),
});
const formState = reactive({
    notificationEmail: computed({
        get() {
            if (!state.verified) {
                if (state.userType === 'LOCAL') {
                    return state.userId;
                }
                return '';
            }
            return state.email;
        },
        set(newVal) {
            return newVal;
        },
    }),
});
const validationState = reactive({
    isNotificationEmailValid: undefined as undefined | boolean,
    notificationEmailInvalidText: '' as TranslateResult | string,
});

/* Components */
const handleChangeInput = async () => {
    if (formState.notificationEmail === '') {
        validationState.isNotificationEmailValid = false;
    } else if (!emailValidator(formState.notificationEmail)) {
        validationState.isNotificationEmailValid = false;
    } else {
        validationState.isNotificationEmailValid = true;
        // TODO: babel edit
        validationState.notificationEmailInvalidText = 'check format';
    }
};
</script>

<style lang="postcss" scoped>
.notification-email-wrapper {
    margin-top: 1rem;
    .headline-wrapper {
        @apply flex items-center;
        margin-bottom: 1.625rem;
        .form-title {
            @apply text-display-md;
            margin-bottom: 0;
        }
        .verify-status-wrapper {
            margin-left: 0.5rem;
            .verified {
                @apply text-label-md text-green-600;
            }
            .not-verified {
                @apply bg-yellow-200 text-label-sm;
                padding: 0.15rem 0.5rem;
                border-radius: 6.25rem;
            }
        }
    }
    .help-text {
        @apply text-paragraph-md;
    }
    .form {
        @apply relative flex;
        margin-top: 1rem;

        .icon-edit {
            margin-right: 0.375rem;
        }

        /* custom design-system component - p-field-group */
        :deep(.p-field-group) {
            &.field-group {
                width: 26.625rem;
                margin-bottom: 0;

                /* custom design-system component - p-text-input */
                :deep(.p-text-input) {
                    &::placeholder {
                        @apply text-gray-300;
                    }
                }
                .invalid-feedback {
                    position: absolute;
                }
            }
        }
    }
}
</style>
