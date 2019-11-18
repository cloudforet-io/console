<template>
    <div class="Aligner">
        <div ref="loading" class="Aligner-item" :style="{'height': `${size}rem`,'width': `${size}rem`}"/>
    </div>
</template>
<script>
import lottie from 'lottie-web';

export default {
    name: 'PLoading',
    props: {
        name: {
            type: String,
            default: 'cloudone_loading',
        },
        size: {
            type: Number,
            default: 2,
        },
    },
    data() {
        return {
            animation: null,
        };
    },
    methods: {
        async create() {
            const animationDT = await import(`@/assets/loading/${this.name}.json`);
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

<style lang="scss" scoped>
    .Aligner {
        height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .Aligner-item {
        max-width: 100%;
    }
</style>
