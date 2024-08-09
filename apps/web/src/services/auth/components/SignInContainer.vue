<script lang="ts" setup>
import { useWindowSize } from '@vueuse/core/index';
import { computed, reactive } from 'vue';

import { screens } from '@cloudforet/mirinae';

import ConsoleLogo from '@/services/auth/components/ConsoleLogo.vue';
import SignInLeftContainer from '@/services/auth/components/SignInLeftContainer.vue';


const { width } = useWindowSize();

const state = reactive({
    isMobileSize: computed<boolean>(() => width.value < screens.mobile.max),
});

</script>

<template>
    <div class="sign-in-container">
        <console-logo v-if="!state.isMobileSize" />
        <div class="contents-wrapper">
            <sign-in-left-container />
            <router-view />
        </div>
    </div>
</template>

<style lang="postcss" scoped>
.sign-in-container {
    .contents-wrapper {
        @apply flex absolute bg-white;
        width: 100%;
        height: 100%;
        top: 0;
        bottom: 0;
        background-image: url('@/assets/images/img_blurred-background-min.png');
    }
}

@screen mobile {
    .sign-in-container {
        overflow-y: auto;

        .contents-wrapper {
            @apply flex-col static;
        }
    }
}
</style>
