<script setup lang="ts">
import {
    computed, reactive, watch,
} from 'vue';

import {
    PI, PToggleButton, PBadge, PButton,
} from '@cloudforet/mirinae';

import { MULTI_FACTOR_AUTH_TYPE } from '@/api-clients/identity/user-profile/schema/constant';
import type { UserMfa } from '@/api-clients/identity/user/schema/model';

import { useUserStore } from '@/store/user/user-store';

import { postUserProfileDisableMfa } from '@/lib/helper/multi-factor-auth-helper';

import { MULTI_FACTOR_AUTH_ITEMS } from '@/services/my-page/constants/multi-factor-auth-constants';
import { useMultiFactorAuthStore } from '@/services/my-page/stores/multi-factor-auth-store';

interface Props {
    readonlyMode?: boolean;
}

const props = defineProps<Props>();

const multiFactorAuthStore = useMultiFactorAuthStore();
const multiFactorAuthState = multiFactorAuthStore.state;
const userStore = useUserStore();

const storeState = reactive({
    mfa: computed<UserMfa|undefined>(() => userStore.state.mfa),
    selectedType: computed<string>(() => multiFactorAuthState.selectedType),
    enableMfaMap: computed<Record<string, boolean>>(() => multiFactorAuthState.enableMfaMap),
});
const state = reactive({
    isVerified: computed<boolean>(() => storeState.mfa?.state === 'ENABLED'),
    type: computed<string|undefined>(() => storeState.mfa?.mfa_type || undefined),
});

const handleChangeToggle = async (type: string, value: boolean) => {
    storeState.enableMfaMap[type] = value;
    multiFactorAuthStore.setModalVisible(true);

    if (state.isVerified && state.type !== type) {
        const otherType = Object.keys(storeState.enableMfaMap).find((key) => key !== type && key !== '');
        multiFactorAuthStore.setModalType('SWITCH');

        if (otherType) {
            multiFactorAuthStore.setSelectedType(otherType);

            if (otherType === MULTI_FACTOR_AUTH_TYPE.OTP) {
                await postUserProfileDisableMfa();
            }
        }
    } else {
        multiFactorAuthStore.setModalType(value ? 'FORM' : 'DISABLED');
        multiFactorAuthStore.setSelectedType(type);
        if (!value && type === MULTI_FACTOR_AUTH_TYPE.OTP) {
            await postUserProfileDisableMfa();
        }
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
    if (mfa?.mfa_type) {
        multiFactorAuthStore.setEnableMfaMapType(mfa.mfa_type, storeState.mfa?.state === 'ENABLED');
    }
}, { immediate: true });
watch(() => multiFactorAuthState.modalVisible, (modalVisible) => {
    if (!modalVisible) {
        multiFactorAuthStore.setEnableMfaMapType(storeState.selectedType, state.type === storeState.selectedType ? state.isVerified : false);
        multiFactorAuthStore.setSelectedType('');
    }
}, { immediate: true });
</script>

<template>
    <div class="user-account-multi-factor-auth-items">
        <div v-for="(item, idx) in MULTI_FACTOR_AUTH_ITEMS"
             :key="`${item.type} - ${idx}`"
             class="user-account-multi-factor-auth-item"
        >
            <div class="user-account-multi-factor-auth-item-inner">
                <p-i class="icon"
                     :name="item.icon"
                     height="2rem"
                     width="2rem"
                />
                <div class="title-wrapper">
                    <div class="toggle-wrapper">
                        <div class="toggle-inner">
                            <p-toggle-button :value="storeState.enableMfaMap[item.type]"
                                             :read-only="props.readonlyMode"
                                             :show-state-text="props.readonlyMode"
                                             @change-toggle="handleChangeToggle(item.type, $event)"
                            />
                            <p class="title">
                                {{ item.title }}
                            </p>
                        </div>
                        <p-badge v-if="state.type === item.type && state.isVerified"
                                 style-type="green200"
                                 badge-type="subtle"
                                 class="badge"
                        >
                            {{ $t('MY_PAGE.MFA.SYNC') }}
                        </p-badge>
                    </div>
                    <p class="desc">
                        <span v-if="item.type === MULTI_FACTOR_AUTH_TYPE.OTP">{{ $t('MY_PAGE.MFA.MS_DESC') }}</span>
                        <span v-else>{{ $t('MY_PAGE.MFA.EMAIL_DESC') }}</span>
                    </p>
                </div>
            </div>
            <p-button v-if="state.type === item.type && state.isVerified"
                      class="re-sync-button"
                      style-type="tertiary"
                      size="sm"
                      :readonly="props.readonlyMode"
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
        @apply flex items-center justify-between border border-gray-200 flex-wrap;
        padding: 1rem;
        border-radius: 0.375rem;
        gap: 1rem;
        .user-account-multi-factor-auth-item-inner {
            @apply flex items-center;
            gap: 1rem;
            .title-wrapper {
                @apply flex flex-col items-start;
                gap: 0.5rem;
                .toggle-wrapper, .toggle-inner {
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

            @screen mobile {
                .title-wrapper {
                    flex: 1;
                    .toggle-wrapper {
                        @apply flex-col items-start;
                    }
                }
                .re-sync-button {
                    margin-left: initial;
                }
            }
        }
    }
}
</style>
