<template>
    <p-button-modal
        :visible="myAccountPageState.isModalVisible"
        header-title="Verify Notification Email"
        class="notification-email-modal-wrapper"
        @confirm="onClickConfirm"
        @cancel="handleClickCancel"
    >
        <template #body>
            <div class="modal-content-wrapper">
                <div v-if="state.isEditMode">
                    <p-field-group label="Notification Email"
                                   required
                    >
                        <div class="notification-field-wrapper">
                            <p-text-input
                                v-model="formState.newNotificationEmail"
                                :invalid="validationState.isNewNotificationEmailValid"
                            />
                            <p-button style-type="secondary"
                                      :disabled="formState.newNotificationEmail === ''"
                                      @click.prevent="handleClickSendButton"
                            >
                                Send Code
                            </p-button>
                        </div>
                    </p-field-group>
                </div>
                <div v-else
                     class="sent-email-wrapper"
                >
                    <div class="contents-wrapper">
                        <p>A verification code has been sent to</p>
                        <div class="email-wrapper">
                            <p-i name="ic_envelope-filled"
                                 height="0.875rem"
                                 width="0.875rem"
                                 color="inherit"
                            />
                            <p class="email-tex">
                                {{ myAccountPageState.email }}
                            </p>
                        </div>
                    </div>
                    <p-icon-button name="ic_edit"
                                   size="sm"
                                   class="edit-icon"
                                   @click="handleEditButton"
                    />
                </div>
                <p-field-group label="Verification Code"
                               :invalid="validationState.isValidationCodeValid"
                               :invalid-text="validationState.validationCodeInvalidText"
                               required
                >
                    <p-text-input v-model="formState.verificationCode"
                                  :invalid="validationState.isValidationCodeValid"
                    />
                </p-field-group>
                <div class="collapsible-wrapper">
                    <p-collapsible-toggle v-if="state.isCollapsed"
                                          v-model="state.isCollapsed"
                    >
                        Didn't get a verification code?
                    </p-collapsible-toggle>
                    <p v-if="!state.isCollapsed"
                       class="collapsed-contents"
                    >
                        Check your junk mail folder or wait a few minutes. if you're still having trouble.
                        <p-button class="send-code-button"
                                  @click.prevent="handleClickNewCode"
                        >
                            <span class="emphasis">Send new code</span>
                        </p-button>
                    </p>
                </div>
            </div>
        </template>
    </p-button-modal>
</template>

<script lang="ts" setup>
import { reactive } from 'vue';
import type { TranslateResult } from 'vue-i18n';

import {
    PButton,
    PButtonModal,
    PCollapsibleToggle,
    PFieldGroup,
    PI,
    PIconButton,
    PTextInput,
} from '@spaceone/design-system';

import { useMyAccountPageStore } from '@/services/my-page/store/my-account-page-store';

const myAccountPageStore = useMyAccountPageStore();
const myAccountPageState = myAccountPageStore.$state;

const state = reactive({
    isCollapsed: true,
    isEditMode: false,
});
const formState = reactive({
    newNotificationEmail: '',
    verificationCode: '',
});
const validationState = reactive({
    showValidation: false,
    isNewNotificationEmailValid: undefined as undefined | boolean,
    isValidationCodeValid: undefined as undefined | boolean,
    validationCodeInvalidText: '' as TranslateResult | string,
});

const checkNotificationEmail = async () => {
    const regex = /\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/;
    if (formState.newNotificationEmail) {
        validationState.isNewNotificationEmailValid = regex.test(formState.newNotificationEmail);
    } else validationState.isNewNotificationEmailValid = true;
};
const handleEditButton = () => {
    state.isEditMode = true;
};
const handleClickSendButton = async () => {
    await checkNotificationEmail();
    if (!validationState.isNewNotificationEmailValid) return;
    await myAccountPageStore.postValidationEmail(myAccountPageState.userId, formState.newNotificationEmail);
};
const handleClickNewCode = () => {
    myAccountPageStore.postValidationEmail(myAccountPageState.userId, myAccountPageState.email);
};
const handleClickCancel = () => {
    myAccountPageStore.closeModal();
    handleReset();
};
const onClickConfirm = async () => {
    try {
        await myAccountPageStore.postValidationCode(formState.verificationCode);
        handleReset();
        // showSuccessMessage(i18n.t('MONITORING.ALERT.DETAIL.HEADER.ALT_S_ASSIGN_MEMBER'), '');
    } catch (e) {
        validationState.isValidationCodeValid = true;
        validationState.validationCodeInvalidText = 'Invalid Code';
        console.log(e);
    }
};
const handleReset = () => {
    formState.newNotificationEmail = '';
    formState.verificationCode = '';
    validationState.isNewNotificationEmailValid = false;
    validationState.isValidationCodeValid = false;
    validationState.validationCodeInvalidText = '';
};
</script>

<style lang="postcss" scoped>
.notification-email-modal-wrapper {
    .modal-content-wrapper {
        @apply flex flex-col;
        .notification-field-wrapper {
            @apply flex;
            .p-button {
                margin-left: 1rem;
            }
        }
        .p-text-input {
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
                    background: initial;
                    padding: 0;
                    margin: 0;
                }
            }
        }
    }
}

/* :deep(.p-button-modal) {
//    .modal-wrapper {
//        max-width: 30rem;
//        margin: auto;
//    }
//    .modal-footer {
//        @apply justify-end;
//        padding-top: 2.625rem;
//    }
} */

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
