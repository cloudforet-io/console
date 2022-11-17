<template>
    <div ref="containerRef"
         class="dashboard-card-container"
    >
        container
    </div>
</template>

<script lang="ts">
import type { PropType } from 'vue';
import {
    defineComponent, reactive, toRefs, ref, onMounted, watch, onUnmounted,
} from 'vue';

import { CONTAINER_MIN_WIDTH } from '@/services/dashboards/dashboard-detail/lib/config';
import { listMap } from '@/services/dashboards/dashboard-detail/lib/helper';

const exampleList = ['MD', 'MD', 'SM', 'MD', 'LG', 'SM'];

export default defineComponent({
    name: 'DashboardCardContainer',
    props: {
        cardSizeList: {
            type: Array as PropType<Array<string>>,
            default: () => exampleList,
        },
    },
    setup(props) {
        const state = reactive({
            containerWidth: CONTAINER_MIN_WIDTH,
            cardWidthList: [[]] as Array<Array<number>>,
        });
        const containerRef = ref<HTMLDivElement|null>(null);


        let timer;
        const handleWindowResize = () => {
            clearTimeout(timer);
            timer = setTimeout(() => {
                // RESIZE containerWidth on `resize`
                state.containerWidth = containerRef.value?.offsetWidth ?? CONTAINER_MIN_WIDTH;
            }, 100);
        };

        onMounted(() => {
            // INIT containerWidth
            state.containerWidth = containerRef.value?.offsetWidth ?? CONTAINER_MIN_WIDTH;
            window.addEventListener('resize', handleWindowResize);
        });

        onUnmounted(() => {
            window.removeEventListener('resize', handleWindowResize);
        });

        watch(() => state.containerWidth, (containerWidth: number) => {
            state.cardWidthList = listMap(props.cardSizeList, containerWidth);
        });

        return { containerRef, ...toRefs(state) };
    },
});
</script>

<style scoped>
.dashboard-card-container {
    min-width: 320px;
    max-width: 1840px;
}
</style>
