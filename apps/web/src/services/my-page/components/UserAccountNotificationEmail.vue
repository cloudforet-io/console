<script setup lang="ts">
import {
    computed, reactive, watch,
} from 'vue';

import {
    PI, PTextInput, PFieldGroup, PButton, PBadge,
} from '@cloudforet/mirinae';

import { store } from '@/store';
import { i18n } from '@/translations';

import { emailValidator } from '@/lib/helper/user-validation-helper';
import { postUserProfileValidationEmail } from '@/lib/helper/verify-email-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useFormValidator } from '@/common/composables/form-validator';
import NotificationEmailModal from '@/common/modules/modals/notification-email-modal/NotificationEmailModal.vue';
import { MODAL_TYPE } from '@/common/modules/modals/notification-email-modal/type';

import UserAccountModuleContainer from '@/services/my-page/components/UserAccountModuleContainer.vue';

const state = reactive({
    authType: computed(() => store.state.user.authType),
    verified: computed(() => store.state.user.emailVerified),
    userId: computed(() => store.state.user.userId),
    loading: false,
    isModalVisible: false,
    modalType: '',
});
const {
    forms: {
        notificationEmail,
    },
    setForm,
    invalidState,
    invalidTexts,
} = useFormValidator({
    notificationEmail: '',
}, {
    notificationEmail(value: string) {
        if (!value) {
            return '';
        }
        return !emailValidator(value) ? '' : i18n.t('MY_PAGE.NOTIFICATION_EMAIL.EMAIL_INVALID');
    },
});

const handleClickVerifyButton = async (type: string) => {
    state.loading = true;
    try {
        if (state.verified) return;
        await postUserProfileValidationEmail({
            email: notificationEmail.value,
        });
        await store.dispatch('user/setUser', { email: notificationEmail });
    } catch (e: any) {
        ErrorHandler.handleError(e);
    } finally {
        state.isModalVisible = true;
        state.modalType = type;
        state.loading = false;
    }
};

/* Watcher */
watch(() => store.state.user.email, (value) => {
    let result = value;
    if (value === '') {
        if (state.authType === 'LOCAL') {
            result = state.userId;
        } else {
            result = '';
        }
    }
    setForm('notificationEmail', result);
}, { immediate: true });
</script>

<template>
    <user-account-module-container class="notification-email-wrapper">
        <template #headline>
            <div class="headline-wrapper">
                <p class="form-title">
                    {{ $t('IDENTITY.USER.NOTIFICATION_EMAIL.TITLE') }}
                </p>
                <div class="verify-status-wrapper">
                    <p-badge v-if="state.verified"
                             class="verified"
                             style-type="green200"
                             badge-type="subtle"
                    >
                        <span>{{ $t('IDENTITY.USER.NOTIFICATION_EMAIL.VERIFIED') }}</span>
                    </p-badge>
                    <p-badge v-else
                             class="not-verified"
                             style-type="yellow200"
                             badge-type="subtle"
                    >
                        <span>{{ $t('IDENTITY.USER.NOTIFICATION_EMAIL.NOT_VERIFIED') }}</span>
                    </p-badge>
                </div>
            </div>
        </template>
        <span class="help-text">
            {{ $t('IDENTITY.USER.NOTIFICATION_EMAIL.HELP_TEXT') }}
        </span>
        <form class="form"
              onsubmit="return false"
        >
            <p-field-group
                :invalid="invalidState.notificationEmail"
                :invalid-text="invalidTexts.notificationEmail"
                required
                class="field-group"
            >
                <p-text-input :value="notificationEmail"
                              :placeholder="state.userId"
                              :disabled="state.verified"
                              :invalid="invalidState.notificationEmail"
                              block
                              @update:value="setForm('notificationEmail', $event)"
                />
            </p-field-group>
            <div class="verify-button">
                <p-button v-if="state.verified"
                          style-type="tertiary"
                          :loading="state.loading"
                          size="sm"
                          @click.prevent="handleClickVerifyButton(MODAL_TYPE.SEND)"
                >
                    <p-i name="ic_edit"
                         height="1rem"
                         width="1rem"
                         color="inherit"
                         class="icon-edit"
                    />
                    {{ $t('IDENTITY.USER.NOTIFICATION_EMAIL.CHANGE') }}
                </p-button>
                <p-button v-else
                          style-type="primary"
                          :disabled="notificationEmail === '' || emailValidator(notificationEmail)"
                          :loading="state.loading"
                          size="sm"
                          @click.prevent="handleClickVerifyButton(MODAL_TYPE.VERIFY)"
                >
                    {{ $t('IDENTITY.USER.NOTIFICATION_EMAIL.VERIFY') }}
                </p-button>
            </div>
        </form>
        <notification-email-modal
            :user-id="state.userId"
            :email="notificationEmail"
            :modal-type="state.modalType"
            :visible.sync="state.isModalVisible"
        />
    </user-account-module-container>
</template>

<style lang="postcss" scoped>
.notification-email-wrapper {
    .headline-wrapper {
        @apply flex items-center;
        margin-bottom: 1.625rem;
        .form-title {
            @apply text-display-md;
            margin-bottom: 0;
        }
        .verify-status-wrapper {
            margin-left: 0.5rem;
        }
    }
    .help-text {
        @apply text-paragraph-md;
    }
    .form {
        @apply flex items-start;
        max-width: 33.625rem;
        margin-top: 1rem;

        .icon-edit {
            margin-right: 0.375rem;
        }

        /* custom design-system component - p-field-group */
        :deep(.p-field-group) {
            flex: 1;
            &.field-group {
                margin-bottom: 0;

                /* custom design-system component - p-text-input */
                :deep(.p-text-input) {
                    &::placeholder {
                        @apply text-gray-300;
                    }
                }
            }
        }
    }

    .verify-button {
        margin-top: 0.25rem;
        margin-left: 0.5rem;
    }
}
</style>
