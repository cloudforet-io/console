<template>
    <p-button-modal
        :visible="state.proxyVisible"
        header-title="Verify Notification Email"
        class="notification-email-modal-wrapper"
        @confirm="onClickConfirm"
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
                               required
                >
                    <p-text-input :value="formState.verificationCode" />
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
                                  @click="handleClickNewCode"
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

import {
    PButton,
    PButtonModal,
    PCollapsibleToggle,
    PFieldGroup,
    PI,
    PIconButton,
    PTextInput,
} from '@spaceone/design-system';

import { useProxyValue } from '@/common/composables/proxy-state';

import { useMyAccountPageStore } from '@/services/my-page/store/my-account-page-store';


interface Props {
    visible: boolean
}
const props = withDefaults(defineProps<Props>(), {
    visible: false,
});

const myAccountPageStore = useMyAccountPageStore();
const myAccountPageState = myAccountPageStore.$state;

const emit = defineEmits(['visible']);

const state = reactive({
    isCollapsed: true,
    isEditMode: false,
    proxyVisible: useProxyValue('visible', props, emit),
});
const formState = reactive({
    newNotificationEmail: '' as string | undefined,
    verificationCode: '' as string | undefined,
});
const handleEditButton = () => {
    state.isEditMode = true;
};
const handleClickSendButton = () => {
    console.log(formState.newNotificationEmail);
};
const onClickConfirm = () => {
    console.log('confirm!!!!!!');
    state.proxyVisible = false;
};
const handleClickNewCode = () => {
    console.log('???');
    // myAccountPageStore.sendValidationEmail(userId, notificationEmail);
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
