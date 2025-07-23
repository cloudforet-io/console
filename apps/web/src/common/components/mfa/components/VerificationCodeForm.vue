<script setup lang="ts">
import { watch } from 'vue';

import { PFieldGroup, PTextInput, useProxyValue } from '@cloudforet/mirinae';


interface Props {
    invalid: boolean;
    codeValue: string;
    invalidText: string;
}

interface Emits {
    (e: 'update:code-value', value: string): void;
    (e: 'update:invalid', value: boolean): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();
const proxyTextInputValue = useProxyValue<string>('codeValue', props, emit);
const proxyInvalid = useProxyValue<boolean>('invalid', props, emit);

watch(proxyTextInputValue, () => {
    proxyInvalid.value = false;
});

</script>

<template>
    <p-field-group :label="$t('COMMON.MFA_MODAL.VERIFICATION_CODE')"
                   :invalid="proxyInvalid"
                   :invalid-text="invalidText"
                   required
                   class="verification-code-form"
    >
        <p-text-input v-model="proxyTextInputValue"
                      :invalid="proxyInvalid"
                      class="text-input"
                      block
        />
    </p-field-group>
</template>
