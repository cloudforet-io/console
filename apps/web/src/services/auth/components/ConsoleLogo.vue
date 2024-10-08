<script setup lang="ts">
import { computed, reactive } from 'vue';

import { useDomainStore } from '@/store/domain/domain-store';


interface Props {
    sizeRatio?: number;
    positionFixed?: boolean;
    isHiddenIfTablet?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    sizeRatio: 1,
    positionFixed: true,
    isHiddenIfTablet: true,
});


const emit = defineEmits<{(e: 'click'): void; }>();

const domainStore = useDomainStore();
const state = reactive({
    symbolImage: computed<string|undefined>(() => domainStore.getters.domainSymbolImage),
    wordTypeLogoImage: computed<string|undefined>(() => domainStore.getters.domainWordTypeLogoImage),
    logoImageStyle: computed(() => ({
        width: `${56 * props.sizeRatio}px`,
        height: `${56 * props.sizeRatio}px`,
        marginTop: `${2 * props.sizeRatio}rem`,
        marginLeft: `${2 * props.sizeRatio}rem`,
    })),
    textImageStyle: computed(() => ({
        width: 'auto',
        height: `${40 * props.sizeRatio}px`,
        marginTop: `${2.5 * props.sizeRatio}rem`,
        marginLeft: `${0.5 * props.sizeRatio}rem`,
    })),
});
</script>

<template>
    <div class="ci-wrapper"
         :class="{ 'hidden-option': props.isHiddenIfTablet }"
         :style="{ position: props.positionFixed ? 'fixed' : 'static'}"
         @click="emit('click')"
    >
        <!--logo image-->
        <img v-if="state.symbolImage"
             :style="state.logoImageStyle"
             :src="state.symbolImage"
        >
        <img v-else
             :style="state.logoImageStyle"
             src="@/assets/images/brand/brand_logo.png"
        >
        <!--logo text image-->
        <img v-if="state.wordTypeLogoImage"
             :style="state.textImageStyle"
             :src="state.wordTypeLogoImage"
        >
        <img v-else
             :style="state.textImageStyle"
             src="@/assets/images/brand/spaceone-logotype-with-Service-Type.svg"
        >
    </div>
</template>

<style scoped lang="postcss">
.ci-wrapper {
    @apply flex;
    flex-flow: row;
    z-index: 1000;
}
</style>
