<template>
    <div  ref="modal" class="modal" :class="classObject"  tabindex="-1"  role="dialog">
        <div class="modal-dialog" :class="dialogClassObject" role="document">
            <div class="modal-content">
            <slot></slot>
            </div>
        </div>
    </div>
</template>

<script>
import $ from 'jquery';
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
                { fade: this.fade },
            ];
        },
        dialogClassObject() {
            return [
                { 'modal-dialog-scrollable': this.scrollable },
                { 'modal-dialog-centered' : this.centered },
                size_mapping[this.size]
            ];
        }
    },
    watch:{
        // visible(){
        //     /**
        //      * @description modal visible change
        //      * @event change
        //      * @type {boolean}
        //      */
        //     this.$emit('change', this.visible);
        //     if (this.visible){
        //         this.$refs.modal.modal('show');
        //     } else {
        //         this.$refs.modal.modal('hide');
        //     }
        //
        // }
    },
    methods: {
        show() {
            // if (!this.visible) {
            //     this.visible.set(true);
            // }

            let element = this.$refs.modal.$el;
            $('.modal').modal('show');
            debugger;


        },
        hide() {
            if (this.visible) {
                this.visible = false;
            }
        },
        toggle() {
            this.visible = !this.visible;
        }
    }
};
</script>

<style scoped>

</style>
