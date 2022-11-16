<template>
    <p-button-modal :header-title="headerTitle"
                    :scrollable="scrollable"
                    :size="size"
                    :fade="fade"
                    :backdrop="backdrop"
                    :visible.sync="proxyVisible"
                    :theme-color="themeColor"
                    :disabled="invalid || inputText.length === 0"
                    @cancel="handleCancel"
                    @close="handleClose"
                    @confirm="handleConfirm"
    >
        <template #body>
            <div>
                <slot v-if="subTitle"
                      name="subTitle"
                />
                <i18n v-else
                      class="double-check-modal-sub-title"
                      tag="p"
                      path="IDENTITY.SERVICE_ACCOUNT.MAIN.CHECK_MODAL_DELETE_DESC"
                >
                    <template #account>
                        <strong>{{ verificationText }}</strong>
                    </template>
                </i18n>

                <p-field-group
                    class="field-group"
                    :required="true"
                    :invalid-text="$t('COMPONENT.DOUBLE_CHECK_MODAL.INVALID_TEXT', {text: verificationText})"
                    :invalid="invalid"
                >
                    <template #label>
                        <i18n class="label-text"
                              path="COMPONENT.DOUBLE_CHECK_MODAL.INPUT_DESC"
                        >
                            <template #text>
                                <strong>{{ verificationText }}</strong>
                            </template>
                        </i18n>
                    </template>
                    <p-text-input v-model.trim="inputText"
                                  :invalid="invalid"
                                  block
                                  @keyup.enter="confirm()"
                    />
                </p-field-group>
            </div>
        </template>
    </p-button-modal>
</template>
<script lang="ts">
import type { SetupContext } from 'vue';
import {
    reactive, toRefs, watch, defineComponent,
} from 'vue';

import { PButtonModal, PFieldGroup, PTextInput } from '@spaceone/design-system';

import type { Size } from '@/common/components/modals/config';
import { SIZE } from '@/common/components/modals/config';
import { useProxyValue } from '@/common/composables/proxy-state';

export default defineComponent({
    name: 'DoubleCheckModal',
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
            validator(value: Size): boolean {
                return Object.values(SIZE).includes(value);
            },
            default: SIZE.sm,
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
    setup(props, { emit }: SetupContext) {
        const state = reactive({
            proxyVisible: useProxyValue('visible', props, emit),
        });

        const checkState = reactive({
            inputText: '',
            invalid: false,
        });
        const reset = () => {
            checkState.inputText = '';
            checkState.invalid = false;
        };
        const handleCancel = (event) => {
            reset();
            emit('cancel', event);
        };
        const handleClose = (event) => {
            reset();
            emit('close', event);
        };
        const handleConfirm = () => {
            // TODO: Currently, name with space exists. So, further fixes are required later.
            if (checkState.inputText === props.verificationText.trim()) {
                reset();
                emit('confirm');
            } else {
                checkState.invalid = true;
            }
        };

        watch(() => checkState.inputText, (value) => {
            // TODO: Here, too.
            checkState.invalid = value.trim().length > 0 && props.verificationText.trim() !== value;
        });

        return {
            ...toRefs(state),
            ...toRefs(checkState),
            handleCancel,
            handleClose,
            handleConfirm,
        };
    },

});
</script>

<style lang="postcss" scoped>
.double-check-modal-sub-title {
    font-style: normal;
    font-weight: normal;
    font-size: 1rem;
    line-height: 1.6rem;
    margin-bottom: 1.875rem;
}

.field-group {
    /* custom design-system component - p-field-title */
    :deep(.p-field-title) {
        margin-bottom: 1rem;
    }
}

.label-text {
    font-weight: normal !important;
    font-size: 1rem;
}
</style>
