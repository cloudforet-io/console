<script lang="ts" setup>
import { computed } from 'vue';

import { PButton } from '@cloudforet/mirinae';

import type { UserModel } from '@/api-clients/identity/user/schema/model';


interface UserMFASettingDisableButtonProps {
    selectedTarget?: UserModel | UserModel[];
}

interface Emits {
    (e: 'click'): void;
}

const props = defineProps<UserMFASettingDisableButtonProps>();
const emit = defineEmits<Emits>();

/* Computed */
const selectedTargetUsers = computed<UserModel[]>(() => {
    if (!props.selectedTarget) return [];
    if (Array.isArray(props.selectedTarget)) return props.selectedTarget;
    return [props.selectedTarget];
});
const buttonDisabled = computed<boolean>(() => !props.selectedTarget || selectedTargetUsers.value.length === 0);

</script>

<template>
    <p-button style-type="negative-secondary"
              class="mt-4"
              size="md"
              :disabled="buttonDisabled"
              icon-left="ic_delete"
              @click="emit('click')"
    >
        {{ $t('IAM.USER.MAIN.MODAL.MFA.DELETE_MFA_SECRET_KEY_BUTTON_TEXT') }}
    </p-button>
</template>
