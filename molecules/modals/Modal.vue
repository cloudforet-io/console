<template>
    <div :class="classObject" style="display: block" v-if="visible" role="dialog">
        <div :class="dialogClassObject" role="document">
            <div class="modal-content">
            <slot></slot>
            </div>
        </div>
    </div>
</template>

<script>
import { size_mapping } from './ModalMapping';
export default {
    name: 'p-modal',
    model: {
        prop: 'visible',
        event: 'change'
    },
    events: ['beforeClose'],
    props: {
        visible: {
            type: Boolean,
            default: false
        },
        fade: {
            type: Boolean,
            default: false
        },
        scrollable: {
            type: Boolean,
            default: true
        },
        size: {
            type: String,
            default: null,
            validator: (value) => size_mapping.hasOwnProperty(value)
        },
        centered: {
            type: Boolean,
            default: false
        }
    },
    computed: {
        classObject() {
            return [
                'modal',
                { fade: this.fade }
            ];
        },
        dialogClassObject() {
            return [
                'modal-dialog',
                { 'modal-dialog-scrollable': this.scrollable },
                { 'modal-dialog-centered' : this.centered },
                size_mapping[this.size]
            ];
        }
    },
    methods: {
        show() {
            if (!this.visible) {
                /**
                 * modal visible change
                 * @event chagne
                 * @type boolean
                 */
                this.$emit('change', true);
            }
        },
        hide() {
            if (this.visible) {
                this.$emit('change', false);
            }
        },
        toggle() {
            this.$emit('change', !this.visible);
        }
    }
};
</script>

<style scoped>

</style>
