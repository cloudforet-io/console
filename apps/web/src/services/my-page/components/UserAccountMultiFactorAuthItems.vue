<script setup lang="ts">
import {
    computed, reactive,
} from 'vue';

import {
    PI, PBadge, PButton, PSelectCard,
} from '@cloudforet/mirinae';

import { useUserProfileApi } from '@/api-clients/identity/user-profile/composables/use-user-profile-api';
import { MULTI_FACTOR_AUTH_TYPE } from '@/api-clients/identity/user-profile/schema/constant';
import type { MultiFactorAuthType } from '@/api-clients/identity/user-profile/schema/type';
import type { UserMfa } from '@/api-clients/identity/user/schema/model';

import { useUserStore } from '@/store/user/user-store';

import { MULTI_FACTOR_AUTH_ITEMS } from '@/services/my-page/constants/multi-factor-auth-constants';
import { useMultiFactorAuthStore } from '@/services/my-page/stores/multi-factor-auth-store';

interface Props {
    readonlyMode?: boolean;
}

const props = defineProps<Props>();

const multiFactorAuthStore = useMultiFactorAuthStore();
const multiFactorAuthState = multiFactorAuthStore.state;
const userStore = useUserStore();

const { userProfileAPI } = useUserProfileApi();

const storeState = reactive({
    mfa: computed<UserMfa|undefined>(() => userStore.state.mfa),
    selectedType: computed<string>(() => multiFactorAuthState.selectedType),
    enableMfaMap: computed<Record<string, boolean>>(() => multiFactorAuthState.enableMfaMap),
});
const state = reactive({
    isVerified: computed<boolean>(() => storeState.mfa?.state === 'ENABLED'),
    currentType: computed<string|undefined>(() => userStore.state.mfa?.mfa_type || undefined),
    isEnforced: computed<boolean>(() => userStore.state.mfa?.options?.enforce === true),
});

const handleChange = async (isSelected: boolean, selected: MultiFactorAuthType) => {
    if (props.readonlyMode) return;
    if (state.isEnforced && state.currentType !== selected) return;
    if (state.isVerified && state.currentType !== selected) {
        if (selected === MULTI_FACTOR_AUTH_TYPE.OTP) {
            multiFactorAuthStore.setEmailSwitchModalVisible(true);
        } else {
            multiFactorAuthStore.setOTPSwitchModalVisible(true);
            await userProfileAPI.disableMfa({});
        }
        return;
    }

    if (!isSelected) {
        if (selected === MULTI_FACTOR_AUTH_TYPE.OTP) {
            multiFactorAuthStore.setOTPEnableModalVisible(true);
        } else {
            multiFactorAuthStore.setEmailEnableModalVisible(true);
        }
    } else if (selected === MULTI_FACTOR_AUTH_TYPE.OTP) {
        multiFactorAuthStore.setOTPDisableModalVisible(true);
        await userProfileAPI.disableMfa({});
    } else {
        multiFactorAuthStore.setEmailDisableModalVisible(true);
    }
};

const handleClickReSyncButton = async (type: MultiFactorAuthType, event: MouseEvent) => {
    if (props.readonlyMode) return;
    if (state.isEnforced && state.currentType !== type) return;
    event.stopPropagation();
    if (type === MULTI_FACTOR_AUTH_TYPE.OTP) {
        multiFactorAuthStore.setOTPReSyncModalVisible(true);
        await userProfileAPI.disableMfa({});
    } else {
        multiFactorAuthStore.setEmailReSyncModalVisible(true);
    }
};
</script>

<template>
    <div class="user-account-multi-factor-auth-items">
        <p-select-card v-for="(item, idx) in MULTI_FACTOR_AUTH_ITEMS"
                       :key="`${item.type} - ${idx}`"
                       block
                       :readonly="props.readonlyMode || (state.isEnforced && state.currentType !== item.type)"
                       :selected="state.isVerified ? state.currentType : undefined"
                       :disabled="state.isEnforced && state.currentType !== item.type"
                       :value="item.type"
                       @change="handleChange(state.isVerified && state.currentType === item.type, $event)"
        >
            <div class="flex w-full justify-between px-4 items-center ">
                <div class="flex items-center gap-3">
                    <p-i class="icon"
                         :class="{'opacity-20': state.isEnforced && state.currentType !== item.type}"
                         :name="item.icon"
                         height="2.5rem"
                         width="2.5rem"
                    />
                    <div class="flex flex-col justify-center gap-1">
                        <span class="text-label-md font-bold">
                            {{ item.title }}
                        </span>
                        <span class="text-label-md text-gray-600"
                              :class="{'opacity-20': state.isEnforced && state.currentType !== item.type}"
                        >
                            {{ item.type === MULTI_FACTOR_AUTH_TYPE.OTP ? $t('MY_PAGE.MFA.MS_DESC') : $t('MY_PAGE.MFA.EMAIL_DESC') }}
                        </span>
                    </div>
                </div>
                <div v-if="state.currentType === item.type && state.isVerified"
                     class="inline-flex items-center gap-2"
                >
                    <p-badge class="badge"
                             style-type="green200"
                             badge-type="subtle"
                    >
                        {{ $t('MY_PAGE.MFA.SYNC') }}
                    </p-badge>
                    <p-button class="re-sync-button"
                              style-type="tertiary"
                              size="sm"
                              :readonly="props.readonlyMode || (state.isEnforced && state.currentType !== item.type)"
                              @click="handleClickReSyncButton(item.type, $event)"
                    >
                        {{ $t('MY_PAGE.MFA.RESYNC') }}
                    </p-button>
                </div>
            </div>
        </p-select-card>
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
