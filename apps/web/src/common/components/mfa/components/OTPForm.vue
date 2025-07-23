<script setup lang="ts">
import OTPQRInfo from '@/common/components/mfa/components/OTPQRInfo.vue';
import VerificationCodeForm from '@/common/components/mfa/components/VerificationCodeForm.vue';
import { useProxyValue } from '@/common/composables/proxy-state';

interface Props {
    verificationCode: string;
    verificationCodeInvalid: boolean;
    invalidText: string;
}

interface Emits {
    (e: 'update:verification-code', value: string): void;
    (e: 'update:verification-code-invalid', value: boolean): void;
}

const props = withDefaults(defineProps<Props>(), {
    verificationCode: '',
    verificationCodeInvalid: false,
    invalidText: '',
});

const emit = defineEmits<Emits>();

/* State */
const verificationCode = useProxyValue<string>('verificationCode', props, emit);
const verificationCodeInvalid = useProxyValue<boolean>('verificationCodeInvalid', props, emit);


</script>

<template>
    <div class="o-t-p-form">
        <o-t-p-q-r-info />
        <verification-code-form :invalid.sync="verificationCodeInvalid"
                                :code-value.sync="verificationCode"
                                :invalid-text="props.invalidText"
        />
    </div>
</template>
