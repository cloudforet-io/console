<template>
    <div class="p-sidebar">
        <div class="non-sidebar-wrapper">
            <slot name="default" />
        </div>
        <transition name="slide-fade">
            <div v-if="proxyVisible" class="sidebar-wrapper">
                <div class="inner">
                    <p class="title" :class="{'mb-4': !!title || !!$scopedSlots.title}">
                        <slot name="title">
                            {{ title }}
                        </slot>
                    </p>
                    <p-icon-button class="close-btn"
                                   name="ic_delete"
                                   size="lg"
                                   @click.stop="onClickClose"
                    />
                    <div class="contents-wrapper">
                        <slot name="sidebar" />
                    </div>
                </div>
            </div>
        </transition>
    </div>
</template>

<script lang="ts">
import {
    computed, defineComponent, reactive, toRefs,
} from '@vue/composition-api';
import PIconButton from '@/inputs/buttons/icon-button/PIconButton.vue';

export default defineComponent({
    name: 'PSidebar',
    components: { PIconButton },
    model: {
        prop: 'visible',
        event: 'update:visible',
    },
    props: {
        visible: {
            type: Boolean,
            default: false,
            required: true,
        },
        title: {
            type: String,
            default: '',
        },
    },
    setup(props, { emit, listeners }) {
        const state = reactive({
            proxyVisible: listeners.close || listeners['update:visible'] ? computed({
                get() {
                    return props.visible;
                },
                set() {
                    emit('update:visible');
                    emit('close');
                },
            }) : props.visible,
        });

        const onClickClose = () => {
            state.proxyVisible = false;
        };

        return {
            ...toRefs(state),
            onClickClose,
        };
    },
});
</script>

<style lang="postcss">
.p-sidebar {
    position: relative;
    display: flex;
    flex-direction: column;
    height: 100vh;
    width: 100vw;
    max-height: 100%;
    max-width: 100%;
    overflow: hidden;

    .non-sidebar-wrapper {
        overflow-y: auto;
        width: 100%;
    }
    $max-height: 20rem;
    .sidebar-wrapper {
        @apply bg-white border-gray-200;
        position: fixed;
        height: 32vh;
        max-height: $(max-height);
        bottom: 0;
        left: 0;
        width: 100vw;
        min-width: unset;
        z-index: 99;
        border-top-width: 1px;

        padding: 1.5rem 0;
        box-shadow: 0 0 0.5rem rgba(theme('colors.black'), 0.08);
        overflow: hidden;

        .inner {
            padding: 0 1.5rem;
            overflow-y: auto;
            height: 100%;
            width: 100%;
        }
        .title {
            width: calc(100% - 2rem);
            min-height: 2rem;
            font-size: 1.125rem;
            line-height: 2;
        }
        .close-btn {
            @apply absolute text-gray-400;
            top: 1.5rem;
            right: 1.5rem;
            &:hover {
                @apply text-secondary;
            }
        }
    }

    .slide-fade-enter-active, .slide-fade-leave-active {
        transition: all 0.2s linear;
    }

    .slide-fade-enter, .slide-fade-leave-to {
        transform: translateY($(max-height));
        opacity: 0;
    }

    @screen lg {
        flex-direction: row;

        $min-width: 20rem;
        .sidebar-wrapper {
            position: static;
            height: 100%;
            max-height: 100%;
            width: 25%;
            min-width: $(min-width);
            z-index: unset;
            flex-shrink: 0;
            border-top-width: 0;
            border-left-width: 1px;
        }
        .slide-fade-enter, .slide-fade-leave-to {
            margin-left: -25%;
            transform: translateX(100%);
            opacity: 0;
        }
    }
}
</style>
