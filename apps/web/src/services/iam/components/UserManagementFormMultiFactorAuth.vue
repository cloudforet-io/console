<script setup lang="ts">
import { computed, reactive } from 'vue';

import {
    PI, PTooltip, PFieldTitle, PToggleButton,
} from '@cloudforet/mirinae';

import type { MultiFactorAuthType } from '@/api-clients/identity/user-profile/schema/type';
import type { UserMfa } from '@/api-clients/identity/user/schema/model';

import { useProxyValue } from '@/common/composables/proxy-state';

import { MULTI_FACTOR_AUTH_ITEMS } from '@/services/iam/constants/user-constant';
import { useUserPageStore } from '@/services/iam/store/user-page-store';

interface Props {
    isChangedToggle?: boolean
}

const props = withDefaults(defineProps<Props>(), {
    isChangedToggle: false,
});

const userPageStore = useUserPageStore();

const emit = defineEmits<{(e: 'update:is-changed-toggle'): void }>();

const storeState = reactive({
    mfaData: computed<UserMfa|undefined>(() => userPageStore.getters.selectedUsers[0]?.mfa),
});
const state = reactive({
    proxyIsChangedToggle: useProxyValue('isChangedToggle', props, emit),
    mfaType: computed<MultiFactorAuthType|undefined>(() => storeState.mfaData?.mfa_type),
    isEnabled: computed<boolean>(() => storeState.mfaData?.state === 'ENABLED'),
});

const handleUpdateToggle = async (value: boolean) => {
    state.proxyIsChangedToggle = !value;
};
</script>

<template>
    <div class="multi-factor-auth-wrapper">
        <div class="title-wrapper">
            <p-field-title :label="$t('IAM.USER.MAIN.MFA')" />
            <p-tooltip
                :contents="$t('IAM.USER.MAIN.MFA_DESC')"
                position="top"
                class="mfa-tooltip"
            >
                <p-i name="ic_info-circle"
                     class="icon-info"
                     height="1rem"
                     width="1rem"
                     color="inherit"
                />
            </p-tooltip>
        </div>
        <div class="toggles-wrapper">
            <div v-for="(item) in MULTI_FACTOR_AUTH_ITEMS"
                 :key="`mfa-toggle-item-${item.type}`"
                 class="toggle"
            >
                <p-toggle-button
                    :value="state.mfaType === item.type"
                    :disabled="!(state.mfaType === item.type && state.isEnabled) || state.mfaType !== item.type"
                    class="toggle-button"
                    @change-toggle="handleUpdateToggle"
                />
                <span>{{ item.title }}</span>
            </div>
        </div>
    </div>
</template>

<style scoped lang="postcss">
.multi-factor-auth-wrapper {
    @apply flex flex-col bg-white rounded-lg;
    padding: 0.75rem;
    gap: 0.75rem;
    .title-wrapper {
        @apply flex items-center;
        gap: 0.25rem;
    }
    .toggles-wrapper {
        @apply flex flex-col;
        gap: 0.75rem;
        .toggle {
            @apply flex text-label-md font-bold;
            gap: 0.5rem;
            .mfa-tooltip {
                margin-top: -0.25rem;
                .icon-info {
                    @apply text-gray-500;
                }
            }
        }
    }
}
</style>
