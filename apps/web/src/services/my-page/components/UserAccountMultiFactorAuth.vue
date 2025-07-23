<script setup lang="ts">
import { computed, onUnmounted } from 'vue';

import { useUserStore } from '@/store/user/user-store';

import InfoTooltip from '@/common/components/info-tooltip/InfoTooltip.vue';

import { blue } from '@/styles/colors';

import UserAccountMultiFactorAuthEmailDisableModal from '@/services/my-page/components/mfa/UserAccountMultiFactorAuthEmailDisableModal.vue';
import UserAccountMultiFactorAuthEmailEnableModal from '@/services/my-page/components/mfa/UserAccountMultiFactorAuthEmailEnableModal.vue';
import UserAccountMultiFactorAuthOTPDisableModal from '@/services/my-page/components/mfa/UserAccountMultiFactorAuthOTPDisableModal.vue';
import UserAccountMultiFactorAuthOTPEnableModal from '@/services/my-page/components/mfa/UserAccountMultiFactorAuthOTPEnableModal.vue';
import UserAccountModuleContainer from '@/services/my-page/components/UserAccountModuleContainer.vue';
import UserAccountMultiFactorAuthItems from '@/services/my-page/components/UserAccountMultiFactorAuthItems.vue';
import { useMultiFactorAuthStore } from '@/services/my-page/stores/multi-factor-auth-store';



interface Props {
    readonlyMode?: boolean;
}

const props = defineProps<Props>();

const multiFactorAuthStore = useMultiFactorAuthStore();
const multiFactorAuthModalState = multiFactorAuthStore.modalState;

const userStore = useUserStore();

const isMFAEnforced = computed<boolean>(() => !!userStore.state.mfa?.options?.enforce);

onUnmounted(() => {
    multiFactorAuthStore.initState();
});
</script>

<template>
    <user-account-module-container
        class="user-account-multi-factor-auth"
    >
        <template #headline>
            <div class="headline-wrapper flex items-center gap-2">
                <span class="form-title text-display-md m-0">
                    {{ $t('MY_PAGE.MFA.TITLE') }}
                </span>
                <div v-if="isMFAEnforced"
                     class="inline-flex items-center gap-1"
                >
                    <info-tooltip :tooltip-contents="$t('AUTH.MFA.ENFORCE_INFO_TEXT')"
                                  width="1rem"
                                  height="1rem"
                                  :color="blue[600]"
                    />
                    <span class="text-label-sm text-blue-600">
                        {{ $t('AUTH.MFA.REQUIRED_BY_ADMIN') }}
                    </span>
                </div>
            </div>
        </template>
        <user-account-multi-factor-auth-items :readonly-mode="props.readonlyMode" />

        <user-account-multi-factor-auth-o-t-p-enable-modal v-if="multiFactorAuthModalState.OTPEnableModalVisible" />
        <user-account-multi-factor-auth-o-t-p-enable-modal v-if="multiFactorAuthModalState.OTPReSyncModalVisible"
                                                           re-sync
        />
        <user-account-multi-factor-auth-o-t-p-disable-modal v-if="multiFactorAuthModalState.OTPDisableModalVisible" />
        <user-account-multi-factor-auth-o-t-p-disable-modal v-if="multiFactorAuthModalState.OTPSwitchModalVisible"
                                                            switch
        />
        <user-account-multi-factor-auth-email-enable-modal v-if="multiFactorAuthModalState.emailEnableModalVisible" />
        <user-account-multi-factor-auth-email-enable-modal v-if="multiFactorAuthModalState.emailReSyncModalVisible"
                                                           re-sync
        />
        <user-account-multi-factor-auth-email-disable-modal v-if="multiFactorAuthModalState.emailDisableModalVisible" />
        <user-account-multi-factor-auth-email-disable-modal v-if="multiFactorAuthModalState.emailSwitchModalVisible"
                                                            switch
        />
    </user-account-module-container>
</template>

<style lang="postcss" scoped>
.user-account-multi-factor-auth {
    @apply flex flex-col;
    padding: 1.5rem 1rem 2.5rem;
    gap: 1.5rem;
}

/* custom design-system component - p-field-group */
:deep(.p-field-group) {
    margin-bottom: 0;
}
</style>
