<template>
    <p-modal v-bind="$props" @shown="onShown" @hidden="onHidden" ref="modal">
        <div class="modal-header" v-if="headerVisible" :class="headerClass">
            <slot name="header"></slot>
        </div>
        <div class="modal-body" v-if="bodyVisible" :class="bodyClass">
            <slot name="body"></slot>
        </div>
        <div class="modal-footer" v-if="footerVisible" :class="footerClass">
            <slot name="footer"></slot>
        </div>
    </p-modal>
</template>

<script>
import 'bootstrap';
import PModal from '../../molecules/modals/Modal.vue';

export default {
    name: 'p-content-modal',
    mixins: [PModal],
    components: { PModal },
    props: {
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
    computed: {
        modalElement() {
            return this.$refs.modal.$el;
        },
    },
};
</script>

<style scoped>

</style>
