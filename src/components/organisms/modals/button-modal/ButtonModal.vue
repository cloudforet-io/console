<template>
    <p-content-modal ref="modal" v-bind="$props" @shown="onShown"
                     @hidden="onHidden"
    >
        <template #header>
            <slot name="header">
                {{ headerTitle }}
            </slot>
            <p-button v-if="headerCloseButtonVisible"
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
import 'bootstrap';
import PButton from '../../../atoms/buttons/Button';
import PContentModal from '../content-modal/ContentModal';
import buttonActionMixin from './ButtonModal.mixins';

export default {
    name: 'PButtonModal',
    components: { PContentModal, PButton },
    mixins: [PContentModal, buttonActionMixin],
    events: ['close', 'cancel', 'confirm'],
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


    },
    computed: {
        modalElement() {
            return this.$refs.modal.$children[0].$el;
        },
    },

};
</script>

<style scoped>

</style>
