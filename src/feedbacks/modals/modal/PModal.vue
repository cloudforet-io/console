<template>
    <transition v-if="visible" name="modal">
        <div class="modal-mask" :class="{'no-backdrop':!backdrop}">
            <div class="modal-wrapper" :class="dialogClassObject">
                <slot />
            </div>
        </div>
    </transition>
</template>

<script lang="ts">
import { computed } from '@vue/composition-api';
import { ModalProps, sizeMapping } from '@/feedbacks/modals/type';


const setup = (props, { emit }) => {
    const dialogClassObject = computed(() => [
        { scrollable: props.scrollable },
        { centered: props.centered },
        props.size,
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

export default {
    name: 'PModal',
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
            default: 'md',
            validator: value => Object.keys(sizeMapping).includes(value),
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
    setup(props: ModalProps, { emit }) {
        const dialogClassObject = computed(() => [
            { scrollable: props.scrollable },
            { centered: props.centered },
            props.size,
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
    },
};
</script>

<style lang="postcss" scoped>

.modal-mask {
    position: fixed;
    display: flex;
    justify-content: center;
    z-index: 9998;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(theme('colors.gray.900'), 0.5);
    transition: opacity 0.3s ease;

    &.no-backdrop {
        background-color: transparent;
    }
}
.modal-wrapper {
    overflow: hidden;
    margin: 2rem;
    min-height: 30rem;
    max-height: calc(100vh - 4rem);
    width: 100vw;
    &.scrollable {
        overflow: auto;
    }
    &.centered {
        align-self: center;
    }
    &.sm {
        min-width: 100px;
        max-width: 300px;
    }
    &.md {
        min-width: 300px;
        max-width: 500px;
    }
    &.lg {
        min-width: 500px;
        max-width: 800px;
    }
    &.xl {
        min-width: 500px;
        max-width: 1140px;
    }
}

.modal-enter {
    opacity: 0;
}

.modal-leave-active {
    opacity: 0;
}

</style>
