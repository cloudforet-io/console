<template>
    <p-button-modal
        v-if="state.proxyModalType === MODAL_TYPE.SEND"
        :header-title="$t('COMMON.NOTIFICATION_MODAL.ENTER_EMAIL')"
        class="notification-email-modal-wrapper"
        :visible="state.proxyVisible"
        :loading="state.loading"
        :disabled="!formState.newNotificationEmail"
        @confirm="handleClickSendEmailButton"
        @cancel="handleClickCancel"
        @close="handleClickCancel"
    >
        <template #body>
            <div class="modal-content-wrapper">
                <p class="help-text">
                    {{ $t('IDENTITY.USER.NOTIFICATION_EMAIL.HELP_TEXT') }}
                </p>
                <p-field-group :label="$t('IDENTITY.USER.NOTIFICATION_EMAIL.TITLE')"
                               :invalid="validationState.isEmailValid"
                               required
                >
                    <div class="notification-field-wrapper">
                        <p-text-input
                            id="newNotificationEmail"
                            v-model="formState.newNotificationEmail"
                            :invalid="validationState.isEmailValid"
                            @keyup.enter="handleClickSendEmailButton"
                        />
                    </div>
                </p-field-group>
            </div>
        </template>
        <template #confirm-button>
            {{ $t('IDENTITY.USER.NOTIFICATION_EMAIL.SEND_MAIL') }}
        </template>
    </p-button-modal>
    <p-button-modal
        v-else
        :visible="state.proxyVisible"
        :header-title="$t('COMMON.NOTIFICATION_MODAL.TITLE')"
        class="notification-email-modal-wrapper"
        :disabled="!formState.verificationCode"
        @confirm="handleClickConfirmButton"
        @cancel="handleClickCancel"
        @close="handleClickCancel"
    >
        <template #body>
            <div class="modal-content-wrapper">
                <div class="sent-email-wrapper">
                    <div class="contents-wrapper">
                        <p>{{ $t('COMMON.NOTIFICATION_MODAL.SENT_DESC') }}</p>
                        <div class="email-wrapper">
                            <p-i name="ic_envelope-filled"
                                 height="0.875rem"
                                 width="0.875rem"
                                 color="inherit"
                            />
                            <p class="email-text">
                                {{ formState.newNotificationEmail || props.email }}
                            </p>
                        </div>
                    </div>
                </div>
                <p-field-group :label="$t('COMMON.NOTIFICATION_MODAL.VERIFICATION_CODE')"
                               :invalid="validationState.isValidationCodeValid"
                               :invalid-text="validationState.validationCodeInvalidText"
                               required
                >
                    <p-text-input id="verificationCode"
                                  v-model="formState.verificationCode"
                                  :invalid="validationState.isValidationCodeValid"
                                  @keyup.enter="handleClickConfirmButton"
                    />
                </p-field-group>
                <div class="collapsible-wrapper">
                    <p-collapsible-toggle v-if="state.isCollapsed"
                                          v-model="state.isCollapsed"
                    >
                        {{ $t('COMMON.NOTIFICATION_MODAL.COLLAPSE_TITLE') }}
                    </p-collapsible-toggle>
                    <p v-if="!state.isCollapsed"
                       class="collapsed-contents"
                    >
                        {{ $t('COMMON.NOTIFICATION_MODAL.COLLAPSE_DESC') }}
                        <p-button class="send-code-button"
                                  @click.prevent="handleClickSendEmailButton"
                        >
                            <span class="emphasis">{{ $t('COMMON.NOTIFICATION_MODAL.SEND_NEW_CODE') }}</span>
                        </p-button>
                    </p>
                </div>
            </div>
        </template>
        <template #confirm-button>
            {{ $t('COMMON.NOTIFICATION_MODAL.VERIFY_NOW') }}
        </template>
    </p-button-modal>
</template>

<script setup lang="ts">
import {
    computed, reactive, watch,
} from 'vue';
import type { TranslateResult } from 'vue-i18n';

import { LocalStorageAccessor } from '@cloudforet/core-lib/local-storage-accessor';
import {
    PButton,
    PButtonModal,
    PCollapsibleToggle,
    PFieldGroup,
    PI,
    PTextInput,
} from '@cloudforet/mirinae';

import { i18n } from '@/translations';

import { useUserStore } from '@/store/user/user-store';

