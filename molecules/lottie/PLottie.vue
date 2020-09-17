<template>
    <div class="aligner">
        <div ref="loading" class="aligner-item" :style="{
            height: height || `${size}rem`,
            width: width || `${size}rem`
        }"
        />
    </div>
</template>
<script>
import lottie from 'lottie-web';

export default {
    name: 'PLottie',
    props: {
        name: {
            type: String,
            default: 'cloudone_loading',
        },
        size: {
            type: Number,
            default: 1,
        },
        auto: {
            type: Boolean,
            default: false,
        },
        height: {
            type: String,
            default: undefined,
        },
        width: {
            type: String,
            default: undefined,
        },
    },
    data() {
        return {
            animation: null,
        };
    },
    created() {
        if (this.auto) this.create();
    },
    destroy() {
        if (this.auto) this.destroy();
    },
    methods: {
        async create() {
            const animationDT = await import(`@/assets/lottiefiles/${this.name}.json`);
            if (!this.isEmpty(animationDT)) {
                await lottie.loadAnimation({
                    name: this.name,
                    container: this.$refs.loading,
                    renderer: 'svg',
                    loop: true,
                    autoplay: true,
                    animationData: animationDT,
                    rendererSettings: {
                        scaleMode: 'noScale',
                        clearCanvas: false,
                        progressiveLoad: false,
                        hideOnTransparent: true,
                    },
                });
            }
        },
        destroy() {
            lottie.destroy(this.name);
        },
    },

};
</script>

<style lang="postcss" scoped>
    .aligner {
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .aligner-item {
        max-width: 100%;
    }
</style>
