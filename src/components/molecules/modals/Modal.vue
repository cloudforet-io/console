<template>
    <div
        ref="modal"
        class="modal"
        :class="classObject"
        tabindex="-1"
        role="dialog"
    >
        <div class="modal-dialog" :class="dialogClassObject" role="document">
            <div class="modal-content">
                <slot></slot>
            </div>
        </div>
    </div>
</template>

<script>
import $ from 'jquery';
import 'bootstrap';
import { sizeMapping } from './ModalMapping';

export default {
    name: 'p-modal',
    events: ['hidden', 'shown'],
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
            default: null,
            validator: value => value in sizeMapping,
        },
        centered: {
            type: Boolean,
            default: false,
        },
        backdrop: {
            type: Boolean,
            default: true,
        },
        keyboard: {
            type: Boolean,
            default: true,
        },
    },
    computed: {
        classObject() {
            return [
                { fade: this.fade },
            ];
        },
        dialogClassObject() {
            return [
                { 'modal-dialog-scrollable': this.scrollable },
                { 'modal-dialog-centered': this.centered },
                sizeMapping[this.size],
            ];
        },
        modalOption() {
            return {
                backdrop: this.backdrop,
                keyboard: this.keyboard,
                show: false,
            };
        },
        modalElement() {
            return this.$refs.modal;
        },
    },
    data() {
        return {
            visible: false,
            is_shown: false,
            is_hidden: true,
        };
    },
    mounted() {
        this.mountedHandler();
    },
    watch: {
        backdrop() {
            $(this.modalElement).modal({ backdrop: this.backdrop });
        },
        keyboard() {
            $(this.modalElement).modal({ keyboard: this.keyboard });
        },
        visible(newValue, oldValue) {
            this.$nextTick(function () {
                if (newValue !== oldValue) {
                    if (newValue) {
                        $(this.modalElement).modal('show');
                    } else {
                        $(this.modalElement).modal('hide');
                    }
                }
            });
        },
    },
    methods: {
        mountedHandler() {
            if (this.$vnode.componentOptions.tag === 'p-modal') {
                $(this.modalElement).modal(this.modalOption);
                $(this.modalElement).on('shown.bs.modal', this.onShown);
                $(this.modalElement).on('hidden.bs.modal', this.onHidden);
            }
        },
        show() {
            if (!this.visible && this.modalElement) {
                this.visible = true;
            }
        },
        hide() {
            if (this.visible && this.modalElement) {
                this.visible = false;
            }
        },
        toggle() {
            if (this.visible && this.modalElement) {
                this.hide();
            } else {
                this.show();
            }
        },
        onShown() {
            this.is_shown = true;
            this.is_hidden = false;
            this.$emit('shown');
        },
        onHidden() {
            this.is_shown = false;
            this.is_hidden = true;
            this.$emit('hidden');
        },
    },
    beforeDestroy() {
        $(this.modalElement).modal('dispose');
    },
};
</script>

<style scoped>

</style>
