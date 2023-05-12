<template>
    <div class="notification-email-form-wrapper">
        <p-field-group :label="$t('IDENTITY.USER.FORM.NOTIFICATION_EMAIL')"
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
                    >
                        <div v-if="userPageState.visibleUpdateModal && (!state.isEdit || !state.isFocused)"
                             class="email-status-badge"
                             @click="handleClickBadge"
                        >
                            <span>{{ email }}</span>
                            <p-badge class="selected-text"
                                     badge-type="subtle"
                                     :style-type="isValidEmail ? 'green200' : 'yellow200'"
                            >
                                {{ isValidEmail
                                    ? $t('IDENTITY.USER.ACCOUNT.NOTIFICATION_EMAIL.VERIFY')
                                    : $t('IDENTITY.USER.ACCOUNT.NOTIFICATION_EMAIL.NOT_VERIFIED')
                                }}
                            </p-badge>
                        </div>
                    </p-text-input>
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
                                  :disabled="!email || invalidTexts.email !== ''"
                                  :loading="state.loading"
                                  @click="handleClickSend"
                        >
                            <span>{{ $t('IDENTITY.USER.ACCOUNT.NOTIFICATION_EMAIL.VERIFY') }}</span>
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
    </div>
</template>

<script setup lang="ts">
import {
    computed, reactive, watch,
} from 'vue';

import {
    PFieldGroup, PTextInput, PTooltip, PI, PButton, PBadge,
} from '@spaceone/design-system';

import { store } from '@/store';
import { i18n } from '@/translations';

import { emailValidator } from '@/lib/helper/user-validation-helper';
import { postValidationEmail } from '@/lib/helper/verify-email-helper';

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
    isCollapsed: true,
    isFocused: false,
    loginUserId: computed(() => store.state.user.userId),
});
const {
    forms,
    setForm,
    invalidState,
    invalidTexts,
} = useFormValidator({
    email: '' || props.email,
}, {
    email(value: string) { return !emailValidator(value) ? '' : i18n.t('IDENTITY.USER.FORM.EMAIL_INVALID'); },
});
const { email } = forms;

/* Components */
const handleChangeInput = (e) => {
    setForm('email', e);
    emit('change-input', { ...forms, email: email.value });
};
const handleClickChange = () => {
    if (!state.isEdit) {
        state.isEdit = true;
        state.isFocused = true;
        setForm('email', '');
    }
};
const handleClickBadge = () => {
    if (state.isEdit) {
        state.isFocused = true;
    }
};
const initForm = () => {
    setForm('email', props.item.email || '');
};
/* API */
const handleClickSend = async () => {
    state.loading = true;
    try {
        await postValidationEmail({
            user_id: props.item.user_id,
            email: email.value,
            force: true,
        });
        state.isEdit = false;
        emit('change-verify', true);

        if (state.loginUserId === props.item.user_id) {
            await store.dispatch('user/setUser', { email: email.value, email_verified: true });
        }
    } catch (e) {
        ErrorHandler.handleError(e);
    } finally {
        state.loading = false;
    }
};

/* Watcher */
watch(() => props.email, (value) => {
    setForm('email', value);
});
watch(() => props.isValidEmail, (value) => {
    state.isEdit = !value;
}, { immediate: true });

/* Init */
(async () => {
    if (userPageState.visibleUpdateModal) {
        await initForm();
    }
})();
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

            .email-status-badge {
                width: 100%;
            }

            /* custom design-system component - p-button */
            :deep(.p-button) {
                padding-right: 0.75rem;
                padding-left: 0.75rem;
                &.send-mail-button {
                    min-width: initial;
                    height: 2.125rem;
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

            .input-container {
                height: 2.125rem;
            }

            .tag-container {
                padding: 0;
                .p-badge {
                    margin-left: 0.5rem;
                }
            }
        }
    }
}
</style>
