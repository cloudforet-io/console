<template>
    <div class="p-loading-box">
        <transition name="fade-in">
            <p-lottie v-if="loading" name="spinner" class="spinner"
                      auto
                      :size="1.5"
            />
        </transition>
        <transition name="fade-in">
            <slot v-if="!loading" />
        </transition>
    </div>
</template>

<script lang="ts">
import {
    defineComponent,
} from '@vue/composition-api';
import PLottie from '@/components/molecules/lottie/PLottie.vue';
import { loadingBoxProps } from '@/components/organisms/loading-box/LoadingBox.toolset';

export default defineComponent({
    name: 'PLoadingBox',
    props: loadingBoxProps,
    components: { PLottie },
});
</script>

<style lang="postcss" scoped>
.p-loading-box {
    position: relative;
}
.spinner {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    &.fade-in-enter-active {
        transition: opacity 0.15s;
    }
    &.fade-in-enter {
        opacity: 0;
    }
    &.fade-in-enter-to {
        opacity: 1;
    }
}
.fade-in-leave-active {
    transition: opacity 0.15s;
}
.fade-in-leave-to {
    opacity: 0;
}
.fade-in-enter-to {
    opacity: 1;
}
</style>
