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
            <slot name="header">
                {{ headerTitle }}
            </slot>
            <p-button v-if="headerCloseButtonVisible"
                      class="close-modal-btn"
                      :force-class="['close']"
                      @click="onCloseClick"
            >
                <span aria-hidden="true">&times;</span>
            </p-button>
        </template>
        <template #body>
            <slot name="body" />
        </template>
        <template #footer>
            <slot name="footer">
                <slot name="footer-extra" />
                <p-button
                    v-if="footerCancelButtonVisible"
                    class="p-btn-modal-btn"
                    v-bind="footerCancelButtonBind"
                    @click="onCancelClick"
                >
                    <slot name="close-button">
                        {{ tr('COMMON.BTN_CANCEL') }}
                    </slot>
                </p-button>
                <p-button v-if="footerConfirmButtonVisible"
                          v-bind="footerConfirmButtonBind"
                          :disabled="loading"
                          class="p-btn-modal-btn"

                          @click="onConfirmClick"
                >
                    <div class="confirm-btn">
                        <p-lottie v-if="loading" class="spinner"
                                  name="spinner"
                                  auto
                                  :size="1.5"
                        />
                        <slot name="confirm-button">
                            {{ tr('COMMON.BTN_CONFIRM') }}
                        </slot>
                    </div>
                </p-button>
            </slot>
        </template>
    </p-content-modal>
</template>

<script>
import PButton from '@/components/atoms/buttons/Button.vue';
import PContentModal, { setup as contentModalSetup } from '@/components/organisms/modals/content-modal/ContentModal.vue';
import PLottie from '@/components/molecules/lottie/PLottie.vue';

export const setup = (props, context) => {
    const state = contentModalSetup(props, context);
    const onCloseClick = () => {
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
    components: { PContentModal, PButton, PLottie },
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
<style lang="scss" scoped>
    .close-modal-btn {
        cursor: pointer;
        color: $dark;
    }
    .p-btn-modal-btn{
        height: 2.5rem;
        font-size: 1rem;
    }
    .confirm-btn {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100%;
        .spinner {
            display: inline-flex;
            padding-right: .25rem;
        }
    }
</style>
