<template>
    <p-modal ref="modal"
             :fade="fade"
             :scrollable="scrollable"
             :size="size"
             :centered="centered"
             :backdrop="backdrop"
             :visible.sync="proxyVisible"
             :class="[`modal-${themeColor}`]"
    >
        <div v-if="headerVisible" class="modal-header" :class="headerClass">
            <slot name="header" />
        </div>
        <div v-if="bodyVisible" class="modal-body" :class="bodyClass">
            <slot name="body" />
        </div>
        <div v-if="footerVisible" class="modal-footer" :class="footerClass">
            <slot name="footer" />
        </div>
    </p-modal>
</template>

<script>
import { reactive, toRefs } from '@vue/composition-api';
import PModal, { propsMixin } from '@/components/molecules/modals/Modal.vue';
import { makeProxy } from '@/lib/compostion-util';

export const setup = (props, context) => {
    const state = reactive({
        proxyVisible: makeProxy('visible', props, context.emit),
        modal: null,
    });
    return {
        ...toRefs(state),
        show() {
            state.modal.show();
        },
        hide() {
            state.modal.hide();
        },
        toggle() {
            state.modal.toggle();
        },
    };
};

export default {
    name: 'PContentModal',
    components: { PModal },
    mixins: [propsMixin],
    setup(props, context) {
        return setup(props, context);
    },
    props: {
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
    },

};
</script>

<style lang="scss" scoped>/* b-modal */
.modal-dialog {
    .modal-header {
        padding: 1rem 1.5rem 1rem 1.5rem;
        font:  22px Arial;
    }
    .modal-body{
        padding: 2rem 1.5rem 1.5rem 1.5rem;
    }
    .modal-footer{
        padding: 1.5rem;
        border: none;
    }
}

@mixin modal-color($color) {
    .modal-header {
        border-bottom: 2px solid $color;
        color: $color;
    }
}

.modal-primary { @include modal-color($primary); }
.modal-primary-dark { @include modal-color($primary-dark); }
.modal-primary1 { @include modal-color($primary1); }
.modal-primary2 { @include modal-color($primary2); }
.modal-secondary { @include modal-color($secondary); }
.modal-secondary1 { @include modal-color($secondary1); }
.modal-safe { @include modal-color($safe); }
.modal-alert { @include modal-color($alert); }
.modal-other1 { @include modal-color($other1); }
.modal-other2 { @include modal-color($other2); }
.modal-other3 { @include modal-color($other3); }
.modal-other4 { @include modal-color($other4); }
.modal-dark { @include modal-color($dark); }
.modal-gray { @include modal-color($gray); }
</style>
