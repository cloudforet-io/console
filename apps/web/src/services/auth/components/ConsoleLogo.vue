<script setup lang="ts">

import { computed, reactive } from 'vue';

import { store } from '@/store';

interface Props {
    sizeRatio?: number;
    positionFixed?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    sizeRatio: 1,
    positionFixed: true,
});

const state = reactive({
    symbolImage: computed<string|undefined>(() => store.getters['domain/domainSymbolImage']),
    wordTypeLogoImage: computed<string|undefined>(() => store.getters['domain/domainWordTypeLogoImage']),
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
         :style="{ position: props.positionFixed ? 'fixed' : 'static'}"
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

    @screen tablet {
        @apply hidden;
    }
}
</style>
