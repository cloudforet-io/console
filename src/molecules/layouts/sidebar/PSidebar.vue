<template>
    <div class="p-sidebar">
        <div class="non-sidebar-wrapper">
            <slot name="default" />
        </div>
        <transition name="slide-fade">
            <div v-if="proxyVisible" class="sidebar-wrapper">
                <div class="top-wrapper">
                    <p class="title">
                        <slot name="title">
                            {{ title }}
                        </slot>
                    </p>
                    <p-icon-button class="close-btn" name="ic_delete" @click.stop="onClickClose" />
                </div>
                <div class="contents-wrapper">
                    <slot name="sidebar" />
                </div>
            </div>
        </transition>
    </div>
</template>

<script lang="ts">
import { computed, reactive, toRefs } from '@vue/composition-api';
import PIconButton from '@/molecules/buttons/icon-button/PIconButton.vue';

export default {
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
};
</script>

<style lang="postcss">
.p-sidebar {
    @apply h-full w-full flex overflow-hidden;
    .non-sidebar-wrapper {
        @apply flex-grow;
    }
    .sidebar-wrapper {
        @apply h-full flex-shrink-0 flex flex-col bg-white;
        width: 25vw;
        min-width: 20rem;
        padding: 1.5rem;
        box-shadow: 0 0 0.5rem rgba(theme('colors.black'), 0.08);
    }
    .top-wrapper {
        @apply flex-shrink-0 flex;
        .title {
            flex-grow: 1;
            font-size: 1.125rem;
            line-height: 1.4;
        }
        .close-btn {
            @apply text-gray-400;
            flex-shrink: 0;
        }
    }
    .contents-wrapper {
        @apply h-full;
    }
    $translate-width: 20rem;
    .slide-fade-enter-active, .slide-fade-leave-active {
        transition: all 0.3s ease-in-out;
    }
    .slide-fade-enter, .slide-fade-leave-to {
        margin-left: -$(translate-width);
        transform: translateX($(translate-width));
        opacity: 0;
    }
}
</style>
