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
    height: 100vh;
}
</style>