import { postValidationCode, postUserProfileValidationEmail } from '@/lib/helper/verify-email-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useProxyValue } from '@/common/composables/proxy-state';
import { MODAL_TYPE } from '@/common/modules/modals/notification-email-modal/type';

interface Props {
    userId?: string
    visible: boolean
    email?: string
    modalType?: string
}

const props = withDefaults(defineProps<Props>(), {
    userId: '',
    visible: false,
    email: '',
    modalType: '',
});

const emit = defineEmits(['visible', 'refresh-user']);

const userStore = useUserStore();
const state = reactive({
    loading: false,
    isCollapsed: true,
    loginUserId: computed<string|undefined>(() => userStore.state.userId),
    proxyVisible: useProxyValue('visible', props, emit),
    proxyModalType: '',
});
const formState = reactive({
    newNotificationEmail: '',
    verificationCode: '',
});
const validationState = reactive({
    isEmailValid: undefined as undefined | boolean,
    isValidationCodeValid: undefined as undefined | boolean,
    validationCodeInvalidText: '' as TranslateResult | string,
});

/* Components */
const handleClickCancel = () => {
    resetFormData();
    state.proxyVisible = false;
    emit('refresh-user');
    LocalStorageAccessor.setItem('hideNotificationEmailModal', true);
};
const resetFormData = () => {
    formState.newNotificationEmail = '';
    formState.verificationCode = '';
    validationState.isValidationCodeValid = false;
    validationState.validationCodeInvalidText = '';
};

/* API */
const handleClickSendEmailButton = async () => {
    state.loading = true;
    try {
        await postUserProfileValidationEmail({
            email: formState.newNotificationEmail,
        });
        if (state.loginUserId === props.userId) {
            await userStore.updateUser({ email: formState.newNotificationEmail });
            userStore.setEmailVerified(false);
        }
        state.proxyModalType = MODAL_TYPE.VERIFY;
    } catch (error: any) {
        ErrorHandler.handleError(error);
    } finally {
        state.loading = false;
        validationState.isEmailValid = false;
    }
};
const handleClickConfirmButton = async () => {
    state.loading = true;
    try {
        await postValidationCode({
            verify_code: formState.verificationCode,
        }, userStore);
        emit('refresh-user');
        state.proxyVisible = false;
        resetFormData();
    } catch (e) {
        validationState.isValidationCodeValid = true;
        validationState.validationCodeInvalidText = i18n.t('COMMON.NOTIFICATION_MODAL.INVALID_CODE');
    } finally {
        state.loading = false;
    }
};

/* Watcher */
watch(() => state.proxyVisible, (value) => {
    if (value) {
        state.proxyModalType = props.modalType;
    }
});
</script>

<style lang="postcss" scoped>
.notification-email-modal-wrapper {
    .modal-content-wrapper {
        @apply flex flex-col;
        .help-text {
            @apply text-gray-900 text-paragraph-md;
            margin-bottom: 1rem;
        }
        .notification-field-wrapper {
            @apply flex;
            gap: 1rem;
        }
        .p-text-input {
            flex: 1;
            width: 100%;
        }

        /* custom design-system component - p-field-group */
        :deep(.p-field-group) {
            .invalid-feedback {
                position: absolute;
            }
        }
        .sent-email-wrapper {
            @apply flex justify-between items-center bg-gray-100 rounded text-label-md text-gray-700;
            padding: 0.5rem;
            margin-bottom: 1rem;
            .contents-wrapper {
                @apply flex flex-col;
                .email-wrapper {
                    @apply flex items-center font-bold;
                    gap: 0.375rem;
                }
            }
            .edit-icon {
                margin-right: 0.5rem;
            }
        }
        .collapsible-wrapper {
            margin-top: 1rem;
            .collapsed-contents {
                @apply text-paragraph-sm text-gray-500;
                .send-code-button {
                    @apply text-label-xs font-normal text-blue-700;
                    height: 1rem;
                    background: initial;
                    padding: 0;
                    margin: 0;
                    .emphasis:hover {
                        text-decoration: underline;
                    }
                }
            }
        }
    }
}

/* custom design-system component - p-button-modal */
.p-button-modal::v-deep {
    .modal-wrapper {
        max-width: 30rem;
        margin: auto;
    }
    .modal-footer {
        @apply justify-end;
        padding-top: 2.625rem;
    }
}
</style>
