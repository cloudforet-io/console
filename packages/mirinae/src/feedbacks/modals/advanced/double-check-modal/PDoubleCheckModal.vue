<script lang="ts" setup>
import { computed, reactive } from 'vue';

import PButtonModal from '@/feedbacks/modals/button-modal/PButtonModal.vue';
import type { ModalSizeType } from '@/feedbacks/modals/type';
import { useProxyValue } from '@/hooks';
import PFieldGroup from '@/inputs/forms/field-group/PFieldGroup.vue';
import PTextInput from '@/inputs/input/text-input/PTextInput.vue';


interface Props {
    modalSize?: ModalSizeType;
    visible?: boolean;
    headerTitle?: string;
    verificationText?: string;
    loading?: boolean;
}
const props = withDefaults(defineProps<Props>(), {
    modalSize: 'md',
    visible: false,
    headerTitle: undefined,
    verificationText: '',
    loading: false,
});
const emit = defineEmits<{(e: 'update:visible', value: boolean): void;
    (e: 'confirm'): void;
    (e: 'cancel'): void;
}>();

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

<template>
    <p-button-modal :header-title="props.headerTitle"
                    :size="props.modalSize"
                    :visible.sync="state.proxyVisible"
                    theme-color="alert"
                    :loading="props.loading"
                    :disabled="state.invalid || state.inputText.length === 0"
                    @cancel="handleClose"
                    @close="handleClose"
                    @confirm="handleConfirm"
    >
        <template #body>
            <div>
                <slot name="middle-contents" />
                <p-field-group
                    :required="true"
                    :invalid-text="$t('COMPONENT.DOUBLE_CHECK_MODAL.INVALID_TEXT', { text: props.verificationText })"
                    :invalid="state.inputText !== undefined && state.invalid"
                >
                    <template #label>
                        <i18n path="COMPONENT.DOUBLE_CHECK_MODAL.INPUT_DESC">
                            <template #text>
                                <strong>{{ props.verificationText }}</strong>
                            </template>
                        </i18n>
                    </template>
                    <template #default="{invalid}">
                        <p-text-input v-model="state.inputText"
                                      :invalid="invalid"
                                      :disabled="props.loading"
                                      block
                                      @keyup.enter="handleConfirm()"
                        />
                    </template>
                </p-field-group>

                <slot name="bottom-contents" />
            </div>
        </template>
    </p-button-modal>
</template>

<style lang="postcss" scoped>
/* custom design-system component - p-field-title */
:deep(.p-field-title) {
    .title {
        @apply font-normal;
    }
}
</style>
