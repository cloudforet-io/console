<template>
    <transition name="fade-in">
        <div v-if="value" class="spinner-container"
             :class="{backdrop: backdrop}"
        >
            <span class="spinner" :class="`fa-${size}x`">
                <i class="fad fa-circle-notch fa-spin" />
            </span>
        </div>
    </transition>
</template>

<script>
export default {
    name: 'BaseSpinner',
    model: {
        prop: 'value',
        event: 'input',
    },
    props: {
        value: {
            type: Boolean,
            required: true,
        },
        size: {
            type: Number,
            default: 2,
        },
        backdrop: {
            type: Boolean,
            default: true,
        },
    },
};
</script>

<style lang="scss" scoped>
.spinner-container {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
    &.backdrop {
        background: rgba($white, .5);
    }
    .spinner {
        position: absolute;
        display: inline-block;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
    }

    &.fade-in-enter-active {
        transition: opacity .3s, visibility .3s;
    }
    &.fade-in-leave-active {
        transition: opacity .3s, visibility .3s;
    }
    &.fade-in-enter, &.fade-in-leave-to {
        visibility: hidden;
        opacity: 0;
    }
    &.fade-in-leave, &.fade-in-enter-to {
        visibility: visible;
        opacity: 1;
    }
}
</style>
