<template>
    <div class="p-chart-loader">
        <transition name="fade-in">
            <div v-show="loading" class="loader w-full h-full">
                <slot name="loader" :loading="loading">
                    <p-spinner />
                </slot>
            </div>
        </transition>
        <transition name="fade-in">
            <div v-show="!loading" class="w-full h-full">
                <slot name="default" />
            </div>
        </transition>
    </div>
</template>

<script lang="ts">
import PSpinner from '@/feedbacks/loading/spinner/PSpinner.vue';

export default {
    name: 'PChartLoader',
    components: { PSpinner },
    props: {
        loading: {
            type: Boolean,
            default: true,
        },
    },
    setup() {
        return {};
    },
};
</script>

<style lang="postcss">
.p-chart-loader {
    position: relative;
    .loader {
        position: absolute;
        display: flex;
        align-items: center;
        justify-content: center;
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
}
</style>
