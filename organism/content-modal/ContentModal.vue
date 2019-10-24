<template>
    <p-modal
            :visible="visible"
            @change="onChange"
            :fade="fade"
            :scrollable="scrollable"
            :size="size"
            :centered="centered"

    >
        <div class="modal-header">
            <slot name="header"></slot>
        </div>
        <div class="modal-body">
            <slot name="body"></slot>
        </div>
        <div class="modal-footer">
            <slot name="footer"></slot>
        </div>
    </p-modal>
</template>

<script>
import PModal from '../../molecules/modals/Modal';
export default {
    name: 'p-content-modal',
    mixins:[PModal],
    components:{ PModal },
    methods:{
        onChange(event){
            this.$emit('change',event);
        }
    }
};
</script>

<style scoped>

</style>