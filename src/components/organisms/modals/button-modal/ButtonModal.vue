<template>
    <p-content-modal v-bind="$props" @shown="onShown" @hidden="onHidden" ref="modal">
        <template #header>
            <slot name="header">
                {{headerTitle}}
            </slot>
            <p-button :forceClass="['close']"
                      @click="onCloseClick"
                      v-if="headerCloseButtonVisible">
                <span aria-hidden="true">&times;</span>
            </p-button>

        </template>
        <template #body>
            <slot name="body"></slot>
        </template>
        <template #footer>
            <slot name="footer"></slot>
            <p-button
                v-if="footerCancelButtonVisible"
                v-bind="footerCancelButtonBind"
                @click="onCancelClick"
            >
                <slot name="close-button">close</slot>
            </p-button>
            <p-button v-if="footerConfirmButtonVisible"
                      v-bind="footerConfirmButtonBind"
                      @click="onConfirmClick"
            >
                <slot name="confirm-button">confirm</slot>
            </p-button>
        </template>
    </p-content-modal>
</template>

<script>
import 'bootstrap';
import PButton from '../../../atoms/buttons/Button.vue';
import PContentModal from '../content-modal/ContentModal.vue';

export default {
    name: 'p-button-modal',
    mixins: [PContentModal],
    components: { PContentModal, PButton },
    events: ['close', 'cancel', 'confirm'],
    computed: {
        modalElement() {
            return this.$refs.modal.$children[0].$el;
        },
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
                styleType: 'danger',
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
    methods: {
        onCloseClick() {
            this.$emit('close');
            this.hide();
        },
        onCancelClick() {
            this.$emit('cancel');
            if (this.hideOnCancel) {
                this.hide();
            }
        },
        onConfirmClick() {
            this.$emit('confirm');
        },
    },
};
</script>

<style scoped>

</style>
