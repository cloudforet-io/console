<template>
    <p-button-modal :header-title="headerTitle"
                    :size="modalSize"
                    :visible.sync="proxyVisible"
                    theme-color="alert"
                    :disabled="invalid || inputText.length === 0"
                    @cancel="handleClose"
                    @close="handleClose"
                    @confirm="handleConfirm"
    >
        <template #body>
            <div>
                <p-field-group
                    :required="true"
                    :invalid-text="$t('COMPONENT.DOUBLE_CHECK_MODAL.INVALID_TEXT', {text: verificationText})"
                    :invalid="inputText !== undefined && invalid"
                >
                    <template #label>
                        <i18n path="COMPONENT.DOUBLE_CHECK_MODAL.INPUT_DESC">
                            <template #text>
                                <strong>[{{ verificationText }}]</strong>
                            </template>
                        </i18n>
                    </template>
                    <template #default="{invalid}">
                        <p-text-input v-model="inputText"
                                      :invalid="invalid"
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
<script lang="ts">
import { computed, reactive, toRefs } from 'vue';

import PButtonModal from '@/feedbacks/modals/button-modal/PButtonModal.vue';
import { SizeMapping } from '@/feedbacks/modals/type';
import { useProxyValue } from '@/hooks';
import PFieldGroup from '@/inputs/forms/field-group/PFieldGroup.vue';
import PTextInput from '@/inputs/input/text-input/PTextInput.vue';


export default {
    name: 'PDoubleCheckModal',
    components: { PButtonModal, PTextInput, PFieldGroup },
    props: {
        modalSize: {
            type: String,
            default: 'md',
            validator: (value) => Object.keys(SizeMapping).includes(value),
        },
        visible: { // sync
            type: Boolean,
            default: false,
        },
        headerTitle: {
            type: String,
            default: undefined,
        },
        verificationText: {
            type: String,
            required: true,
        },
    },
    setup(props, { emit }) {
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

        return {
            ...toRefs(state),
            handleClose,
            handleConfirm,
        };
    },
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
