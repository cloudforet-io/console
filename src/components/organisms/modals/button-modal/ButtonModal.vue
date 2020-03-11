<template>
    <p-content-modal
        ref="modal"
        :fade="fade"
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
                <slot name="header">
                    {{ headerTitle }}
                </slot>
                <p-i v-if="headerCloseButtonVisible"
                     name="ic_delete" color="transparent inherit"
                     class="close-btn"
                     :class="{disabled: loading}"
                     @click="onCloseClick"
                />
            </div>
        </template>
        <template #body>
            <slot name="body" />
        </template>
        <template #footer>
            <slot name="footer">
                <div class="footer">
                    <slot name="footer-extra" />
                    <p-button
                        v-if="footerCancelButtonVisible"
                        class="modal-btn cancel-btn"
                        v-bind="footerCancelButtonBind"
                        :disabled="loading"
                        @click="onCancelClick"
                    >
                        <slot name="close-button">
                            {{ $t('BTN.CANCEL') }}
                        </slot>
                    </p-button>
                    <p-loading-button v-if="footerConfirmButtonVisible"
                                      class="modal-btn"
                                      :button-bind="footerConfirmButtonBind"
                                      :loading="loading"
                                      @click="onConfirmClick"
                    >
                        <slot name="confirm-button">
                            {{ $t('BTN.CONFIRM') }}
                        </slot>
                    </p-loading-button>
                </div>
            </slot>
        </template>
    </p-content-modal>
</template>

<script>
import PContentModal, { setup as contentModalSetup } from '@/components/organisms/modals/content-modal/ContentModal.vue';
import PI from '@/components/atoms/icons/PI.vue';
import PLoadingButton from '@/components/molecules/buttons/LoadingButton.vue';
import PButton from '@/components/atoms/buttons/Button.vue';

export const setup = (props, context) => {
    const state = contentModalSetup(props, context);
    const onCloseClick = () => {
        if (props.disabled) return;
        context.emit('close');
        state.proxyVisible.value = false;
    };
    const onCancelClick = () => {
        context.emit('cancel');
        if (props.hideOnCancel) {
            state.proxyVisible.value = false;
        }
    };
    const onConfirmClick = () => {
        context.emit('confirm');
    };
    return {
        ...state,
        onCloseClick,
        onCancelClick,
        onConfirmClick,
    };
};

export default {
    name: 'PButtonModal',
    components: {
        PI, PContentModal, PButton, PLoadingButton,
    },
    mixins: [PContentModal],
    events: ['close', 'cancel', 'confirm'],
    setup(props, context) {
        return setup(props, context);
    },
    props: {
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
        footerCancelButtonBind: {
            type: Object,
            default: () => ({
                styleType: 'dark',
                outline: true,
            }),
        },
        footerConfirmButtonBind: {
            type: Object,
            default: () => ({
                styleType: 'primary-dark',
            }),
        },
        hideOnCancel: {
            type: Boolean,
            default: true,
        },
        loading: {
            type: Boolean,
            default: false,
        },
    },

};
</script>
<style lang="postcss" scoped>
    .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
        .close-btn {
            @apply text-dark;
            cursor: pointer;
            &:hover {
                @apply text-secondary;
            }
            &.disabled {
                @apply text-gray2;
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
