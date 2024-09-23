<script setup lang="ts">
import {
    computed, reactive,
} from 'vue';

import { store } from '@/store';

import UserAccountModuleContainer from '@/services/my-page/components/UserAccountModuleContainer.vue';
import UserAccountMultiFactorAuthItems from '@/services/my-page/components/UserAccountMultiFactorAuthItems.vue';
import UserAccountMultiFactorAuthModal from '@/services/my-page/components/UserAccountMultiFactorAuthModal.vue';
import type { MultiFactorAuthModalType } from '@/services/my-page/types/multi-factor-auth-type';
import { MULTI_FACTOR_AUTH_MODAL_TYPE } from '@/services/my-page/types/multi-factor-auth-type';

const state = reactive({
    userId: computed(() => store.state.user.userId),
    mfa: computed(() => store.state.user.mfa || undefined),
    isVerified: computed(() => state.mfa?.state === 'ENABLED'),
});

const modalState = reactive({
    isModalVisible: false,
    modalType: MULTI_FACTOR_AUTH_MODAL_TYPE.EMAIL as MultiFactorAuthModalType,
});

const handleChangeToggle = (type: MultiFactorAuthModalType, value: boolean) => {
    modalState.isModalVisible = true;
    if (!value) {
        modalState.modalType = MULTI_FACTOR_AUTH_MODAL_TYPE.DISABLED;
    } else {
        modalState.modalType = type;
    }
};
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
                </div>
            </template>
            <user-account-multi-factor-auth-items :modal-visible="modalState.isModalVisible"
                                                  @change-toggle="handleChangeToggle"
            />
        </user-account-module-container>
        <user-account-multi-factor-auth-modal v-if="modalState.isModalVisible"
                                              :type="modalState.modalType"
                                              :verified="state.isVerified"
                                              :visible.sync="modalState.isModalVisible"
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
