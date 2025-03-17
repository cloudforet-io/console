<template>
    <div class="p-sidebar"
         :class="[styleType, {'backdrop': backdrop}]"
    >
        <div class="non-sidebar-wrapper">
            <slot name="default" />
        </div>
        <transition name="slide-fade">
            <div v-if="proxyVisible"
                 class="sidebar-wrapper"
                 :class="{[size]: true, 'fixed-size': isFixedSize}"
            >
                <div class="inner"
                     :style="{overflowY: disableScroll ? 'unset' : 'auto'}"
                >
                    <p class="title"
                       :class="{'mb-4': !!title || !!$scopedSlots.title}"
                    >
                        <slot name="title">
                            {{ title }}
                        </slot>
                    </p>
                    <p-icon-button v-if="!hideCloseButton"
                                   class="close-button"
                                   name="ic_close"
                                   size="lg"
                                   @click.stop="onClickClose"
                    />
                    <div class="contents-wrapper">
                        <slot name="sidebar" />
                    </div>
                </div>
                <span class="footer">
                    <slot name="footer" />
                </span>
            </div>
        </transition>
    </div>
</template>

<script lang="ts">
import type { PropType } from 'vue';
import {
    computed, defineComponent, reactive, toRefs,
} from 'vue';

import PIconButton from '@/controls/buttons/icon-button/PIconButton.vue';
import type { SidebarProps } from '@/layouts/sidebar/type';
import {
    STYLE_TYPE as SIDEBAR_STYLE_TYPE,
    SIZE as SIDEBAR_SIZE,
} from '@/layouts/sidebar/type';

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
        styleType: {
            type: String as PropType<SidebarProps['styleType']>,
            default: SIDEBAR_STYLE_TYPE.primary,
        },
        size: {
            type: String as PropType<SidebarProps['size']>,
            default: SIDEBAR_SIZE.md,
        },
        isFixedSize: {
            type: Boolean,
            default: false,
        },
        hideCloseButton: {
            type: Boolean,
            default: false,
        },
        disableScroll: {
            type: Boolean,
            default: false,
        },
        backdrop: {
            type: Boolean,
            default: false,
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

    &.backdrop {
        background-color: rgba(theme('colors.gray.900'), 0.5);
    }

    .non-sidebar-wrapper {
        overflow-y: auto;
        width: 100%;
        height: 100%;
    }
    $max-height: 20rem;

    .sidebar-wrapper {
        @apply border-gray-200;
        position: fixed;
        height: 32vh;
        max-height: $(max-height);
        bottom: 0;
        left: 0;
        width: 100vw;
        min-width: unset;
        z-index: 99;
        border-top-width: 1px;

        padding: 1.75rem 0;
        box-shadow: 0 0 0.5rem rgba(theme('colors.black'), 0.08);
        overflow: hidden;

        &.xl {
            height: 100%;
        }

        .inner {
            padding: 0 1.5rem;
            height: 100%;
            width: 100%;
        }
        > .title {
            width: calc(100% - 2rem);
            min-height: 1.575rem;
            font-size: 1.125rem;
            line-height: 1.4;
        }
        .close-button {
            @apply absolute text-gray-400;
            top: 1.5rem;
            right: 1.5rem;
            z-index: 5;
            &:hover {
                @apply text-secondary;
            }
        }
        .footer {
            position: absolute;
            bottom: 0;
            right: 0;
            width: 100%;
        }
    }

    &.primary {
        .sidebar-wrapper {
            @apply bg-white;
        }
    }

    &.secondary {
        .sidebar-wrapper {
            @apply bg-secondary-2;
            padding: 1.75rem 0 1.5rem;
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

        $sidebar-sm: 20%;
        $sidebar-md: 25%;
        $sidebar-lg: 30%;
        $sidebar-xl: 90%;
        $sidebar-fixed-sm: 16.25rem;
        $sidebar-fixed-md: 20rem;
        $sidebar-fixed-lg: 25rem;
        $sidebar-fixed-xl: 108rem;

        @define-mixin sidebar-size $sidebar-size, $sidebar-fixed-size {
            width: $sidebar-size;
            .footer {
                width: $sidebar-size;
            }
            &.fixed-size {
                width: $sidebar-fixed-size;
                .footer {
                    width: $sidebar-fixed-size;
                }
            }
        }
        .sidebar-wrapper {
            position: static;
            height: 100%;
            max-height: 100%;
            z-index: unset;
            flex-shrink: 0;
            border-top-width: 0;
            border-left-width: 1px;
            &.sm {
                @mixin sidebar-size $sidebar-sm, $sidebar-fixed-sm;
            }
            &.md {
                @mixin sidebar-size $sidebar-md, $sidebar-fixed-md;
            }
            &.lg {
                @mixin sidebar-size $sidebar-lg, $sidebar-fixed-lg;
            }
            &.xl {
                @mixin sidebar-size $sidebar-xl, $sidebar-fixed-xl;
            }
        }

        @define-mixin sidebar-animation $sidebar-size, $sidebar-fixed-size {
            margin-left: -$(sidebar-size);
            &.fixed-size {
                margin-left: -$(sidebar-fixed-size);
            }
        }
        .slide-fade-enter, .slide-fade-leave-to {
            transform: translateX(100%);
            opacity: 0;
            &.sm {
                @mixin sidebar-animation $sidebar-sm, $sidebar-fixed-sm;
            }
            &.md {
                @mixin sidebar-animation $sidebar-md, $sidebar-fixed-md;
            }
            &.lg {
                @mixin sidebar-animation $sidebar-lg, $sidebar-fixed-lg;
            }
            &.xl {
                @mixin sidebar-animation $sidebar-xl, $sidebar-fixed-xl;
            }
        }
    }
}
</style>
