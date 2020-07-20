<template>
    <p-button-modal
        ref="modal"
        :header-title="headerTitle"
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
                    :invalid-text="'text is not '+verificationText"
                    :invalid="invalid"
                >
                    <template #label>
                        <label class="form-label">Type <strong>[{{ verificationText }}]</strong> to Confirm</label>
                    </template>
                    <p-text-input
                        v-model="inputText"
                        :class="{'is-invalid': invalid}"
                        class="w-full"
                        @keyup.enter="confirm()"
                    />
                </p-field-group>

                <slot />
            </div>
        </template>
    </p-button-modal>
</template>
<script>
import { reactive, computed, toRefs } from '@vue/composition-api';
import PButtonModal from '@/components/organisms/modals/button-modal/ButtonModal.vue';
import { propsMixin } from '@/components/molecules/modals/Modal.vue';
import { makeByPass, makeProxy } from '@/lib/compostion-util';
import { setup as contentModalSetup } from '@/components/organisms/modals/content-modal/ContentModal.vue';
import PTextInput from '@/components/atoms/inputs/PTextInput.vue';
import PFieldGroup from '@/components/molecules/forms/field-group/FieldGroup.vue';

const setup = (props, context) => {
    const state = contentModalSetup(props, context);
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
        ...state,
        ...toRefs(checkState),
        footerCancelButtonBind,
        footerConfirmButtonBind,
        proxyVisible: makeProxy('visible', props, context.emit),
        cancel,
        close,
        confirm,
    };
};

export default {
    name: 'PDoubleCheckModal',
    components: { PButtonModal, PTextInput, PFieldGroup },
    mixins: [propsMixin],
    props: {
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
        return setup(props, context);
    },


};
</script>

<style lang="postcss" scoped>
    .p-double-check-modal-sub-title{
        font-style: normal;
        font-weight: normal;
        font-size: 1.5rem;
        line-height: 1.9rem;
        margin-bottom: 1.875rem;
    }
    .form-label {
        display: inline-block;
        font-size: .875rem;
        letter-spacing: 0;
        margin-bottom: 0.25rem;
        margin-right: 0.375rem;
    }
</style>
