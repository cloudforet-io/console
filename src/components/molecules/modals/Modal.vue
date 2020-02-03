<template>
    <transition v-if="visible" name="modal">
        <div class="modal-mask" :class="{'no-backdrop':!backdrop}">
            <div class="modal-wrapper modal-dialog" :class="dialogClassObject" role="document">
                <div class="modal-content">
                    <slot />
                </div>
            </div>
        </div>
    </transition>
</template>

<script>
import { computed } from '@vue/composition-api';
import { sizeMapping } from './ModalMapping';

const setup = (props, { emit }) => {
    const dialogClassObject = computed(() => [
        { 'modal-dialog-scrollable': props.scrollable },
        { 'modal-dialog-centered': props.centered },
        sizeMapping[props.size],
    ]);
    const hide = () => {
        if (props.visible) { emit('update:visible', false); }
    };

    return {
        dialogClassObject,
        show() {
            if (!props.visible) { emit('update:visible', true); }
        },
        hide,
        toggle() {
            emit('update:visible', !props.visible);
        },
    };
};

export const propsMixin = {
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
        visible: { // sync
            type: Boolean,
            default: false,
        },
    },
};
export default {
    name: 'PModal',
    events: ['hidden', 'shown'],
    mixins: [propsMixin],
    setup(props, context) {
        return setup(props, context);
    },


};
</script>

<style lang="scss" scoped>
.modal-content{
    border-radius: 2px;
    background: $white 0% 0% no-repeat padding-box;
    box-shadow: 0px 0px 16px #22253252;
    border: 1px solid $gray3;
    transition: all .3s ease;
}
.modal-mask {
    position: fixed;
    z-index: 9998;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, .5);
    transition: opacity .3s ease;
    &.no-backdrop{
        background-color: rgba(0, 0, 0, 0);
    }
}

.modal-enter {
    opacity: 0;
}

.modal-leave-active {
    opacity: 0;
}

</style>
