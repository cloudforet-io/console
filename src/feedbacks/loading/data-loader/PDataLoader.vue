<template>
    <div class="p-data-loader">
        <div class="data-loader-container">
            <div v-if="!disableEmptyCase && isEmpty" key="no-data" class="no-data-wrapper">
                <slot name="no-data">
                    {{ $t('COMPONENT.DATA_LOADER.NO_DATA') }}
                </slot>
            </div>

            <div v-else key="data" class="data-wrapper">
                <slot />
            </div>

            <transition name="fade-in">
                <div v-if="showLoader" key="loader" class="loader-wrapper"
                     :class="{'no-empty-case': disableEmptyCase && isEmpty}"
                >
                    <div class="loader-backdrop" />
                    <div class="loader">
                        <slot name="loader">
                            <template v-if="loaderType === LOADER_TYPES.spinner">
                                <p-lottie name="thin-spinner" :size="spinnerSize"
                                          auto class="spinner"
                                />
                            </template>
                            <template v-else-if="loaderType === LOADER_TYPES.skeleton">
                                <p-skeleton class="skeleton" />
                            </template>
                        </slot>
                    </div>
                </div>
            </transition>
        </div>
    </div>
</template>

<script lang="ts">
import {
    computed, defineComponent, reactive, toRefs, watch,
} from '@vue/composition-api';
import { LOADER_TYPES } from '@/feedbacks/loading/data-loader/config';
import PLottie from '@/foundation/lottie/PLottie.vue';
import { i18n } from '@/translations';
import { isEmpty } from 'lodash';
import PSkeleton from '@/feedbacks/loading/skeleton/PSkeleton.vue';

interface Props {
    loading: boolean;
    data?: any;
    loaderType: LOADER_TYPES;
    disableEmptyCase: boolean;
    minLoadingTime: number;
    lazyLoadingTime: number;
}
export default defineComponent({
    name: 'PDataLoader',
    components: { PSkeleton, PLottie },
    i18n,
    props: {
        loading: {
            type: Boolean,
            default: true,
        },
        data: {
            type: [Array, Object],
            default: undefined,
        },
        loaderType: {
            type: String,
            default: LOADER_TYPES.spinner,
            validator(loaderType) {
                return Object.values(LOADER_TYPES).includes(loaderType as any);
            },
        },
        spinnerSize: {
            type: Number,
            default: 2.5,
        },
        disableEmptyCase: {
            type: Boolean,
            default: false,
        },
        minLoadingTime: {
            type: Number,
            default: 0,
        },
        lazyLoadingTime: {
            type: Number,
            default: 0,
        },
    },
    setup(props: Props) {
        const state = reactive({
            isEmpty: computed(() => {
                if (!props.data) return false;
                if (Array.isArray(props.data)) return props.data.length === 0;
                return isEmpty(props.data);
            }),
            showLoader: computed(() => {
                if (props.lazyLoadingTime) return state.lazyLoading;
                if (props.minLoadingTime) return state.minTimeLoading || props.loading;
                return props.loading;
            }),
            minTimeLoading: props.loading,
            lazyLoading: false,
        });

        let minLoadingHandler;
        let lazyLoadingHandler;
        watch(() => props.loading, (after, before) => {
            if (after === before) return;
            if (after) {
                if (props.minLoadingTime) {
                    state.minTimeLoading = true;

                    if (minLoadingHandler) clearTimeout(minLoadingHandler);
                    minLoadingHandler = setTimeout(() => {
                        state.minTimeLoading = false;
                    }, props.minLoadingTime);
                }


                if (props.lazyLoadingTime) {
                    state.lazyLoading = false;

                    if (lazyLoadingHandler) clearTimeout(lazyLoadingHandler);
                    lazyLoadingHandler = setTimeout(() => {
                        state.lazyLoading = true;
                    }, props.lazyLoadingTime);
                }
            } else if (props.lazyLoadingTime) {
                if (lazyLoadingHandler) clearTimeout(lazyLoadingHandler);
                state.lazyLoading = false;
            }
        }, { immediate: true });
        return {
            LOADER_TYPES,
            ...toRefs(state),
        };
    },
});
</script>

<style lang="postcss">
.p-data-loader {
    @apply w-full;
    .data-loader-container {
        @apply relative w-full h-full overflow-hidden;
    }
    .loader-wrapper {
        @apply absolute w-full h-full overflow-hidden;
        &.no-empty-case {
            @apply static;
        }
        top: 0;
        z-index: 1;
        .loader-backdrop {
            @apply w-full h-full;
            background-color: white;
            opacity: 0.5;
        }
        .loader {
            @apply absolute flex w-full h-full justify-center items-center;
            top: 0;
            z-index: 1;
            .spinner {
                max-height: 16.875rem;
            }
            .skeleton {
                height: 100%;
            }
        }
    }

    .no-data-wrapper {
        @apply justify-center items-center flex w-full text-gray-300 text-center;
        line-height: 120%;
        font-size: 1rem;
        height: calc(100% - 2rem);
        max-height: 16.875rem;
    }

    .data-wrapper {
        @apply overflow-y-auto h-full;
    }

    /* transitions */
    .fade-in-enter-active {
        transition: opacity 0.2s;
    }
    .fade-in-leave-active {
        transition: opacity 0.2s;
    }
    .fade-in-enter, .fade-in-leave-to {
        opacity: 0;
    }
    .fade-in-leave, .fade-in-enter-to {
        opacity: 1;
    }
}
</style>
