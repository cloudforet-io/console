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
        <form class="form">
            <p-field-group required
                           :invalid="validationState.isNotificationEmailValid === false"
                           :invalid-text="validationState.notificationEmailInvalidText"
            >
                <p-text-input v-model="formState.notificationEmail"
                              :invalid="validationState.isNotificationEmailValid === false"
                              :placeholder="state.userId"
                              block
                />
            </p-field-group>
            <div>
                <p-button :disabled="formState.notificationEmail === ''"
                          :style-type="state.verified ? 'tertiary' : 'primary'"
                          @click.prevent="handleClickVerifiedEmail"
                >
                    {{
                        state.verified
                            ? $t('IDENTITY.USER.ACCOUNT.NOTIFICATION_EMAIL.CHANGE')
                            : $t('IDENTITY.USER.ACCOUNT.NOTIFICATION_EMAIL.VERIFY')
                    }}
                </p-button>
            </div>
        </form>
        <notification-email-modal />
    </user-account-module-container>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue';
import type { TranslateResult } from 'vue-i18n';

import {
    PButton, PI, PTextInput, PFieldGroup,
} from '@spaceone/design-system';

import { store } from '@/store';

import NotificationEmailModal from '@/common/components/modals/NotificationEmailModal.vue';

import UserAccountModuleContainer
    from '@/services/my-page/my-account/user-account/modules/UserAccountModuleContainer.vue';
import { useMyAccountPageStore } from '@/services/my-page/store/my-account-page-store';

const myAccountPageStore = useMyAccountPageStore();

const state = reactive({
    userId: computed(() => store.state.user.userId),
    verified: false,
});
const formState = reactive({
    notificationEmail: '',
});
const validationState = reactive({
    showValidation: false,
    isNotificationEmailValid: undefined as undefined | boolean,
    notificationEmailInvalidText: '' as TranslateResult | string,
});

const checkNotificationEmail = async () => {
    const regex = /\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/;
    if (regex.test(formState.notificationEmail)) {
        validationState.isNotificationEmailValid = true;
    } else {
        console.log('true');
        validationState.isNotificationEmailValid = false;
        validationState.notificationEmailInvalidText = 'check format';
    }
};
const handleClickVerifiedEmail = async () => {
    await checkNotificationEmail();
    if (!validationState.isNotificationEmailValid) return;
    await myAccountPageStore.postValidationEmail(state.userId, formState.notificationEmail);
    formState.notificationEmail = '';
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
        @apply flex items-center;
        margin-top: 1rem;

        /* custom design-system component - p-field-group */
        :deep(.p-field-group) {
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

        /* custom design-system component - p-button */
        :deep(.p-button) {
            margin-left: 1rem;
        }
    }
}
</style>
