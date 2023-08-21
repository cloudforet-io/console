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
                 :style="{height, width}"
                 :src="src || ''"
                 :alt="alt"
                 @load="handleLoad"
                 @error="handleError"
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

<script setup lang="ts">
import {
    reactive, watch,
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

const state = reactive({
    status: LOAD_STATUS.loading,
});


watch(() => props.src, (src, before) => {
    if (!src && src === before) {
        state.status = LOAD_STATUS.errored;
    } else {
        state.status = LOAD_STATUS.loading;
    }
}, { immediate: true });


const handleLoad = () => {
    if (!props.loading) {
        state.status = LOAD_STATUS.succeed;
    }
};

const handleError = () => {
    if (!props.loading) {
        state.status = LOAD_STATUS.errored;
    }
};

</script>

<style lang="postcss">
.p-lazy-img {
    @apply inline-block relative;
    z-index: 0;
    .img-container {
        @apply inline-block w-full h-full absolute rounded-md overflow-hidden;
        z-index: 1;
        left: 0;
        &.error {
            @apply inline-flex;
        }
    }
    .fade-in-leave-active, .fade-in-enter-active {
        transition: visibility 0.25s;
    }
    .fade-in-leave-to, .fade-in-enter-from {
        visibility: hidden;
    }
    .fade-in-enter-to, .fade-in-leave-from {
        visibility: visible;
    }
}
</style>
