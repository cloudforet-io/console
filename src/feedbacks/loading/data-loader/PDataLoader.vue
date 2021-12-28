<template>
    <div class="p-data-loader">
        <div class="data-loader-container">
            <div v-show="(showDataFromScratch || dataLoadOccurred) && showEmptyCase" key="no-data" class="no-data-wrapper">
                <slot name="no-data">
                    {{ $t('COMPONENT.DATA_LOADER.NO_DATA') }}
                </slot>
            </div>

            <div v-show="(showDataFromScratch || dataLoadOccurred) && !showEmptyCase" key="data" class="data-wrapper">
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
    computed, ComputedRef, defineComponent, reactive, toRefs, watch,
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
    showDataFromScratch: boolean;
    minLoadingTime: number;
    lazyLoadingTime: number;
}
export default defineComponent<Props>({
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
        showDataFromScratch: {
            type: Boolean,
            default: false,
        },
        minLoadingTime: {
            type: Number,
            default: 0,
            validator(minLoadingTime: number) {
                return minLoadingTime >= 0;
            },
        },
        lazyLoadingTime: {
            type: Number,
            default: 0,
            validator(lazyLoadingTime: number) {
                return lazyLoadingTime >= 0;
            },
        },
    },
    setup(props) {
        const state = reactive({
            dataLoadOccurred: false,
            showEmptyCase: computed(() => !props.disableEmptyCase && state.isEmpty),
            isEmpty: computed(() => {
                if (!props.data) return false;
                if (Array.isArray(props.data)) return props.data.length === 0;
                return isEmpty(props.data);
            }),
            lazyLoading: props.loading,
            minLoading: props.loading,
        });

        const registerLazyLoadingWatch = () => {
            let lazyLoadingHandler;
            watch(() => props.loading, (loading) => {
                if (loading) {
                    if (!state.dataLoadOccurred) {
                        state.lazyLoading = true;
                        return;
                    }

                    state.lazyLoading = false;

                    if (lazyLoadingHandler) clearTimeout(lazyLoadingHandler);
                    lazyLoadingHandler = setTimeout(() => {
                        state.lazyLoading = true;
                    }, props.lazyLoadingTime);
                } else {
                    if (lazyLoadingHandler) clearTimeout(lazyLoadingHandler);
                    state.lazyLoading = false;
                }
            }, { immediate: true });

            if (props.minLoadingTime) {
                let minLoadingHandler;
                watch(() => state.lazyLoading, (lazyLoading) => {
                    if (lazyLoading) {
                        state.minLoading = true;

                        if (minLoadingHandler) clearTimeout(minLoadingHandler);
                        minLoadingHandler = setTimeout(() => {
                            state.minLoading = false;
                        }, props.minLoadingTime);
                    }
                }, { immediate: true });
            }
        };

        const registerMinLoadingWatch = () => {
            let minLoadingHandler;
            watch(() => props.loading, (loading) => {
                if (loading) {
                    state.minLoading = true;

                    if (minLoadingHandler) clearTimeout(minLoadingHandler);
                    minLoadingHandler = setTimeout(() => {
                        state.minLoading = false;
                    }, props.minLoadingTime);
                }
            }, { immediate: true });
        };


        let showLoader: ComputedRef<boolean>;
        if (props.lazyLoadingTime) {
            if (props.minLoadingTime) showLoader = computed<boolean>(() => state.minLoading || state.lazyLoading);
            else showLoader = computed<boolean>(() => state.lazyLoading);
            registerLazyLoadingWatch();
        } else if (props.minLoadingTime) {
            showLoader = computed<boolean>(() => state.minLoading || props.loading);
            registerMinLoadingWatch();
        } else showLoader = computed<boolean>(() => props.loading);


        const stopDataLoadCheckWatch = watch(() => showLoader.value, (after, before) => {
            if (before && !after) {
                state.dataLoadOccurred = true;
                if (stopDataLoadCheckWatch) stopDataLoadCheckWatch();
            }
        }, { immediate: true });

        return {
            LOADER_TYPES,
            ...toRefs(state),
            showLoader,
        };
    },
});
</script>

<style lang="postcss">
.p-data-loader {
    @apply w-full;
    .data-loader-container {
        @apply relative w-full h-full overflow-hidden;
        min-height: inherit;
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
        min-height: inherit;
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
