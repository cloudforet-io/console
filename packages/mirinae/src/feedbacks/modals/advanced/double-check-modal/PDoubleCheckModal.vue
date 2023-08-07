<template>
    <p-button-modal v-model:visible="state.proxyVisible"
                    :header-title="headerTitle"
                    :size="modalSize"
                    theme-color="alert"
                    :loading="loading"
                    :disabled="state.invalid || state.inputText.length === 0"
                    @cancel="handleClose"
                    @close="handleClose"
                    @confirm="handleConfirm"
    >
        <template #body>
            <div>
                <p-field-group
                    :required="true"
                    :invalid-text="t('COMPONENT.DOUBLE_CHECK_MODAL.INVALID_TEXT', {text: verificationText})"
                    :invalid="state.inputText !== undefined && state.invalid"
                >
                    <template #label>
                        <i18n-t keypath="COMPONENT.DOUBLE_CHECK_MODAL.INPUT_DESC">
                            <template #text>
                                <strong>[{{ verificationText }}]</strong>
                            </template>
                        </i18n-t>
                    </template>
                    <template #default="{invalid}">
                        <p-text-input v-model="state.inputText"
                                      :invalid="invalid"
                                      :disabled="loading"
                                      block
                                      @keyup.enter="handleConfirm()"
                        />
                    </template>
                </p-field-group>

                <slot />
            </div>
        </template>
    </p-button-modal>
</template>
<script setup lang="ts">
import { computed, reactive } from 'vue';
import { useI18n } from 'vue-i18n';

import PButtonModal from '@/feedbacks/modals/button-modal/PButtonModal.vue';
import type { ModalSizeType } from '@/feedbacks/modals/type';
import { useProxyValue } from '@/hooks';
import PFieldGroup from '@/inputs/forms/field-group/PFieldGroup.vue';
import PTextInput from '@/inputs/input/text-input/PTextInput.vue';

interface Props {
    modalSize: ModalSizeType;
    visible: boolean;
    headerTitle?: string;
    verificationText: string;
    loading: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    modalSize: 'md',
    visible: false,
    headerTitle: undefined,
    loading: false,
});
const emit = defineEmits(['update:visible', 'cancel', 'confirm']);
const { t } = useI18n();

const state = reactive({
    proxyVisible: useProxyValue('visible', props, emit),
    inputText: undefined,
    invalid: computed(() => props.verificationText !== state.inputText),
});

const handleClose = () => {
    state.inputText = undefined;
    emit('cancel');
};
const handleConfirm = () => {
    if (state.invalid) return;
    state.inputText = undefined;
    emit('confirm');
};

</script>

<style lang="postcss" scoped>
.p-double-check-modal-sub-title {
    font-style: normal;
    font-weight: normal;
    font-size: 1.5rem;
    line-height: 1.9rem;
    margin-bottom: 1.875rem;
}
</style>
