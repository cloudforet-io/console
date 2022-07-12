<template>
    <div ref="observerRef" class="scroll-observer">
        <p-lottie v-if="loading" name="thin-spinner" auto
                  :size="2"
        />
    </div>
</template>

<script lang="ts">
import {
    defineComponent, onUnmounted, reactive, toRefs, watch,
} from '@vue/composition-api';

import { PLottie } from '@spaceone/design-system';


const INTERSECTION_OPTIONS = {
    root: null,
    threshold: 1.0,
};

export default defineComponent({
    name: 'ScrollObserver',
    components: {
        PLottie,
    },
    props: {
        loading: {
            type: Boolean,
            default: false,
        },
    },
    setup(props, { emit }) {
        const state = reactive({
            observerRef: null as null | HTMLElement,
            observer: null as null | IntersectionObserver,
        });

        const handleIntersect = (target) => {
            if (target.isIntersecting) {
                emit('trigger-observer', target);
            }
        };

        watch(() => state.observerRef, (observerRef) => {
            if (observerRef && !state.observer) {
                state.observer = new IntersectionObserver((entries) => {
                    handleIntersect(entries[0]);
                }, INTERSECTION_OPTIONS);
                state.observer.observe(observerRef);
            }
        });
        onUnmounted(() => {
            if (state.observer) state.observer.disconnect();
        });

        return {
            ...toRefs(state),
        };
    },
});
</script>

<style lang="postcss">
.scroll-observer {
    .p-lottie {
        display: flex;
        height: 5rem;
        justify-content: center;
        align-items: center;
    }
}
</style>
