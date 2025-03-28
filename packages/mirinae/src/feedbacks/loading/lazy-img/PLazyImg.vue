<script lang="ts" setup>
import {
    computed, reactive, ref, watch,
} from 'vue';

import PSkeleton from '@/feedbacks/loading/skeleton/PSkeleton.vue';
import PI from '@/foundation/icons/PI.vue';

interface Props {
    height?: string;
    width?: string;
    src?: string;
    errorIcon?: string;
    errorIconColor?: string;
    loading?: boolean;
    alt?: string;
}

enum LOAD_STATUS {
    loading = 'loading',
    succeed = 'succeed',
    errored = 'errored'
}

const props = withDefaults(defineProps<Props>(), {
    height: '2rem',
    width: '2rem',
    src: undefined,
    errorIcon: 'ic_resource_hexagon',
    errorIconColor: '',
    loading: undefined,
    alt: undefined,
});

const imageRef = ref<HTMLImageElement|null>(null);

const state = reactive({
    status: LOAD_STATUS.loading,
    imageWidth: 0,
    imageHeight: 0,
    isRectangle: computed<boolean>(() => state.imageWidth !== state.imageHeight),
});

const onLoad = () => {
    if (!props.loading) {
        state.status = LOAD_STATUS.succeed;
    }
    if (imageRef.value) {
        state.imageWidth = imageRef.value.naturalWidth;
        state.imageHeight = imageRef.value.naturalHeight;
    }
};
const onError = () => {
    if (!props.loading) {
        state.status = LOAD_STATUS.errored;
    }
};

watch(() => props.src, (src, before) => {
    if (!src && src === before) {
        state.status = LOAD_STATUS.errored;
    } else {
        state.status = LOAD_STATUS.loading;
    }
}, { immediate: true });
</script>

<template>
    <transition-group name="fade-in"
                      tag="span"
                      class="p-lazy-img"
                      :style="{height, width}"
    >
        <span v-if="!loading"
              key="img"
              class="img-container"
        >
            <img v-show="state.status === LOAD_STATUS.succeed"
                 ref="imageRef"
                 :style="{
                     height: state.isRectangle ? 'auto' : height,
                     width,
                     maxHeight: height,
                 }"
                 :src="props.src || ''"
                 :alt="alt"
                 @load="onLoad"
                 @error="onError"
            >
        </span>
        <span v-show="!loading && state.status === LOAD_STATUS.errored"
              key="error-img"
              class="img-container error"
        >
            <slot name="error"
                  v-bind="{...$props, ...$data}"
            >
                <p-i :name="errorIcon || 'ic_resource_hexagon'"
                     :style="{height, width}"
                     :height="height"
                     :color="errorIconColor"
                     :width="width"
                />
            </slot>
        </span>
        <span v-show="loading || state.status === LOAD_STATUS.loading"
              key="loader"
              class="img-container"
        >
            <slot name="preloader"
                  v-bind="{...$props, ...$data}"
            >
                <p-skeleton :height="height"
                            :width="width"
                />
            </slot>
        </span>
    </transition-group>
</template>

<style lang="postcss">
.p-lazy-img {
    @apply inline-block relative;
    z-index: 0;
    .img-container {
        @apply inline-flex items-center w-full h-full absolute rounded-md overflow-hidden;
        z-index: 1;
        left: 0;
        &.error {
            @apply inline-flex;
        }
    }
    .fade-in-leave-active, .fade-in-enter-active {
        transition: visibility 0.1ms;
    }
    .fade-in-leave-to, .fade-in-enter {
        visibility: hidden;
    }
    .fade-in-enter-to, .fade-in-leave {
        visibility: visible;
    }
}
</style>
