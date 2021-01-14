<template>
    <p-content-modal :fade="fade"
                     :scrollable="scrollable"
                     :size="size"
                     :centered="centered"
                     :backdrop="backdrop"
                     :visible.sync="proxyVisible"
                     :theme-color="themeColor"
                     :header-class="headerClass"
                     :body-class="bodyClass"
                     :footer-class="footerClass"
                     :header-visible="headerVisible"
                     :body-visible="bodyVisible"
                     :footer-visible="footerVisible"
    >
        <template #header>
            <div class="header">
                <slot :slot-scope="$props" name="header">
                    {{ headerTitle }}
                </slot>
                <p-i v-if="headerCloseButtonVisible"
                     name="ic_delete" color="transparent inherit"
                     class="close-btn"
                     :class="{disabled: loading}"
                     @click.stop="onCloseClick"
                />
            </div>
        </template>
        <template #body>
            <slot :slot-scope="$props" name="body" />
        </template>
        <template #footer>
            <slot :slot-scope="$props" name="footer">
                <div class="footer">
                    <slot :slot-scope="$props" name="footer-extra" />
                    <p-button
                        v-if="footerCancelButtonVisible"
                        class="modal-btn cancel-btn"
                        v-bind="footerCancelButtonBind"
                        :disabled="loading"
                        @click="onCancelClick"
                    >
                        <slot :slot-scope="$props" name="close-button">
                            {{ $t('COMPONENT.BUTTON_MODAL.CANCEL') }}
                        </slot>
                    </p-button>
                    <p-loading-button v-if="footerConfirmButtonVisible"
                                      class="modal-btn"
                                      :button-bind="footerConfirmButtonBind"
                                      :loading="loading"
                                      :disabled="disabled"
                                      @click="onConfirmClick"
                    >
                        <slot :slot-scope="$props" name="confirm-button">
                            {{ $t('COMPONENT.BUTTON_MODAL.CONFIRM') }}
                        </slot>
                    </p-loading-button>
                </div>
            </slot>
        </template>
    </p-content-modal>
</template>

<script lang="ts">
// @ts-ignore
import PContentModal from '@/organisms/modals/content-modal/PContentModal.vue';
import PI from '@/atoms/icons/PI.vue';
import PLoadingButton from '@/molecules/buttons/loading-button/PLoadingButton.vue';
import PButton from '@/atoms/buttons/PButton.vue';
import { sizeMapping } from '@/molecules/modals/type';
import { computed, reactive, toRefs } from '@vue/composition-api';
import { makeProxy } from '@/util/composition-helpers';
import { ButtonModalProps } from '@/organisms/modals/button-modal/type';


export default {
    name: 'PButtonModal',
    components: {
        PI, PContentModal, PButton, PLoadingButton,
    },
    props: {
        visible: { // sync
            type: Boolean,
            default: false,
        },
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
        themeColor: {
            type: String,
            default: 'primary',
        },
        headerClass: {
            type: Array,
            default: null,
        },
        bodyClass: {
            type: Array,
            default: null,
        },
        footerClass: {
            type: Array,
            default: null,
        },
        headerVisible: {
            type: Boolean,
            default: true,
        },
        bodyVisible: {
            type: Boolean,
            default: true,
        },
        footerVisible: {
            type: Boolean,
            default: true,
        },
        headerTitle: {
            type: String,
            default: '',
        },
        headerCloseButtonVisible: {
            type: Boolean,
            default: true,
        },
        footerCancelButtonVisible: {
            type: Boolean,
            default: true,
        },
        footerConfirmButtonVisible: {
            type: Boolean,
            default: true,
        },
        hideOnCancel: {
            type: Boolean,
            default: true,
        },
        loading: {
            type: Boolean,
            default: false,
        },
        disabled: {
            type: Boolean,
            default: false,
        },
        footerCancelButtonBind: {
            type: Object,
            default: () => ({
                styleType: 'gray900',
                outline: true,
            }),
        },
        footerConfirmButtonBind: {
            type: Object,
            default: () => ({
                styleType: 'primary-dark',
            }),
        },
    },
    setup(props: ButtonModalProps, context) {
        const state = reactive({
            proxyVisible: makeProxy('visible', props, context.emit),
        });
        const onCloseClick = () => {
            if (props.loading) return;
            context.emit('close');
            state.proxyVisible = false;
        };
        const onCancelClick = () => {
            if (props.loading) return;
            context.emit('cancel');
            if (props.hideOnCancel) {
                state.proxyVisible = false;
            }
        };
        const onConfirmClick = () => {
            context.emit('confirm');
        };
        return {
            ...toRefs(state),
            onCloseClick,
            onCancelClick,
            onConfirmClick,
        };
    },
};

</script>
<style lang="postcss" scoped>
.scrollable-body {
    display: flex;
}
.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    .close-btn {
        @apply text-gray-900;
        cursor: pointer;
        &:hover {
            @apply text-secondary;
        }
        &.disabled {
            @apply text-gray-200;
        }
    }
}

.footer {
    display: flex;
    align-items: center;
    width: 100%;

    .modal-btn {
        height: 2.5rem;
        font-size: 1rem;
    }

    .cancel-btn {
        margin-left: auto;
        margin-right: 1rem;
    }
}

</style>
