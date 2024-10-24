<script setup lang="ts">
import {
    computed, reactive, watch,
} from 'vue';

import { constant, mapValues } from 'lodash';

import {
    PI, PToggleButton, PBadge, PButton,
} from '@cloudforet/mirinae';

import { MULTI_FACTOR_AUTH_TYPE } from '@/schema/identity/user-profile/constant';
import { store } from '@/store';

import { postUserProfileDisableMfa } from '@/lib/helper/multi-factor-auth-helper';

import { MULTI_FACTOR_AUTH_ITEMS } from '@/services/my-page/constants/multi-factor-auth-constants';
import { useMultiFactorAuthStore } from '@/services/my-page/stores/multi-factor-auth-store';

const multiFactorAuthStore = useMultiFactorAuthStore();
const multiFactorAuthState = multiFactorAuthStore.state;

const storeState = reactive({
    mfa: computed(() => store.state.user.mfa || undefined),
    selectedType: computed<string>(() => multiFactorAuthState.selectedType),
});
const state = reactive({
    enableMfa: mapValues(MULTI_FACTOR_AUTH_TYPE, constant(false)) as Record<string, boolean>,
    isVerified: computed<boolean>(() => storeState.mfa?.state === 'ENABLED'),
    type: computed<string>(() => storeState.mfa?.mfa_type),
});

const handleChangeToggle = async (type: string, value: boolean) => {
    state.enableMfa[type] = value;
    multiFactorAuthStore.setSelectedType(type);
    multiFactorAuthStore.setModalType(value ? 'FORM' : 'DISABLED');
    multiFactorAuthStore.setModalVisible(true);
    if (!value && type === MULTI_FACTOR_AUTH_TYPE.OTP) {
        await postUserProfileDisableMfa();
    }
};
const handleClickReSyncButton = async (type: string) => {
    multiFactorAuthStore.setSelectedType(type);
    multiFactorAuthStore.setModalVisible(true);
    multiFactorAuthStore.setModalType('RE_SYNC');
    if (type === MULTI_FACTOR_AUTH_TYPE.OTP) {
        await postUserProfileDisableMfa();
    }
};

watch(() => storeState.mfa, (mfa) => {
    if (mfa.mfa_type) {
        state.enableMfa[mfa.mfa_type] = storeState.mfa.state === 'ENABLED';
    }
}, { immediate: true });
watch(() => multiFactorAuthState.modalVisible, (modalVisible) => {
    if (!modalVisible) {
        state.enableMfa[storeState.selectedType] = state.type === storeState.selectedType ? state.isVerified : false;
        multiFactorAuthStore.setSelectedType('');
    }
}, { immediate: true });
</script>

<template>
    <div class="user-account-multi-factor-auth-items">
        <div v-for="(item, idx) in MULTI_FACTOR_AUTH_ITEMS"
             :key="`${item.type} - ${idx}`"
             class="user-account-multi-factor-auth-item"
             :class="{'disabled': state.isVerified && item.type !== state.type}"
        >
            <p-i class="icon"
                 :name="item.icon"
                 height="2rem"
                 width="2rem"
            />
            <div class="title-wrapper">
                <div class="toggle-wrapper">
                    <p-toggle-button :value="state.enableMfa[item.type]"
                                     :disabled="state.isVerified && item.type !== state.type"
                                     @update:value="handleChangeToggle(item.type, $event)"
                    />
                    <p class="title">
                        {{ item.title }}
                    </p>
                    <p-badge v-if="state.type === item.type && state.isVerified"
                             style-type="green200"
                             badge-type="subtle"
                             class="badge"
                    >
                        {{ $t('MY_PAGE.MFA.SYNC') }}
                    </p-badge>
                </div>
                <p class="desc">
                    {{ item.desc }}
                </p>
            </div>
            <p-button v-if="state.type === item.type && state.isVerified"
                      class="re-sync-button"
                      style-type="tertiary"
                      size="sm"
                      @click="handleClickReSyncButton(item.type)"
            >
                {{ $t('MY_PAGE.MFA.RESYNC') }}
            </p-button>
        </div>
    </div>
</template>

<style scoped lang="postcss">
.user-account-multi-factor-auth-items {
    @apply flex flex-col;
    gap: 1rem;
    .user-account-multi-factor-auth-item {
        @apply flex items-center border border-gray-200;
        padding: 1rem;
        border-radius: 0.375rem;
        gap: 1rem;
        .title-wrapper {
            @apply flex flex-col;
            gap: 0.5rem;
            .toggle-wrapper {
                @apply flex items-center;
                gap: 0.5rem;
                .title {
                    @apply text-label-lg font-bold;
                    margin-left: 0.5rem;
                }
            }
            .desc {
                @apply text-label-md text-gray-600;
            }
        }
        .re-sync-button {
            margin-left: auto;
        }
        &.disabled {
            .title {
                @apply text-gray-400;
            }
        }
    }
}
</style>
