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
            >
                <p-text-input v-model="formState.notificationEmail"
                              :placeholder="state.userId"
                              :disabled="myAccountPageState.loading || state.verified"
                              :invalid="validationState.isNotificationEmailValid"
                              block
                              @update:value="handleChangeInput"
                />
            </p-field-group>
            <div>
                <p-button v-if="state.verified"
                          style-type="tertiary"
                          :loading="myAccountPageState.loading"
                          @click.prevent="handleClickVerifiedEmail"
                >
                    <p-i name="ic_edit"
                         height="1rem"
                         width="1rem"
                         color="inherit"
                         class="icon-edit"
                    />
                    {{ $t('IDENTITY.USER.ACCOUNT.NOTIFICATION_EMAIL.CHANGE') }}
                </p-button>
                <p-button v-else
                          :disabled="formState.notificationEmail === '' || !emailValidator(formState.notificationEmail)"
                          style-type="primary"
                          :loading="myAccountPageState.loading"
                          @click.prevent="handleClickVerifiedEmail"
                >
                    {{ $t('IDENTITY.USER.ACCOUNT.NOTIFICATION_EMAIL.VERIFY') }}
                </p-button>
            </div>
        </form>
        <notification-email-modal
            :domain-id="state.domainId"
            :user-id="state.userId"
        />
    </user-account-module-container>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue';
import type { TranslateResult } from 'vue-i18n';

import {
    PButton, PI, PTextInput, PFieldGroup,
} from '@spaceone/design-system';

import { store } from '@/store';

import { emailValidator } from '@/lib/helper/user-validation-helper';

import NotificationEmailModal from '@/common/components/modals/NotificationEmailModal.vue';

import UserAccountModuleContainer
    from '@/services/my-page/my-account/user-account/modules/UserAccountModuleContainer.vue';
import { useMyAccountPageStore } from '@/services/my-page/store/my-account-page-store';

const myAccountPageStore = useMyAccountPageStore();
const myAccountPageState = myAccountPageStore.$state;

const state = reactive({
    userType: computed(() => store.state.user.backend),
    verified: computed(() => store.state.user.emeilVerified),
    userId: computed(() => store.state.user.userId),
    email: computed(() => store.state.user.email),
    domainId: computed(() => store.state.domain.domainId),
});
const formState = reactive({
    notificationEmail: '',
});
const validationState = reactive({
    isNotificationEmailValid: undefined as undefined | boolean,
    notificationEmailInvalidText: '' as TranslateResult | string,
});

/* Components */
const handleChangeInput = async () => {
    console.log(formState.notificationEmail);
    if (formState.notificationEmail === '') {
        validationState.isNotificationEmailValid = false;
    } else if (emailValidator(formState.notificationEmail)) {
        validationState.isNotificationEmailValid = false;
    } else {
        validationState.isNotificationEmailValid = true;
        // TODO: babel edit
        validationState.notificationEmailInvalidText = 'check format';
    }
};

/* API */
const handleClickVerifiedEmail = async () => {
    if (state.verified) {
        await myAccountPageStore.handleChangeValidationEmail(formState.notificationEmail);
    } else {
        await myAccountPageStore.postValidationEmail(
            state.userId,
            state.domainId,
            formState.notificationEmail,
        );
    }
};

/* Init */
(async () => {
    if (!state.verified) {
        if (state.userType === 'LOCAL') {
            formState.notificationEmail = state.userId;
        }
    } else {
        formState.notificationEmail = state.email;
    }
})();
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
        @apply relative flex items-center;
        margin-top: 1rem;

        .icon-edit {
            margin-right: 0.375rem;
        }

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
            padding-right: 0.75rem;
            padding-left: 0.75rem;
        }
    }
}
</style>
