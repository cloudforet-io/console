<template>
    <div class="notification-email-form-wrapper">
        <p-field-group v-if="!state.isSent"
                       :label="$t('IDENTITY.USER.FORM.NOTIFICATION_EMAIL')"
                       :invalid="invalidState.email"
                       :invalid-text="invalidTexts.email"
                       class="input-form-view"
        >
            <template #default="{invalid}">
                <div class="input-form">
                    <p-text-input :value="email"
                                  :invalid="invalid"
                                  :placeholder="store.state.user.userId"
                                  :disabled="userPageState.visibleUpdateModal && !state.isEdit"
                                  class="text-input"
                                  @update:value="handleChangeInput($event)"
                    />
                    <div v-if="userPageState.visibleUpdateModal">
                        <p-button v-if="!state.isEdit"
                                  style-type="tertiary"
                                  @click="handleClickChange"
                        >
                            <p-i name="ic_edit"
                                 height="1rem"
                                 width="1rem"
                                 class="edit-icon"
                                 color="inherit transparent"
                            />
                            <span>{{ $t('IDENTITY.USER.ACCOUNT.NOTIFICATION_EMAIL.CHANGE') }}</span>
                        </p-button>
                        <p-button v-else
                                  style-type="tertiary"
                                  class="send-mail-button"
                                  :loading="state.loading"
                                  @click="handleClickSend"
                        >
                            <p-i name="ic_paper-airplane"
                                 height="1rem"
                                 width="1rem"
                                 class="send-icon"
                                 color="inherit transparent"
                            />
                            <span>{{ $t('IDENTITY.USER.ACCOUNT.NOTIFICATION_EMAIL.SEND_MAIL') }}</span>
                        </p-button>
                    </div>
                </div>
            </template>
            <template #label-extra>
                <p-tooltip
                    position="bottom"
                    :contents="$t('IDENTITY.USER.FORM.NOTIFICATION_TOOLTIP')"
                    class="tooltip"
                >
                    <p-i name="ic_question-mark-circle-filled"
                         height="0.875rem"
                         width="0.875rem"
                         color="inherit transparent"
                         class="tooltip-icon"
                    />
                </p-tooltip>
            </template>
        </p-field-group>
        <div v-else>
            <div class="contents-wrapper">
                <div>
                    <p>{{ $t('COMMON.NOTIFICATION_MODAL.SENT_DESC') }}</p>
                    <div class="email-wrapper">
                        <p-i name="ic_envelope-filled"
                             height="0.875rem"
                             width="0.875rem"
                             color="inherit"
                        />
                        <p class="email-text">
                            {{ email }}
                        </p>
                    </div>
                </div>
                <p-icon-button name="ic_edit"
                               size="md"
                               class="edit-icon"
                               @click="handleEditButton"
                />
            </div>
            <p-field-group :label="$t('COMMON.NOTIFICATION_MODAL.VERIFICATION_CODE')"
                           :invalid="validationState.isValidationCodeValid"
                           :invalid-text="validationState.validationCodeInvalidText"
                           class="input-form-view"
            >
                <div class="input-form">
                    <p-text-input id="verificationCode"
                                  :value="verificationCode"
                                  :invalid="validationState.isValidationCodeValid"
                                  @update:value="setForm('verificationCode', $event)"
                    />
                    <p-button style-type="positive"
                              :loading="state.loading"
                              @click="handleChangeVerify"
                    >
                        <span>{{ $t('IDENTITY.USER.ACCOUNT.NOTIFICATION_EMAIL.VERIFY') }}</span>
                    </p-button>
                </div>
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
                              @click.prevent="handleClickSend"
                    >
                        <span class="emphasis">{{ $t('COMMON.NOTIFICATION_MODAL.SEND_NEW_CODE') }}</span>
                    </p-button>
                </p>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import {
    computed, reactive, watch,
} from 'vue';
import type { TranslateResult } from 'vue-i18n';

import {
    PFieldGroup, PTextInput, PTooltip, PI, PButton, PCollapsibleToggle, PIconButton,
} from '@spaceone/design-system';

import { store } from '@/store';
import { i18n } from '@/translations';

import { emailValidator } from '@/lib/helper/user-validation-helper';
import { postValidationCode, postValidationEmail } from '@/lib/helper/verify-email-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useFormValidator } from '@/common/composables/form-validator';

