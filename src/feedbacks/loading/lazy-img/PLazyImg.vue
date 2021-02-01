<template>
    <transition-group name="fade-in" tag="span" class="p-lazy-img"
                      :style="{height, width}"
    >
        <span v-if="loading || (imgLoading && !isError)" key="loader"
              class="img-container" v-on="$listeners"
        >
            <slot name="preloader" :height="height" :width="width"
                  :imgLoading="imgLoading"
            >
                <p-skeleton :height="height" :width="width" />
            </slot>
        </span>
        <transition-group v-if="!loading" key="images" tag="span"
                          name="fade-in" class="img-container"
        >
            <img v-show="!imgLoading && !isError"
                 key="img"
                 :style="{height, width}"
                 :src="src"
                 :alt="alt"
                 class="absolute"
                 @load="onLoad"
                 @error="onError"
                 v-on="$listeners"
            >
            <span v-if="isError" key="error-img" class="img-container error"
                  v-on="$listeners"
            >
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
    </transition-group>
</template>

<script lang="ts">
import {
    ComponentRenderProxy,
    computed, getCurrentInstance,
    reactive, toRefs, watch,
} from '@vue/composition-api';
import PLottie from '@/foundation/lottie/PLottie.vue';
import { LazyImgPropsType } from '@/feedbacks/loading/lazy-img/type';
import PI from '@/foundation/icons/PI.vue';
import { makeOptionalProxy } from '@/util/composition-helpers';
import PSkeleton from '@/feedbacks/loading/skeleton/PSkeleton.vue';

export default {
    name: 'PLazyImg',
    components: {
        PSkeleton,
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
            default: undefined,
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
        strictMode: {
            type: Boolean,
            default: false,
        },
    },
    setup(props: LazyImgPropsType, { emit }) {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const state = reactive({
            imgLoading: true,
            isError: false,
        });

        watch(() => props.src, (val) => {
            state.imgLoading = true;
            state.isError = false;
        });
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
        transition: opacity 0.25s;
    }
    .fade-in-leave-to, .fade-in-enter {
        opacity: 0;
    }
    .fade-in-enter-to, .fade-in-leave {
        opacity: 1;
    }
}
</style>
