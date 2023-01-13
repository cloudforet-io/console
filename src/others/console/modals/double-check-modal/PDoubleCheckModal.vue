<template>
    <p-button-modal :header-title="headerTitle"
                    :scrollable="scrollable"
                    :size="size"
                    :fade="fade"
                    :backdrop="backdrop"
                    :visible.sync="proxyVisible"
                    :theme-color="themeColor"
                    @cancel="cancel"
                    @close="close"
                    @confirm="confirm"
    >
        <template #body>
            <div>
                <h4 class="p-double-check-modal-sub-title">
                    {{ subTitle }}
                </h4>

                <p-field-group
                    :required="true"
                    :invalid-text="$t('COMPONENT.DOUBLE_CHECK_MODAL.INVALID_TEXT', {text: verificationText})"
                    :invalid="invalid"
                >
                    <template #label>
                        <i18n path="COMPONENT.DOUBLE_CHECK_MODAL.INPUT_DESC">
                            <template #text>
                                <strong>[{{ verificationText }}]</strong>
                            </template>
                        </i18n>
                    </template>
                    <p-text-input v-model="inputText"
                                  :invalid="invalid"
                                  block
                                  @keyup.enter="confirm()"
                    />
                </p-field-group>

                <slot />
            </div>
        </template>
    </p-button-modal>
</template>
<script lang="ts">
import { reactive, toRefs } from 'vue';

import PButtonModal from '@/feedbacks/modals/button-modal/PButtonModal.vue';
import { SizeMapping } from '@/feedbacks/modals/type';
import PFieldGroup from '@/inputs/forms/field-group/PFieldGroup.vue';
import PTextInput from '@/inputs/input/text-input/PTextInput.vue';
import { makeProxy } from '@/util/composition-helpers';


export default {
    name: 'PDoubleCheckModal',
    components: { PButtonModal, PTextInput, PFieldGroup },
    props: {
        fade: {
            type: Boolean,
            default: false,
        },
        scrollable: {
            type: Boolean,
            default: false,
        },
        size: {
            type: String,
            default: 'md',
            validator: (value) => Object.keys(SizeMapping).includes(value),
        },
        backdrop: {
            type: Boolean,
            default: true,
        },
        visible: { // sync
            type: Boolean,
            default: false,
        },
        themeColor: {
            type: String,
            default: 'alert',
        },
        headerTitle: {
            type: String,
            default: undefined,
        },
        subTitle: {
            type: String,
            default: undefined,
        },
        verificationText: {
            type: String,
            required: true,
        },
    },
    setup(props, context) {
        const state = reactive({
            proxyVisible: makeProxy('visible', props, context.emit),
        });

        const checkState = reactive({
            inputText: '',
            invalid: false,
        });
        const reset = () => {
            checkState.inputText = '';
            checkState.invalid = false;
        };
        const cancel = (...event) => {
            reset();
            context.emit('cancel', ...event);
        };
        const close = (...event) => {
            reset();
            context.emit('close', ...event);
        };
        const confirm = () => {
            if (checkState.inputText === props.verificationText) {
                reset();
                context.emit('confirm');
            } else {
                checkState.invalid = true;
            }
        };


        return {
            ...toRefs(state),
            ...toRefs(checkState),
            cancel,
            close,
            confirm,
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
