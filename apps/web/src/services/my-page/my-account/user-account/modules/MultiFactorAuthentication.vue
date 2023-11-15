<script setup lang="ts">
import {
    computed, reactive,
} from 'vue';

import {
    PI, PTextInput, PFieldGroup, PToggleButton, PSelectDropdown, PFieldTitle,
} from '@spaceone/design-system';

import { store } from '@/store';
import { i18n } from '@/translations';

import { emailValidator } from '@/lib/helper/user-validation-helper';

import { useFormValidator } from '@/common/composables/form-validator';
import VerifyButton from '@/common/modules/button/verify-button/VerifyButton.vue';

import UserAccountModuleContainer
    from '@/services/my-page/my-account/user-account/modules/UserAccountModuleContainer.vue';

// Currently, only email is supported.
const contextMenuItems = [
    { label: i18n.t('IDENTITY.USER.MFA.EMAIL'), name: 'email' },
];

const state = reactive({
    disable: false,
    isVerified: computed(() => store.state.user.mfa !== undefined),
    userId: computed(() => store.state.user.userId),
    domainId: computed(() => store.state.domain.domainId),
});

const handleChangeEnableToggle = () => {
    state.disable = !state.disable;
};

const {
    forms: {
        email,
    },
    setForm,
    invalidState,
    invalidTexts,
} = useFormValidator({
    email: store.state.user.email,
}, {
    email(value: string) { return !emailValidator(value) ? '' : i18n.t('IDENTITY.USER.FORM.EMAIL_INVALID'); },
});
</script>

<template>
    <user-account-module-container
        class="multi-factor-authentication-wrapper"
    >
        <template #headline>
            <div class="headline-wrapper">
                <p class="form-title">
                    {{ $t('IDENTITY.USER.MFA.TITLE') }}
                </p>
                <div class="verify-status-wrapper">
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
                            {{ $t('IDENTITY.USER.MFA.VERIFIED') }}
                        </span>
                    </div>
                    <span v-else
                          class="not-verified"
                    >
                        {{ $t('IDENTITY.USER.MFA.NOT_VERIFIED') }}
                    </span>
                </div>
            </div>
        </template>
        <div class="enable-toggle">
            <p-field-title class="toggle-title">
                {{ $t('IDENTITY.USER.MFA.ENABLE_MFA') }}
            </p-field-title>
            <p-toggle-button :value="!state.disable"
                             show-state-text
                             position="left"
                             @change-toggle="handleChangeEnableToggle"
            />
        </div>
        <form v-if="!state.disable"
              class="form"
              onsubmit="return false"
        >
            <p-field-group
                :label="$t('IDENTITY.USER.MFA.TYPE')"
                required
                class="field-group"
            >
                <p-select-dropdown :menu="contextMenuItems"
                                   :selected="contextMenuItems[0].name"
                                   class="type-dropdown"
                />
            </p-field-group>
            <p-field-group
                :invalid="invalidState.email"
                :invalid-text="invalidTexts.email"
                required
                class="field-group input-form"
            >
                <p-text-input v-model="email"
                              :placeholder="state.userId"
                              :disabled="state.isVerified"
                              :invalid="invalidState.email"
                              block
                              @update:value="setForm('email', $event)"
                />
            </p-field-group>
            <verify-button
                :email="email"
                :user-id="state.userId"
                :domain-id="state.domainId"
                :verified="state.isVerified"
            />
        </form>
    </user-account-module-container>
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
    .form {
        @apply flex items-end;
        max-width: 47.5rem;
        .type-dropdown {
            min-width: 13rem;
        }
        .input-form {
            flex: 1;
            max-width: 21.125rem;
            margin-left: 1rem;
        }
    }
}
</style>
