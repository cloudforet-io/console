<template>
    <div class="p-data-loader">
        <transition-group name="fade-in" tag="div" class="data-loader-container">
            <div v-if="loading" key="loader" class="loader-wrapper">
                <slot name="loader">
                    <div class="loader-backdrop" />
                    <template v-if="loaderType === LOADER_TYPES.spinner">
                        <p-lottie name="thin-spinner" :size="2.5"
                                  auto class="loader spinner"
                        />
                    </template>
                    <template v-else-if="loaderType === LOADER_TYPES.skeleton">
                        <p-skeleton class="loader" />
                    </template>
                </slot>
            </div>

            <div v-if="isEmpty" key="no-data" class="no-data-wrapper">
                <slot name="no-data">
                    {{ $t('COMPONENT.DATA_LOADER.NO_DATA') }}
                </slot>
            </div>


            <div v-else key="data" class="data-wrapper">
                <slot />
            </div>
        </transition-group>
    </div>
</template>

<script lang="ts">
import {
    computed, defineComponent, reactive, toRefs,
} from '@vue/composition-api';
import { LOADER_TYPES } from '@/feedbacks/loading/data-loader/config';
import PLottie from '@/foundation/lottie/PLottie.vue';
import { i18n } from '@/translations';
import { isEmpty } from 'lodash';
import PSkeleton from '@/feedbacks/loading/skeleton/PSkeleton.vue';

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
    },
    setup(props) {
        const state = reactive({
            isEmpty: computed(() => {
                if (!props.data) return false;
                if (Array.isArray(props.data)) return props.data.length === 0;
                return isEmpty(props.data);
            }),
        });
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
            &.spinner {
                max-height: 16.875rem;
            }
        }
    }

    .no-data-wrapper {
        @apply absolute justify-center items-center flex w-full text-gray-300 text-center;
        line-height: 120%;
        font-size: 1rem;
        height: calc(100% - 2rem);
        max-height: 16.875rem;
        top: 2rem;
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
