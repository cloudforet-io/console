<script setup lang="ts">
import { onUnmounted } from 'vue';

import UserAccountModuleContainer from '@/services/my-page/components/UserAccountModuleContainer.vue';
import UserAccountMultiFactorAuthFormModal from '@/services/my-page/components/UserAccountMultiFactorAuthFormModal.vue';
import UserAccountMultiFactorAuthItems from '@/services/my-page/components/UserAccountMultiFactorAuthItems.vue';
import { useMultiFactorAuthStore } from '@/services/my-page/stores/multi-factor-auth-store';

interface Props {
    readonlyMode?: boolean;
}

const props = defineProps<Props>();

const multiFactorAuthStore = useMultiFactorAuthStore();
const multiFactorAuthState = multiFactorAuthStore.state;

onUnmounted(() => {
    multiFactorAuthStore.initState();
});
</script>

<template>
    <user-account-module-container
        class="user-account-multi-factor-auth"
    >
        <template #headline>
            <div class="headline-wrapper">
                <p class="form-title">
                    {{ $t('MY_PAGE.MFA.TITLE') }}
                </p>
            </div>
        </template>
        <user-account-multi-factor-auth-items :readonly-mode="props.readonlyMode" />
        <user-account-multi-factor-auth-form-modal v-if="multiFactorAuthState.modalVisible" />
    </user-account-module-container>
</template>

<style lang="postcss" scoped>
.user-account-multi-factor-auth {
    @apply flex flex-col;
    padding: 1.5rem 1rem 2.5rem;
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
    margin-bottom: 0;
}
</style>