import type { User } from '@/services/administration/iam/user/type';
import { useUserPageStore } from '@/services/administration/store/user-page-store';

interface Props {
    item?: User;
    email?: string;
    isValidEmail?: boolean;
}
const props = withDefaults(defineProps<Props>(), {
    item: undefined,
    email: undefined,
    isValidEmail: false,
});

const userPageStore = useUserPageStore();
const userPageState = userPageStore.$state;

const emit = defineEmits(['change-input', 'change-verify']);

const state = reactive({
    loading: false,
    isEdit: false,
    isSent: false,
    isCollapsed: true,
    loginUserId: computed(() => store.state.user.userId),
});
const {
    forms,
    setForm,
    invalidState,
    invalidTexts,
} = useFormValidator({
    email: '' || props.email,
    verificationCode: '',
}, {
    email(value: string) { return !emailValidator(value) ? '' : i18n.t('IDENTITY.USER.FORM.EMAIL_INVALID'); },
});
const { email, verificationCode } = forms;

const validationState = reactive({
    isValidationCodeValid: undefined as undefined | boolean,
    validationCodeInvalidText: '' as TranslateResult | string,
});

/* Components */
const handleChangeInput = (e) => {
    setForm('email', e);
    emit('change-input', { ...forms, email: email.value });
};
const handleClickChange = () => {
    if (!state.isEdit) {
        state.isEdit = true;
    }
};
const initForm = () => {
    setForm('email', props.item.email || '');
};
const handleEditButton = () => {
    state.isSent = false;
    state.isEdit = true;
};

/* API */
const handleClickSend = async () => {
    state.loading = true;
    try {
        await postValidationEmail({
            user_id: props.item.user_id,
            email: email.value,
            domain_id: props.item.domain_id,
        });
        emit('change-verify', false);

        if (state.loginUserId === props.item.user_id) {
            await store.dispatch('user/setUser', { email: email.value });
        }
        state.isSent = true;
    } catch (e) {
        ErrorHandler.handleError(e);
    } finally {
        state.loading = false;
    }
};
const handleChangeVerify = async () => {
    state.loading = true;
    try {
        await postValidationCode({
            user_id: props.item.user_id,
            domain_id: props.item.domain_id,
            code: verificationCode.value,
        }, state.loginUserId === props.item.user_id);
        if (userPageState.visibleUpdateModal) {
            state.isSent = false;
            state.isEdit = false;
            state.isCollapsed = true;
            emit('change-verify', true);
        }
    } catch (e) {
        validationState.isValidationCodeValid = true;
        validationState.validationCodeInvalidText = i18n.t('COMMON.NOTIFICATION_MODAL.INVALID_CODE');
    } finally {
        state.loading = false;
    }
};

/* Init */
(async () => {
    if (userPageState.visibleUpdateModal) {
        await initForm();
    }
})();

watch(() => props.email, (value) => {
    setForm('email', value);
});
watch(() => props.isValidEmail, (value) => {
    state.isEdit = !value;
}, { immediate: true });
</script>

<style lang="postcss" scoped>
.notification-email-form-wrapper {
    @apply flex flex-col bg-white rounded-lg;
    padding: 0.75rem;
    gap: 1rem;
    .input-form-view {
        .input-form {
            @apply flex;
            gap: 0.5rem;

            /* custom design-system component - p-button */
            :deep(.p-button) {
                padding-right: 0.75rem;
                padding-left: 0.75rem;
                &.send-mail-button {
                    min-width: initial;
                    .send-icon {
                        @apply text-gray-900;
                        margin-right: 0.25rem;
                    }
                }
            }
            .edit-icon {
                margin-right: 0.25rem;
            }
        }
        .tooltip {
            margin-left: 0.25rem;
            .tooltip-icon {
                @apply text-gray-300;
            }
        }
    }
    .p-field-group {
        margin-bottom: 0;

        /* custom design-system component - p-text-input */
        :deep(.p-text-input) {
            width: 100%;
        }
    }
    .contents-wrapper {
        @apply flex justify-between bg-gray-100 rounded text-label-md text-gray-700;
        margin-bottom: 1rem;
        padding: 0.5rem;
        .email-wrapper {
            @apply flex items-center font-bold;
            gap: 0.375rem;
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
</style>
