<template>
    <div ref="containerRef"
         class="dashboard-card-container"
    >
        <p v-for="(item, index) in cardWidthList"
           :key="index"
        >
            {{ item }} {{ containerWidth - (containerWidth % 80) }}
        </p>
    </div>
</template>

<script lang="ts">
import type { PropType } from 'vue';
import {
    defineComponent, reactive, toRefs, ref, onMounted, watch, onUnmounted,
} from 'vue';

import { CONTAINER_MIN_WIDTH } from '@/services/dashboards/dashboard-detail/lib/config';
import { cardWidthAssigner } from '@/services/dashboards/dashboard-detail/lib/helper';



export default defineComponent({
    name: 'DashboardCardContainer',
    props: {
        cardTypeList: {
            type: Array as PropType<Array<string>>,
            default: () => ([]),
        },
    },
    setup() {
        const state = reactive({
            containerWidth: CONTAINER_MIN_WIDTH,
            cardWidthList: [] as Array<Array<number>>,
            // cardTypeList: computed(() => props.cardTypeList),
        });
        const containerRef = ref<HTMLDivElement|null>(null);


        let timer: undefined|number;
        const handleWindowResize = () => {
            window.clearTimeout(timer);
            timer = window.setTimeout(() => {
                // RESIZE containerWidth on `resize`
                state.containerWidth = containerRef.value?.clientWidth ?? CONTAINER_MIN_WIDTH;
            }, 100);
        };

        onMounted(() => {
            // INIT containerWidth
            state.containerWidth = containerRef.value?.clientWidth ?? CONTAINER_MIN_WIDTH;
            window.addEventListener('resize', handleWindowResize);
        });

        onUnmounted(() => {
            window.removeEventListener('resize', handleWindowResize);
        });

        watch(() => state.containerWidth, (containerWidth: number) => {
            const cardTypeMock = ['MD', 'MD', 'SM', 'MD', 'LG', 'SM'];
            state.cardWidthList = cardWidthAssigner(cardTypeMock, containerWidth - (containerWidth % 80));
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
