<script setup lang="ts">
import {
    computed, reactive, watch,
} from 'vue';

import {
    PI, PTextInput, PFieldGroup, PToggleButton, PSelectDropdown, PFieldTitle,
} from '@spaceone/design-system';

import { store } from '@/store';
import { i18n } from '@/translations';

import { postEnableMfa } from '@/lib/helper/multi-factor-auth-helper';
import { emailValidator } from '@/lib/helper/user-validation-helper';

import { useFormValidator } from '@/common/composables/form-validator';
import VerifyButton from '@/common/modules/button/verify-button/VerifyButton.vue';

import UserAccountModuleContainer from '@/services/my-page/components/UserAccountModuleContainer.vue';
import UserAccountMultiFactorAuthModal from '@/services/my-page/components/UserAccountMultiFactorAuthModal.vue';



// Currently, only email is supported.
const contextMenuItems = [
    { label: 'Email', name: 'EMAIL' },
];

const state = reactive({
    loading: false,
    userId: computed(() => store.state.user.userId),
    domainId: computed(() => store.state.domain.domainId),
    //
    mfa: computed(() => store.state.user.mfa || undefined),
    isVerified: computed(() => state.mfa?.state === 'ENABLED'),
    enableMfa: false,
    // Currently, only email is supported.
    selectedItem: contextMenuItems[0].name,
});

const modalState = reactive({
    isModalVisible: false,
    modalType: '' as 'verify' | 'disabled' | 'change' | 'new',
});

/* Components */
const handleSelectDropdownItem = (selected: string) => {
    state.selectedItem = selected;
};
const initState = () => {
    state.enableMfa = state.mfa?.state === 'ENABLED';
};

/* API */
const handleChangeToggle = async () => {
    if (state.isVerified && !state.enableMfa) {
        modalState.isModalVisible = true;
        modalState.modalType = 'disabled';
    }
};
const handleClickVerifyButton = async () => {
    if (state.isVerified) {
        modalState.modalType = 'change';
    } else {
        state.loading = true;
        try {
            await postEnableMfa({
                user_id: state.userId,
                mfa_type: state.selectedItem,
                options: {
                    email: email.value,
                },
                domain_id: state.domainId,
            });
            modalState.modalType = 'verify';
        } finally {
            state.loading = false;
        }
    }
    modalState.isModalVisible = true;
};

const {
    forms: {
        email,
    },
    setForm,
    invalidState,
    invalidTexts,
} = useFormValidator({
    email: '',
}, {
    email(value: string) { return !emailValidator(value) ? '' : i18n.t('MY_PAGE.NOTIFICATION_EMAIL.EMAIL_INVALID'); },
});

/* Watcher */
watch(() => state.mfa, (mfa) => {
    setForm('email', mfa?.options?.email || '');
}, { immediate: true });

(() => {
    initState();
})();
</script>

<template>
    <div>
        <user-account-module-container
            class="multi-factor-authentication-wrapper"
        >
            <template #headline>
                <div class="headline-wrapper">
                    <p class="form-title">
                        {{ $t('MY_PAGE.MFA.TITLE') }}
                    </p>
                    <div v-if="state.enableMfa"
                         class="verify-status-wrapper"
                    >
                        <div v-if="state.isVerified"
                             class="verified"
                        >
                            <p-i name="ic_verified"
                                 height="1rem"
                                 width="1rem"
                                 class="verified-icon"
                                 color="#60B731"
                            />
                            <span>
                                {{ $t('MY_PAGE.MFA.STATE_VERIFIED') }}
                            </span>
                        </div>
                        <span v-else
                              class="not-verified"
                        >
                            {{ $t('MY_PAGE.MFA.STATE_NOT_VERIFIED') }}
                        </span>
                    </div>
                </div>
            </template>
            <div class="enable-toggle">
                <p-field-title class="toggle-title">
                    {{ $t('MY_PAGE.MFA.ENABLE_MFA') }}
                </p-field-title>
                <p-toggle-button :value.sync="state.enableMfa"
                                 show-state-text
                                 position="left"
                                 @change-toggle="handleChangeToggle"
                />
            </div>
            <div v-if="state.enableMfa"
                 class="enable-mfa-wrapper"
            >
                <p-field-group
                    :label="$t('MY_PAGE.MFA.TYPE')"
                    required
                >
                    <p-select-dropdown :menu="contextMenuItems"
                                       :selected="state.selectedItem"
                                       class="type-dropdown"
                                       @update:selected="handleSelectDropdownItem"
                    />
                </p-field-group>
                <p-field-group
                    :invalid="invalidState.email"
                    :invalid-text="invalidTexts.email"
                    required
                    class="email-input"
                >
                    <p-text-input :value="email"
                                  :disabled="state.isVerified"
                                  :invalid="invalidState.email"
                                  is-focused
                                  block
                                  @update:value="setForm('email', $event)"
                    />
                </p-field-group>
                <verify-button
                    :loading="state.loading"
                    :email="email"
                    :verified="state.isVerified"
                    class="verify-button"
                    @click-button="handleClickVerifyButton"
                />
            </div>
        </user-account-module-container>
        <user-account-multi-factor-auth-modal v-if="modalState.isModalVisible"
                                              :type="modalState.modalType"
                                              :email="email"
                                              :verified="state.isVerified"
                                              :mfa-type="state.selectedItem"
                                              :visible.sync="modalState.isModalVisible"
                                              @refresh="initState"
        />
    </div>
</template>

<style lang="postcss" scoped>
.multi-factor-authentication-wrapper {
    @apply flex flex-col;
    margin-top: 1rem;
    gap: 1.5rem;
    .headline-wrapper {
        @apply flex items-center;
        .form-title {
            @apply text-display-md;
            margin-bottom: 0;
        }
        .verify-status-wrapper {
            margin-left: 0.5rem;
            .verified {
                @apply flex items-center text-label-md text-green-600;
                gap: 0.25rem;
            }
            .not-verified {
                @apply bg-yellow-200 text-label-sm;
                padding: 0.15rem 0.5rem;
                border-radius: 6.25rem;
            }
        }
    }
    .enable-toggle {
        @apply flex items-center;
        gap: 1rem;
    }
    .enable-mfa-wrapper {
        @apply flex items-end;
        max-width: 47.5rem;
        margin-bottom: 1rem;
        .type-dropdown {
            min-width: 13rem;
        }
        .email-input {
            flex: 1;
            margin-left: 1rem;
        }
    }

    .verify-button {
        @apply flex items-end;
    }
}

/* custom design-system component - p-field-group */
:deep(.p-field-group) {
    @apply relative;
    margin-bottom: 0;
    .invalid-feedback {
        @apply absolute;
        bottom: -1.125rem;
        left: 0;
    }
}
</style>
