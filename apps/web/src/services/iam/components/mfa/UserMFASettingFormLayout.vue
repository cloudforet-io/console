<script lang="ts" setup>
import {
    computed, reactive, ref, type Ref,
} from 'vue';
import type { TranslateResult } from 'vue-i18n';

import {
    PCollapsibleToggle, PDivider, PStatus, useProxyValue,
} from '@cloudforet/mirinae';
import type { StatusTheme } from '@cloudforet/mirinae/types/data-display/status/type';

import type { MultiFactorAuthType } from '@/api-clients/identity/user-profile/schema/type';
import type { UserModel } from '@/api-clients/identity/user/schema/model';
import { i18n } from '@/translations';

import { gray, green, red } from '@/styles/colors';

import UserMFASettingDisableButton from '@/services/iam/components/mfa/UserMFASettingDisableButton.vue';
import UserMFASettingEnforceForm from '@/services/iam/components/mfa/UserMFASettingEnforceForm.vue';
import { MULTI_FACTOR_AUTH_ITEMS } from '@/services/iam/constants/user-constant';

interface UserMFASettingFormLayoutProps {
    isRequiredMfa: boolean;
    selectedMfaType: MultiFactorAuthType;
    selectedMfaControllableTarget: UserModel | UserModel[];
}

interface UserMFASettingFormLayoutEmits {
    (e: 'update:is-required-mfa', value: boolean): void;
    (e: 'update:selected-mfa-type', value: MultiFactorAuthType): void;
    (e: 'click-disable-mfa'): void;
}

interface UserMFASettingFormState {
    selectedMfaType: Ref<MultiFactorAuthType>;
    isRequiredMfa: Ref<boolean>;
}

const props = withDefaults(defineProps<UserMFASettingFormLayoutProps>(), {
    isRequiredMfa: false,
    selectedMfaType: MULTI_FACTOR_AUTH_ITEMS[0].type,
});
const emit = defineEmits<UserMFASettingFormLayoutEmits>();

/* State */
const mfaSettingState = reactive<UserMFASettingFormState>({
    isRequiredMfa: useProxyValue<boolean>('isRequiredMfa', props, emit),
    selectedMfaType: useProxyValue<MultiFactorAuthType>('selectedMfaType', props, emit),
});
// UI State
const isCollapsed = ref(false);

/* Computed */
// Single Target Form Case
const isSingleTargetForm = computed<boolean>(() => !Array.isArray(props.selectedMfaControllableTarget));
// Only Local Auth Type Users can be updated
const selectedMFAControllableUsers = computed<UserModel[]>(() => {
    if (!props.selectedMfaControllableTarget) return [];
    if (Array.isArray(props.selectedMfaControllableTarget)) {
        return props.selectedMfaControllableTarget;
    }
    return [props.selectedMfaControllableTarget];
});

// MFA Type Info Visible Condition
const isMFATypeInfoVisible = computed<boolean>(() => selectedMFAControllableUsers.value.length === 1);
const noActiveMfaType = computed<boolean>(() => {
    if (!isMFATypeInfoVisible.value) return false;
    const selectedUserMFAType = selectedMFAControllableUsers.value[0].mfa?.mfa_type;
    const selectedUserMFAState = selectedMFAControllableUsers.value[0].mfa?.state;
    if (!selectedUserMFAType || !selectedUserMFAState) return true;
    return false;
});
const currentSelectedMfaType = computed<string|TranslateResult|undefined>(() => {
    if (!isMFATypeInfoVisible.value) return '';
    const selectedUserMFAType = selectedMFAControllableUsers.value[0].mfa?.mfa_type;
    const selectedUserMFAState = selectedMFAControllableUsers.value[0].mfa?.state;
    if (!selectedUserMFAType || !selectedUserMFAState) return i18n.t('IAM.USER.MAIN.MODAL.MFA.MFA_TYPE_NO_ACTIVE_METHOD');
    return MULTI_FACTOR_AUTH_ITEMS.find((item) => item.type === selectedUserMFAType)?.title;
});
const singleUserMfaTypeStatusTheme = computed<StatusTheme|undefined>(() => {
    if (!isMFATypeInfoVisible.value) return undefined;
    if (noActiveMfaType.value) return gray[300];
    const selectedUserMFAState = selectedMFAControllableUsers.value[0].mfa?.state;
    if (!selectedUserMFAState) return gray[300];
    return selectedUserMFAState === 'ENABLED' ? green[600] : red[500];
});

// MFA Disable Target
const selectedMFAEnabledTarget = computed<UserModel | UserModel[] | undefined>(() => {
    if (isSingleTargetForm.value) {
        return selectedMFAControllableUsers.value.filter((user) => user.mfa?.state === 'ENABLED')?.[0];
    }
    return selectedMFAControllableUsers.value.filter((user) => user.mfa?.state === 'ENABLED');
});



</script>

<template>
    <div class="user-mfa-setting-form-layout rounded-lg p-3 bg-white">
        <user-m-f-a-setting-enforce-form :is-required-mfa.sync="mfaSettingState.isRequiredMfa"
                                         :selected-mfa-type.sync="mfaSettingState.selectedMfaType"
        />

        <div v-if="isMFATypeInfoVisible"
             class="single-user-mfa-type-info inline-flex flex-col gap-1 mb-4"
        >
            <p-collapsible-toggle v-model="isCollapsed">
                {{ $t('IAM.USER.MAIN.MODAL.MFA.SINGLE_USER_MFA_TYPE_INFO_TEXT') }}
            </p-collapsible-toggle>
            <p-status v-if="!isCollapsed"
                      :text="currentSelectedMfaType"
                      :icon-color="singleUserMfaTypeStatusTheme"
                      :text-color="noActiveMfaType ? gray[400] : undefined"
            />
        </div>

        <p-divider horizontal />

        <user-m-f-a-setting-disable-button :selected-target="selectedMFAEnabledTarget"
                                           @click="emit('click-disable-mfa')"
        />
    </div>
</template>

<style scoped lang="postcss">
/* custom design-system component - p-status */
:deep(.p-status) {
    justify-content: unset;
    .text {
        @apply text-label-md;
    }
}
</style>
