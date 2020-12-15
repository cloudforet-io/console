<template>
    <p-button-modal :header-title="headerTitle"
                    :scrollable="scrollable"
                    :centered="centered"
                    :size="size"
                    :fade="fade"
                    :backdrop="backdrop"
                    :visible.sync="proxyVisible"
                    :theme-color="themeColor"
                    :footer-cancel-button-bind="footerCancelButtonBind"
                    :footer-confirm-button-bind="footerConfirmButtonBind"

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
                        <i18n path="COMPONENT.DOUBLE_CHECK_MODAL.INPUT_DESC" tag="label" class="form-label">
                            <template #text>
                                <strong>[{{ verificationText }}]</strong>
                            </template>
                        </i18n>
                    </template>
                    <p-text-input
                        v-model="inputText"
                        :invalid="invalid"
                        class="w-full"
                        @keyup.enter="confirm()"
                    />
                </p-field-group>

                <slot />
            </div>
        </template>
    </p-button-modal>
</template>
<script lang="ts">
import { reactive, computed, toRefs } from '@vue/composition-api';
import PButtonModal from '@/components/organisms/modals/button-modal/PButtonModal.vue';
import { makeProxy } from '@/components/util/composition-helpers';
import PTextInput from '@/components/atoms/inputs/PTextInput.vue';
import PFieldGroup from '@/components/molecules/forms/field-group/PFieldGroup.vue';
import { sizeMapping } from '@/components/molecules/modals/type';


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
            validator: value => Object.keys(sizeMapping).includes(value),
        },
        centered: {
            type: Boolean,
            default: false,
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
        hideOnCancel: {
            type: Boolean,
            default: true,
        },
        headerTitle: String,
        subTitle: String,
        verificationText: {
            type: String,
            required: true,
        },
    },
    setup(props, context) {
        const state = reactive({
            proxyVisible: makeProxy('visible', props, context.emit),
        });
        const footerCancelButtonBind = reactive({
            styleType: 'black',
            outline: true,
        });
        const footerConfirmButtonBind = computed(() => ({
            styleType: props.themeColor === 'primary' ? 'primary-dark' : props.themeColor,
        }));

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
            footerCancelButtonBind,
            footerConfirmButtonBind,
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
.form-label {
    display: inline-block;
    font-size: 0.875rem;
    letter-spacing: 0;
    margin-bottom: 0.25rem;
    margin-right: 0.375rem;
}
</style>
