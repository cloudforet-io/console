<script setup lang="ts">
import {
    computed, reactive, watch,
} from 'vue';

import {
    PFieldGroup, PTextInput, PTooltip, PI, PButton, PBadge,
} from '@cloudforet/mirinae';

import { i18n } from '@/translations';

import { useUserStore } from '@/store/user/user-store';

import { emailValidator } from '@/lib/helper/user-validation-helper';

import { useFormValidator } from '@/common/composables/form-validator';

import { useUserGetQuery } from '@/services/iam/composables/use-admin-user-get-query';
import { useUserPageStore } from '@/services/iam/store/user-page-store';



const userPageStore = useUserPageStore();
const userPageState = userPageStore.state;
const userStore = useUserStore();

const emit = defineEmits<{(e: 'change-input', formState): void,
    (e: 'change-verify', value: boolean): void,
}>();


const { data: userData, isLoading: isUserLoading } = useUserGetQuery({
    userId: computed(() => userPageState.selectedUserForForm?.user_id || ''),
});

const state = reactive({
    // data: computed<UserModel|undefined>(() => userData.value),
    loading: false,
    isEdit: false,
    isCollapsed: true,
    isFocused: false,
    isValidEmail: false,
    loginUserId: computed<string|undefined>(() => userStore.state.userId),
});
const {
    forms,
    setForm,
    invalidState,
    invalidTexts,
} = useFormValidator({
    email: '',
}, {
    email(value: string) { return !emailValidator(value) ? '' : i18n.t('IAM.USER.FORM.EMAIL_INVALID'); },
});
const { email } = forms;

/* Components */
const handleChangeInput = (value: string) => {
    state.isValidEmail = false;
    setForm('email', value);
    emit('change-input', { email: email.value });
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

/* Event */
const handleClickSend = async () => {
    state.loading = true;
    try {
        state.isEdit = false;
        state.isValidEmail = true;
        emit('change-input', { email: email.value, isValidEmail: true });
    } finally {
        state.loading = false;
    }
};

/* Watcher */
watch(() => userData.value?.email_verified, (value) => {
    state.isValidEmail = value || false;
    if (email.value) {
        state.isEdit = !value;
    } else {
        state.isEdit = true;
        state.isFocused = true;
    }
}, { immediate: true });
</script>

<template>
    <div class="notification-email-form-wrapper">
        <p-field-group :label="$t('IAM.USER.FORM.NOTIFICATION_EMAIL')"
                       :invalid="invalidState.email"
                       :invalid-text="invalidTexts.email"
                       class="input-form-view"
        >
            <template #default="{invalid}">
                <div class="input-form">
                    <!-- HACK: need to apply placeholder changes based on the distinction between open source and SaaS. -->
                    <p-text-input :value="userData?.email"
                                  :loading="isUserLoading"
                                  :invalid="invalid"
                                  placeholder="user@spaceone.io"
                                  :disabled="!state.isEdit"
                                  class="text-input"
                                  block
                                  @focusout="state.isFocused = false"
                                  @update:value="handleChangeInput"
                    >
                        <div v-if="!state.isEdit || !state.isFocused"
                             class="email-status-badge"
                             @click="handleClickBadge"
                        >
                            <span>{{ email }}</span>
                            <p-badge v-if="email"
                                     class="selected-text"
                                     badge-type="subtle"
                                     :style-type="state.isValidEmail ? 'green200' : 'yellow200'"
                            >
                                {{ state.isValidEmail
                                    ? $t('IDENTITY.USER.NOTIFICATION_EMAIL.VERIFY')
                                    : $t('IDENTITY.USER.NOTIFICATION_EMAIL.NOT_VERIFIED')
                                }}
                            </p-badge>
                        </div>
                    </p-text-input>
                    <p-button v-if="!state.isEdit"
                              style-type="tertiary"
                              size="md"
                              class="toolbox-button"
                              @click="handleClickChange"
                    >
                        <p-i name="ic_edit"
                             height="1rem"
                             width="1rem"
                             class="edit-icon"
                             color="inherit transparent"
                        />
                        <span>{{ $t('IDENTITY.USER.NOTIFICATION_EMAIL.CHANGE') }}</span>
                    </p-button>
                    <p-button v-else
                              style-type="tertiary"
                              size="md"
                              :disabled="!email || invalidTexts.email !== ''"
                              :loading="state.loading"
                              class="toolbox-button send-mail-button"
                              @click="handleClickSend"
                    >
                        <span>{{ $t('IDENTITY.USER.NOTIFICATION_EMAIL.VERIFY') }}</span>
                    </p-button>
                </div>
            </template>
            <template #label-extra>
                <p-tooltip
                    position="bottom"
                    :contents="$t('IAM.USER.FORM.NOTIFICATION_TOOLTIP')"
                    class="tooltip"
                >
                    <p-i name="ic_info-circle"
                         class="icon-info"
                         height="1rem"
                         width="1rem"
                         color="inherit"
                    />
                </p-tooltip>
            </template>
        </p-field-group>
    </div>
</template>

<style lang="postcss" scoped>
.notification-email-form-wrapper {
    @apply flex flex-col bg-white rounded-lg;
    padding: 0.75rem;
    gap: 1rem;
    .input-form-view {
        .input-form {
            @apply flex;
            width: 100%;
            height: 2rem;
            gap: 0.5rem;
            .text-input {
                flex: 1;
                height: 2rem;
                .email-status-badge {
                    @apply flex items-center;
                    width: 100%;
                    gap: 0.25rem;
                }
            }
            .toolbox-button {
                width: 6rem;
                height: 2rem;
            }
        }
        .tooltip {
            margin-left: 0.25rem;
            .icon-info {
                @apply text-gray-500;
            }
        }
    }
}

/* custom design-system component - p-text-input */
:deep(.p-text-input) {
    .input-container {
        .tag-container {
            padding: 0;
        }
    }
}
</style>
