<template>
    <div class="Aligner">
        <div ref="loading" class="Aligner-item" :style="{
            height: `${size}rem`,
            width: `${size}rem`
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
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .Aligner-item {
        max-width: 100%;
    }
</style>
