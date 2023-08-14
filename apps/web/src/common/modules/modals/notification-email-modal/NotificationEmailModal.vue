<script lang="ts" setup>
import { LocalStorageAccessor } from '@cloudforet/core-lib/local-storage-accessor';
import {
    PButton,
    PButtonModal,
    PCollapsibleToggle,
    PFieldGroup,
    PI,
    PTextInput,
} from '@spaceone/design-system';
import {
    computed, reactive, watch,
} from 'vue';
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';

import { postValidationCode, postValidationEmail } from '@/lib/helper/verify-email-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useProxyValue } from '@/common/composables/proxy-state';
import { MODAL_TYPE } from '@/common/modules/modals/notification-email-modal/type';


interface Props {
    domainId: string
    userId: string
    visible: boolean
    email?: string
    modalType?: string
}

const props = withDefaults(defineProps<Props>(), {
    domainId: '',
    userId: '',
    visible: false,
    email: '',
    modalType: '',
});

const emit = defineEmits(['visible', 'refresh-user']);
const store = useStore();
const { t } = useI18n();

const state = reactive({
    loading: false,
    isCollapsed: true,
    loginUserId: computed(() => store.state.user.userId),
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
    validationCodeInvalidText: '' as string,
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
        await postValidationEmail({
            user_id: props.userId,
            domain_id: props.domainId,
            email: formState.newNotificationEmail,
        });
        if (state.loginUserId === props.userId) {
            await store.dispatch('user/setUser', { email: formState.newNotificationEmail, email_verified: false });
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
            user_id: props.userId,
            domain_id: props.domainId,
            code: formState.verificationCode,
        }, state.loginUserId === props.userId);
        emit('refresh-user');
        state.proxyVisible = false;
        resetFormData();
    } catch (e) {
        validationState.isValidationCodeValid = true;
        validationState.validationCodeInvalidText = t('COMMON.NOTIFICATION_MODAL.INVALID_CODE');
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

<template>
    <p-button-modal
        v-if="state.proxyModalType === MODAL_TYPE.SEND"
        :header-title="t('COMMON.NOTIFICATION_MODAL.ENTER_EMAIL')"
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
                    {{ t('IDENTITY.USER.ACCOUNT.NOTIFICATION_EMAIL.HELP_TEXT') }}
                </p>
                <p-field-group :label="t('IDENTITY.USER.ACCOUNT.NOTIFICATION_EMAIL.TITLE')"
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
            {{ t('IDENTITY.USER.ACCOUNT.NOTIFICATION_EMAIL.SEND_MAIL') }}
        </template>
    </p-button-modal>
    <p-button-modal
        v-else
        :visible="state.proxyVisible"
        :header-title="t('COMMON.NOTIFICATION_MODAL.TITLE')"
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
                        <p>{{ t('COMMON.NOTIFICATION_MODAL.SENT_DESC') }}</p>
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
                <p-field-group :label="t('COMMON.NOTIFICATION_MODAL.VERIFICATION_CODE')"
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
                                          v-model:isCollapsed="state.isCollapsed"
                    >
                        {{ t('COMMON.NOTIFICATION_MODAL.COLLAPSE_TITLE') }}
                    </p-collapsible-toggle>
                    <p v-if="!state.isCollapsed"
                       class="collapsed-contents"
                    >
                        {{ t('COMMON.NOTIFICATION_MODAL.COLLAPSE_DESC') }}
                        <p-button class="send-code-button"
                                  @click.prevent="handleClickSendEmailButton"
                        >
                            <span class="emphasis">{{ t('COMMON.NOTIFICATION_MODAL.SEND_NEW_CODE') }}</span>
                        </p-button>
                    </p>
                </div>
            </div>
        </template>
        <template #confirm-button>
            {{ t('COMMON.NOTIFICATION_MODAL.VERIFY_NOW') }}
        </template>
    </p-button-modal>
</template>

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

</style>
