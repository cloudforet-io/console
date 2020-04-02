<template>
    <span class="inline-block" :style="{height, width}">
        <slot v-if="loading && !isError"
              name="preloader" :height="height" :width="width"
              :loading="loading"
        >
            <p-lottie name="spinner"
                      auto
                      :height="height"
                      :width="width"
                      class="w-full h-full"
            />
        </slot>
        <img v-show="!loading && !isError"
             :style="{height, width}"
             :src="imgUrl"
             @load="onLoad"
             @error="onError"
        >
        <slot v-if="isError"
              name="error" :height="height" :width="width"
              :loading="loading"
        >
            <p-i :name="errorIcon || 'ic_collector_tags'" :style="{height, width}"
                 height="height"
                 width="width"
            />
        </slot>
    </span>
</template>

<script lang="ts">
import { defineComponent, reactive, toRefs } from '@vue/composition-api';
import PLottie from '@/components/molecules/lottie/PLottie.vue';
import { lazyImgProps, LazyImgPropsType } from '@/components/organisms/lazy-img/LazyImg.toolset';
import PI from '@/components/atoms/icons/PI.vue';

export default defineComponent({
    name: 'PLazyImg',
    components: {
        PLottie,
        PI,
    },
    props: lazyImgProps,
    setup(props: LazyImgPropsType, { emit }) {
        const state = reactive({
            loading: true,
            isError: false,
        });
        return {
            ...toRefs(state),
            onLoad() {
                state.loading = false;
            },
            onError() {
                state.isError = true;
            },
        };
    },
});
</script>

<style lang="postcss" scoped>

</style>
