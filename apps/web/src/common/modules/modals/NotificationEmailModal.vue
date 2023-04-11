<template>
    <p-button-modal
        :visible="state.proxyVisible"
        :header-title="$t('COMMON.NOTIFICATION_MODAL.TITLE')"
        class="notification-email-modal-wrapper"
        @confirm="handleClickConfirmButton"
        @cancel="handleClickCancel"
        @close="handleClickCancel"
    >
        <template #body>
            <div class="modal-content-wrapper">
                <div v-if="state.isEditMode">
                    <p-field-group :label="$t('COMMON.NOTIFICATION_MODAL.NOTIFICATION_EMAIL')"
                                   required
                    >
                        <div class="notification-field-wrapper">
                            <p-text-input
                                v-model="formState.newNotificationEmail"
                                @keyup.enter="handleClickSendEmailButton"
                            />
                            <p-button style-type="secondary"
                                      :disabled="formState.newNotificationEmail === '' || emailValidator(formState.newNotificationEmail)"
                                      :loading="state.loading"
                                      @click.prevent="handleClickSendEmailButton"
                            >
                                {{ $t('COMMON.NOTIFICATION_MODAL.SEND_CODE') }}
                            </p-button>
                        </div>
                    </p-field-group>
                </div>
                <div v-else
                     class="sent-email-wrapper"
                >
                    <div class="contents-wrapper">
                        <p>{{ $t('COMMON.NOTIFICATION_MODAL.SENT_DESC') }}</p>
                        <div class="email-wrapper">
                            <p-i name="ic_envelope-filled"
                                 height="0.875rem"
                                 width="0.875rem"
                                 color="inherit"
                            />
                            <p class="email-tex">
                                {{ state.email }}
                            </p>
                        </div>
                    </div>
                    <p-icon-button name="ic_edit"
                                   size="sm"
                                   class="edit-icon"
                                   @click="handleEditButton"
                    />
                </div>
                <p-field-group :label="$t('COMMON.NOTIFICATION_MODAL.VERIFICATION_CODE')"
                               :invalid="validationState.isValidationCodeValid"
                               :invalid-text="validationState.validationCodeInvalidText"
                               required
                >
                    <p-text-input v-model="formState.verificationCode"
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
                                  @click.prevent="handleClickSendEmailButton(true)"
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

<script lang="ts" setup>
import { computed, getCurrentInstance, reactive } from 'vue';
import type { TranslateResult } from 'vue-i18n';
import type { Vue } from 'vue/types/vue';

import {
    PButton,
    PButtonModal,
    PCollapsibleToggle,
    PFieldGroup,
    PI,
    PIconButton,
    PTextInput,
} from '@spaceone/design-system';

import { store } from '@/store';

import { emailValidator } from '@/lib/helper/user-validation-helper';
import { postValidationCode, postValidationEmail } from '@/lib/helper/verify-email-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useProxyValue } from '@/common/composables/proxy-state';

interface Props {
    domainId: string
    userId: string
    visible: boolean
}

const props = withDefaults(defineProps<Props>(), {
    domainId: '',
    userId: '',
    visible: false,
});

const vm = getCurrentInstance()?.proxy as Vue;

const emit = defineEmits<{(e: 'visible'): void}>();

const state = reactive({
    loading: false,
    isCollapsed: true,
    isEditMode: false,
    email: computed(() => store.state.user.email),
    proxyVisible: useProxyValue('visible', props, emit),
});
const formState = reactive({
    newNotificationEmail: '',
    verificationCode: '',
});
const validationState = reactive({
    isValidationCodeValid: undefined as undefined | boolean,
    validationCodeInvalidText: '' as TranslateResult | string,
});

/* Components */
const handleEditButton = () => {
    state.isEditMode = true;
};
const handleClickCancel = () => {
    state.proxyVisible = false;
    handleReset();
};
const handleReset = () => {
    formState.newNotificationEmail = '';
    formState.verificationCode = '';
    validationState.isValidationCodeValid = false;
    validationState.validationCodeInvalidText = '';
};

/* API */
const handleClickSendEmailButton = async (resend?: boolean) => {
    state.loading = true;
    try {
        await postValidationEmail({
            userId: props.userId,
            domainId: props.domainId,
            email: formState.newNotificationEmail,
        });
        if (!resend) {
            formState.newNotificationEmail = '';
        }
        state.isEditMode = false;
    } catch (e: any) {
        ErrorHandler.handleError(e);
        throw e;
    } finally {
        state.loading = false;
    }
};
const handleClickConfirmButton = async () => {
    state.loading = true;
    try {
        await postValidationCode({
            userId: props.userId,
            domainId: props.domainId,
            code: formState.verificationCode,
        });
        state.proxyVisible = false;
        handleReset();
    } catch (e) {
        validationState.isValidationCodeValid = true;
        validationState.validationCodeInvalidText = vm.$t('COMMON.NOTIFICATION_MODAL.INVALID_CODE');
    } finally {
        state.loading = false;
    }
};
</script>

<style lang="postcss" scoped>
.notification-email-modal-wrapper {
    .modal-content-wrapper {
        @apply flex flex-col;
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
