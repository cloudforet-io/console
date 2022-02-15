<template>
    <div class="pdf-download-overlay">
        <div class="preview">
            <slot />
        </div>
    </div>
</template>

<script lang="ts">
import {
    reactive, toRefs,
} from '@vue/composition-api';


export default {
    name: 'PdfDownloadOverlay',
    components: {},
    props: {
        loading: {
            type: Boolean,
            default: false,
        },
    },
    setup() {
        const state = reactive({});


        return {
            ...toRefs(state),
        };
    },
};
</script>

<style lang="postcss" scoped>
.pdf-download-overlay {
    @apply bg-gray-900;
    position: fixed;
    width: 100vw;
    height: 100vh;
    top: 0;
    left: 0;
    z-index: 999;
    .preview {
        @apply bg-gray-100;
    }
}
</style>
