<template>
    <div class="p-data-loader">
        <div class="data-loader-container">
            <div v-show="(showDataFromScratch || state.dataLoadOccurred) && state.showEmptyCase"
                 key="no-data"
                 class="no-data-wrapper"
            >
                <slot name="no-data">
                    {{ t('COMPONENT.DATA_LOADER.NO_DATA') }}
                </slot>
            </div>

            <div v-show="(showDataFromScratch || state.dataLoadOccurred) && !state.showEmptyCase"
                 key="data"
                 class="data-wrapper"
            >
                <slot v-bind="{isEmpty}" />
            </div>

            <div v-show="state.showLoader"
                 key="loader"
                 class="loader-wrapper"
                 :class="{
                     'no-empty-case': disableEmptyCase && isEmpty,
                     'fade-out': state.isTransitioning,
                     'fade-out-from': isLoading,
                     'fade-out-to': !isLoading,
                 }"
            >
                <div class="loader-backdrop"
                     :style="{
                         opacity: loaderBackdropOpacity,
                         backgroundColor: state.refinedLoaderBackdropColor
                     }"
                />
                <div class="loader"
                     :class="{[loaderType]: !slots.loader}"
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

<script setup lang="ts">
import { isEmpty } from 'lodash';
import type { ComputedRef, WatchStopHandle } from 'vue';
import {
    computed, reactive, useSlots, watch,
} from 'vue';
import { useI18n } from 'vue-i18n';

import type { LoaderTypes } from '@/feedbacks/loading/data-loader/config';
import { LOADER_TYPES } from '@/feedbacks/loading/data-loader/config';
import PSkeleton from '@/feedbacks/loading/skeleton/PSkeleton.vue';
import PSpinner from '@/feedbacks/loading/spinner/PSpinner.vue';
import type { SpinnerSize } from '@/feedbacks/loading/spinner/type';
import { SPINNER_SIZE } from '@/feedbacks/loading/spinner/type';
import { getColor } from '@/utils/helpers';

interface Props {
    loading: boolean;
    data?: any;
    loaderType: LoaderTypes;
    spinnerSize: SpinnerSize;
    disableEmptyCase: boolean;
    showDataFromScratch: boolean;
    minLoadingTime: number;
    lazyLoadingTime: number;
    loaderBackdropOpacity: number;
    loaderBackdropColor: string;
    disableTransition: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    loading: false,
    data: undefined,
    loaderType: LOADER_TYPES.spinner,
    spinnerSize: SPINNER_SIZE.xl,
    disableEmptyCase: false,
    showDataFromScratch: false,
    minLoadingTime: 0,
    lazyLoadingTime: 0,
    loaderBackdropOpacity: 0.5,
    loaderBackdropColor: '#fff',
    disableTransition: false,
});
const { t } = useI18n();
const slots = useSlots();

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
