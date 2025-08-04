<script lang="ts" setup>
import { reactive, type Ref } from 'vue';

import {
    PFieldGroup, PDivider, PToggleButton, PRadioGroup, PRadio,
    useProxyValue,
} from '@cloudforet/mirinae';

import type { MultiFactorAuthType } from '@/api-clients/identity/user-profile/schema/type';

import InfoTooltip from '@/common/components/info-tooltip/InfoTooltip.vue';

import { MULTI_FACTOR_AUTH_ITEMS } from '@/services/iam/constants/user-constant';

interface UserMFAEnforceFormProps {
    isRequiredMfa: boolean;
    selectedMfaType: MultiFactorAuthType;
}

interface UserMFAEnforceFormEmits {
    (e: 'update:is-required-mfa', value: boolean): void;
    (e: 'update:selected-mfa-type', value: MultiFactorAuthType): void;
}

interface UserMFAEnforceFormState {
    selectedMfaType: Ref<MultiFactorAuthType>;
    isRequiredMfa: Ref<boolean>;
}

const props = withDefaults(defineProps<UserMFAEnforceFormProps>(), {
    isRequiredMfa: false,
    selectedMfaType: MULTI_FACTOR_AUTH_ITEMS[0].type,
});
const emit = defineEmits<UserMFAEnforceFormEmits>();

/* State */
const mfaSettingState = reactive<UserMFAEnforceFormState>({
    isRequiredMfa: useProxyValue<boolean>('isRequiredMfa', props, emit),
    selectedMfaType: useProxyValue<MultiFactorAuthType>('selectedMfaType', props, emit),
});

/* Events */
const handleChangeRequiredMfa = (value: boolean) => {
    if (!value) {
        // if required mfa is false, set mfa type to default
        mfaSettingState.selectedMfaType = MULTI_FACTOR_AUTH_ITEMS[0].type;
    }
    mfaSettingState.isRequiredMfa = value;
};

const handleChangeMfaType = (value: MultiFactorAuthType) => {
    mfaSettingState.selectedMfaType = value;
};

</script>

<template>
    <div class="user-mfa-setting-enforce-form bg-white">
        <p-field-group :label="$t('IAM.USER.MAIN.MODAL.MFA.REQUIRED_SETTING_FIELD_TITLE')"
                       required
        >
            <template #label-extra>
                <info-tooltip :tooltip-contents="$t('IAM.USER.MAIN.MODAL.MFA.REQUIRED_FIELD_TOOLTIP_TEXT')"
                              tooltip-position="bottom"
                              width="1rem"
                              height="1rem"
                />
            </template>
            <p-toggle-button :value="mfaSettingState.isRequiredMfa"
                             show-state-text
                             true-state-text="Required"
                             false-state-text="Optional"
                             position="left"
                             @change-toggle="handleChangeRequiredMfa"
            />
        </p-field-group>

        <p-divider horizontal />

        <p-field-group v-if="mfaSettingState.isRequiredMfa"
                       :label="$t('IAM.USER.MAIN.MODAL.MFA.MFA_TYPE_SELECT_FIELD_TITLE')"
                       required
        >
            <p-radio-group direction="vertical">
                <p-radio v-for="item in MULTI_FACTOR_AUTH_ITEMS"
                         :key="item.type"
                         :value="item.type"
                         :selected="mfaSettingState.selectedMfaType"
                         :disabled="!mfaSettingState.isRequiredMfa"
                         @change="handleChangeMfaType"
                >
                    {{ item.title }}
                </p-radio>
            </p-radio-group>
        </p-field-group>
    </div>
</template>

<style scoped lang="postcss">
/* custom design-system component - p-divider */
:deep(.p-divider) {
    margin-bottom: 1rem;
}
</style>
