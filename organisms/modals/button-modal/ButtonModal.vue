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
            <slot name="footer" />
            <p-button
                v-if="footerCancelButtonVisible"
                v-bind="footerCancelButtonBind"
                @click="onCancelClick"
            >
                <slot name="close-button">
                    close
                </slot>
            </p-button>
            <p-button v-if="footerConfirmButtonVisible"
                      v-bind="footerConfirmButtonBind"
                      @click="onConfirmClick"
            >
                <slot name="confirm-button">
                    confirm
                </slot>
            </p-button>
        </template>
    </p-content-modal>
</template>

<script>
import PButton from '../../../atoms/buttons/Button';
import PContentModal, { setup as contentModalSetup } from '../content-modal/ContentModal';

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
    components: { PContentModal, PButton },
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
                styleType: 'primary',
                outline: true,
            }),
        },
        footerConfirmButtonBind: {
            type: Object,
            default: () => ({
                styleType: 'primary',
            }),
        },
        hideOnCancel: {
            type: Boolean,
            default: true,
        },
    },

};
</script>
<style lang="scss" scoped>
    .close-modal-btn {
        cursor: pointer;
        color: $dark;
    }
</style>