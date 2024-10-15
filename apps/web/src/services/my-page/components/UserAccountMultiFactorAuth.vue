<script setup lang="ts">
import {
    reactive,
} from 'vue';

import UserAccountModuleContainer from '@/services/my-page/components/UserAccountModuleContainer.vue';
import UserAccountMultiFactorAuthFormModal from '@/services/my-page/components/UserAccountMultiFactorAuthFormModal.vue';
import UserAccountMultiFactorAuthItems from '@/services/my-page/components/UserAccountMultiFactorAuthItems.vue';
import type { MultiFactorAuthModalDataType } from '@/services/my-page/types/multi-factor-auth-type';

const modalState = reactive({
    isModalVisible: false,
    modalData: {} as MultiFactorAuthModalDataType,
});

const handleModalType = (data: MultiFactorAuthModalDataType) => {
    modalState.isModalVisible = true;
    modalState.modalData = data;
};
</script>

<template>
    <div class="user-account-multi-factor-auth">
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
                                                  @handle-modal="handleModalType"
            />
        </user-account-module-container>
        <user-account-multi-factor-auth-form-modal v-if="modalState.isModalVisible"
                                                   :data="modalState.modalData"
                                                   :visible.sync="modalState.isModalVisible"
        />
    </div>
</template>

<style lang="postcss" scoped>
.user-account-multi-factor-auth {
    margin-top: 1rem;
    .multi-factor-authentication-wrapper {
        @apply flex flex-col;
        gap: 1.5rem;
        .headline-wrapper {
            @apply flex items-center;
            .form-title {
                @apply text-display-md;
                margin-bottom: 0;
            }
        }
    }
}

/* custom design-system component - p-field-group */
:deep(.p-field-group) {
    margin-bottom: 0;
}
</style>
