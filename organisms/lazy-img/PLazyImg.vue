<template>
    <span class="p-lazy-img" :style="{height, width}">
        <transition-group name="fade-in">
            <span v-if="loading || (imgLoading && !isError)" key="loader" class="img-container">
                <slot name="preloader" :height="height" :width="width"
                      :imgLoading="imgLoading"
                >

                    <p-lottie name="thin-spinner"
                              auto
                              :height="height"
                              :width="width"
                              class="w-full h-full"
                    />
                </slot>
            </span>
            <span v-if="!loading" key="images" class="img-container">
                <transition-group name="fade-in">
                    <img v-show="!imgLoading && !isError"
                         key="img"
                         :style="{height, width}"
                         :src="src"
                         :alt="alt"
                         class="absolute"
                         @load="onLoad"
                         @error="onError"
                    >
                    <span v-if="isError" key="error-img" class="img-container error">
                        <slot name="error" :height="height" :width="width"
                              :imgLoading="imgLoading"
                        >
                            <p-i :name="errorIcon || 'ic_collector_tags'" :style="{height, width}"
                                 height="height"
                                 width="width"
                            />
                        </slot>
                    </span>
                </transition-group>
            </span>
        </transition-group>
    </span>
</template>

<script lang="ts">
import {
    computed,
    reactive, toRefs, watch,
} from '@vue/composition-api';
import PLottie from '@/components/molecules/lottie/PLottie.vue';
import { LazyImgPropsType } from '@/components/organisms/lazy-img/type';
import PI from '@/components/atoms/icons/PI.vue';

export default {
    name: 'PLazyImg',
    components: {
        PLottie,
        PI,
    },
    props: {
        height: {
            type: String,
            default: '2rem',
        },
        width: {
            type: String,
            default: '2rem',
        },
        src: {
            type: String,
            required: true,
        },
        errorIcon: {
            type: String,
            default: 'ic_collector_tags',
        },
        loading: {
            type: Boolean,
            default: false,
        },
        alt: {
            type: String,
            default: undefined,
        },
    },
    setup(props: LazyImgPropsType, { emit }) {
        const state = reactive({
            imgLoading: true,
            isError: false,
        });

        // watch(() => props.src, (val) => {
        //     if (val) {
        //         state.imgLoading = true;
        //         state.isError = false;
        //     }
        // }, { immediate: true });
        return {
            ...toRefs(state),
            onLoad() {
                state.imgLoading = false;
            },
            onError() {
                state.isError = true;
            },
        };
    },
};
</script>

<style lang="postcss">
    .p-lazy-img {
        @apply inline-block relative;
        .img-container {
            @apply inline-block w-full h-full absolute rounded-sm overflow-hidden;
            &.error {
                @apply inline-flex;
            }
        }
        .fade-in-leave-active, .fade-in-enter-active {
            transition: opacity 0.5s;
        }
        .fade-in-leave-to, .fade-in-enter {
            opacity: 0;
        }
        .fade-in-enter-to, .fade-in-leave {
            opacity: 1;
        }
    }
</style>
