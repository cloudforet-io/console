<template>
    <div class="p-data-loader">
        <div class="data-loader-container">
            <div v-show="(showDataFromScratch || dataLoadOccurred) && showEmptyCase"
                 key="no-data"
                 class="no-data-wrapper"
            >
                <slot name="no-data">
                    {{ $t('COMPONENT.DATA_LOADER.NO_DATA') }}
                </slot>
            </div>

            <div v-show="(showDataFromScratch || dataLoadOccurred) && !showEmptyCase"
                 key="data"
                 class="data-wrapper"
            >
                <slot v-bind="{isEmpty}" />
            </div>

            <div v-show="showLoader"
                 key="loader"
                 class="loader-wrapper"
                 :class="{
                     'no-empty-case': disableEmptyCase && isEmpty,
                     'fade-out': isTransitioning,
                     'fade-out-from': isLoading,
                     'fade-out-to': !isLoading,
                 }"
            >
                <div class="loader-backdrop"
                     :style="{
                         opacity: loaderBackdropOpacity,
                         backgroundColor: refinedLoaderBackdropColor
                     }"
                />
                <div class="loader"
                     :class="{[loaderType]: !$scopedSlots.loader}"
                >
                    <slot name="loader">
                        <template v-if="loaderType === LOADER_TYPES.spinner">
                            <p-spinner :size="spinnerSize" />
                        </template>
                        <template v-else-if="loaderType === LOADER_TYPES.skeleton">
                            <p-skeleton />
                        </template>
                    </slot>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import type { ComputedRef, PropType, WatchStopHandle } from 'vue';
import {
    computed, defineComponent, reactive, toRefs, watch,
} from 'vue';

import { isEmpty } from 'lodash';

import { LOADER_TYPES } from '@/feedbacks/loading/data-loader/config';
import PSkeleton from '@/feedbacks/loading/skeleton/PSkeleton.vue';
import PSpinner from '@/feedbacks/loading/spinner/PSpinner.vue';
import type { SpinnerSize } from '@/feedbacks/loading/spinner/type';
import { SPINNER_SIZE } from '@/feedbacks/loading/spinner/type';
import { i18n } from '@/translations';
import { getColor } from '@/utils/helpers';

interface Props {
    loading: boolean;
    data?: any;
    loaderType: LOADER_TYPES;
    disableEmptyCase: boolean;
    showDataFromScratch: boolean;
    minLoadingTime: number;
    lazyLoadingTime: number;
    loaderBackdropOpacity: number;
    loaderBackdropColor: string;
    disableTransition: boolean;
}
export default defineComponent<Props>({
    name: 'PDataLoader',
    components: { PSpinner, PSkeleton },
    i18n,
    props: {
        loading: {
            type: Boolean,
            default: true,
        },
        data: {
            type: [Array, Object, Boolean, String, Number],
            default: undefined,
        },
        loaderType: {
            type: String as PropType<LOADER_TYPES>,
            default: LOADER_TYPES.spinner,
            validator(loaderType: LOADER_TYPES) {
                return Object.values(LOADER_TYPES).includes(loaderType);
            },
        },
        spinnerSize: {
            type: String as PropType<SpinnerSize>,
            default: SPINNER_SIZE.xl,
            validator(spinnerSize: SpinnerSize) {
                return Object.values(SPINNER_SIZE).includes(spinnerSize);
            },
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
        loaderBackdropOpacity: {
            type: Number,
            default: 0.5,
        },
        loaderBackdropColor: {
            type: String,
            default: 'white',
        },
        disableTransition: {
            type: Boolean,
            default: false,
        },
    },
    setup(props) {
        let isLoading: ComputedRef<boolean>;
        const state = reactive({
            dataLoadOccurred: false,
            showEmptyCase: computed(() => !props.disableEmptyCase && state.isEmpty),
            isEmpty: computed(() => {
                // if data is null or undefined, it regards as data is not loaded yet. so it's not empty case.
                if (props.data === null || props.data === undefined) return false;

                // in other cases, it checks if the data is empty.
                if (Array.isArray(props.data)) return props.data.length === 0;
                if (typeof props.data === 'boolean') return !props.data;
                return isEmpty(props.data);
            }),
            lazyLoading: props.loading,
            minLoading: props.loading,
            isTransitioning: false,
            showLoader: computed(() => (props.disableTransition ? isLoading.value : (isLoading.value || state.isTransitioning))),
            refinedLoaderBackdropColor: computed(() => getColor(props.loaderBackdropColor)),
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


        if (props.lazyLoadingTime) {
            if (props.minLoadingTime) isLoading = computed<boolean>(() => state.minLoading || state.lazyLoading);
            else isLoading = computed<boolean>(() => state.lazyLoading);
            registerLazyLoadingWatch();
        } else if (props.minLoadingTime) {
            isLoading = computed<boolean>(() => state.minLoading || props.loading);
            registerMinLoadingWatch();
        } else isLoading = computed<boolean>(() => props.loading);


        let stopDataLoadCheckWatch: WatchStopHandle;
        /*
            CAUTION: Do not make stopDataLoadCheckWatch as const variable.
            Related issue: https://github.com/webpack/webpack/issues/12724
         */
        // eslint-disable-next-line prefer-const
        stopDataLoadCheckWatch = watch(() => isLoading.value, (loading) => {
            if (!loading) {
                state.dataLoadOccurred = true;
                if (stopDataLoadCheckWatch) stopDataLoadCheckWatch();
            }
        }, { immediate: true });


        if (!props.disableTransition) {
            let transitionTimout;
            watch(() => isLoading.value, (loading) => {
                if (!loading) {
                    state.isTransitioning = true;
                    transitionTimout = setTimeout(() => {
                        state.isTransitioning = false;
                        transitionTimout = undefined;
                    }, 200);
                } else if (transitionTimout) {
                    clearTimeout(transitionTimout);
                    transitionTimout = undefined;
                    state.isTransitioning = false;
                }
            }, { immediate: true });
        }

        return {
            LOADER_TYPES,
            ...toRefs(state),
            isLoading,
        };
    },
});
</script>

<style lang="postcss">
.p-data-loader {
    @apply w-full;
    > .data-loader-container {
        @apply relative w-full h-full overflow-hidden;
        min-height: inherit;
        > .loader-wrapper {
            @apply absolute w-full h-full overflow-hidden;
            top: 0;
            z-index: 1;
            &.no-empty-case {
                @apply static;
            }
            &.fade-out {
                transition: opacity 0.2s;
            }
            &.fade-out-from {
                opacity: 1;
            }
            &.fade-out-to {
                opacity: 0;
            }
            > .loader-backdrop {
                @apply w-full h-full;
            }
            > .loader {
                @apply absolute flex w-full h-full justify-center items-center;
                top: 0;
                z-index: 1;
                &.spinner {
                    max-height: 16.875rem;
                }
                &.skeleton {
                    height: 100%;
                    > .p-skeleton {
                        height: 100%;
                    }
                }
            }
        }

        > .no-data-wrapper {
            @apply justify-center items-center flex w-full text-gray-300 text-center;
            line-height: 120%;
            font-size: 1rem;
            height: calc(100% - 2rem);
            max-height: 16.875rem;
            min-height: inherit;
        }

        > .data-wrapper {
            @apply overflow-y-auto h-full;
        }
    }
}
</style>
