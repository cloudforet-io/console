<template>
    <span class="inline-block relative" :style="{height, width}">
        <transition-group name="fade-in">
            <span v-if="loading || imgLoading && !isError" key="loader" class="img-container">
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
                         :src="imgUrl"
                         class="absolute"
                         @load="onLoad"
                         @error="onError"
                    >
                    <span v-if="isError" key="error-img" class="img-container">
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
    reactive, toRefs, watch,
} from '@vue/composition-api';
import PLottie from '@/components/molecules/lottie/PLottie.vue';
import { lazyImgProps, LazyImgPropsType } from '@/components/organisms/lazy-img/PLazyImg.toolset';
import PI from '@/components/atoms/icons/PI.vue';

export default {
    name: 'PLazyImg',
    components: {
        PLottie,
        PI,
    },
    props: lazyImgProps,
    setup(props: LazyImgPropsType, { emit }) {
        const state = reactive({
            imgLoading: true,
            isError: false,
        });

        watch(() => props.imgUrl, (val) => {
            if (val) {
                state.imgLoading = true;
                state.isError = false;
            }
        }, { immediate: true });
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

<style lang="postcss" scoped>
    .img-container {
      @apply inline-block w-full h-full absolute rounded-sm overflow-hidden;
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
</style>
