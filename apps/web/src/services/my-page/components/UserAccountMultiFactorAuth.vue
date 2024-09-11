<script setup lang="ts">
import {
    computed, reactive,
} from 'vue';

import { store } from '@/store';

import UserAccountModuleContainer from '@/services/my-page/components/UserAccountModuleContainer.vue';
import UserAccountMultiFactorAuthItems from '@/services/my-page/components/UserAccountMultiFactorAuthItems.vue';
import UserAccountMultiFactorAuthModal from '@/services/my-page/components/UserAccountMultiFactorAuthModal.vue';

const state = reactive({
    userId: computed(() => store.state.user.userId),
    mfa: computed(() => store.state.user.mfa || undefined),
    isVerified: computed(() => state.mfa?.state === 'ENABLED'),
});

const modalState = reactive({
    isModalVisible: false,
    modalType: '' as 'confirm' | 'form',
});

// const handleClickVerifyButton = async () => {
//     if (state.isVerified) {
//         modalState.modalType = 'change';
//     } else {
//         state.loading = true;
//         try {
//             await postEnableMfa({
//                 mfa_type: state.selectedItem,
//                 options: {
//                     email: email.value,
//                 },
//             }, true);
//             modalState.modalType = 'verify';
//         } finally {
//             state.loading = false;
//         }
//     }
//     modalState.isModalVisible = true;
// };

// const {
//     forms: {
//         email,
//     },
//     setForm,
//     invalidState,
//     invalidTexts,
// } = useFormValidator({
//     email: '',
// }, {
//     email(value: string) { return !emailValidator(value) ? '' : i18n.t('MY_PAGE.NOTIFICATION_EMAIL.EMAIL_INVALID'); },
// });
//
// /* Watcher */
// watch(() => state.mfa, (mfa) => {
//     setForm('email', mfa?.options?.email || '');
// }, { immediate: true });
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
            <user-account-multi-factor-auth-items />
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
