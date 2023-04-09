<template>
    <div class="notification-email-form-wrapper">
        <p-field-group :label="$t('IDENTITY.USER.FORM.NOTIFICATION_EMAIL')"
                       :invalid="validationState.isEmailValid === false"
                       :invalid-text="validationState.emailInvalidText"
                       class="input-form-view"
        >
            <template #default="{invalid}">
                <div class="input-form">
                    <p-text-input v-model="formState.email"
                                  :invalid="invalid"
                                  :placeholder="store.state.user.userId"
                                  :disabled="userPageState.visibleUpdateModal"
                                  class="text-input"
                                  @update:value="handleChangeInput"
                    />
                    <p-button v-if="userPageState.visibleUpdateModal"
                              style-type="tertiary"
                    >
                        <p-i name="ic_edit"
                             height="1rem"
                             width="1rem"
                             class="edit-icon"
                             color="inherit transparent"
                        />
                        <span>{{ $t('IDENTITY.USER.ACCOUNT.NOTIFICATION_EMAIL.CHANGE') }}</span>
                    </p-button>
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
import { reactive } from 'vue';
import type { TranslateResult } from 'vue-i18n';

import {
    PFieldGroup, PTextInput, PTooltip, PI, PButton,
} from '@spaceone/design-system';

import { store } from '@/store';

import { useUserPageStore } from '@/services/administration/store/user-page-store';

const userPageStore = useUserPageStore();
const userPageState = userPageStore.$state;

const emit = defineEmits<{(e: 'change-input', formState): void}>();

const formState = reactive({
    email: '',
});
const validationState = reactive({
    isEmailValid: undefined as undefined | boolean,
    emailInvalidText: '' as TranslateResult | string,
});

/* Components */
const handleChangeInput = () => {
    emit('change-input', formState);
};
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
}
</style>
