<template>
    <div class="pdf-download-overlay">
        <div class="header-wrapper">
            <span class="title">PDF preview</span>
            <div class="button-group">
                <p-button style-type="gray-border" :outline="true">
                    Cancel
                </p-button>
                <p-icon-text-button name="ic_download" style-type="secondary-dark">
                    Download PDF
                </p-icon-text-button>
            </div>
        </div>
        <div class="preview-wrapper">
            <div class="preview">
                <slot />
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import {
    reactive, toRefs,
} from '@vue/composition-api';
import { PButton, PIconTextButton } from '@spaceone/design-system';


export default {
    name: 'PdfDownloadOverlay',
    components: {
        PButton,
        PIconTextButton,
    },
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
    $header-height: 3.5rem;
    position: fixed;
    width: 100vw;
    height: 100vh;
    top: 0;
    left: 0;
    z-index: 999;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    .header-wrapper {
        @apply bg-gray-900;
        flex-shrink: 0;
        height: $header-height;
        display: flex;
        align-items: center;
        justify-content: space-between;
        line-height: 1.25;
        padding-left: 1.5rem;
        padding-right: 2.5rem;
        .title {
            @apply text-white;
            font-weight: bold;
            font-size: 1.125rem;
        }
        .p-icon-text-button {
            margin-left: 1rem;
        }
    }
    .preview-wrapper {
        @apply bg-gray-800;
        padding: 2rem;
        flex-shrink: 0;
        flex-grow: 1;
        overflow-y: auto;
        height: calc(100% - $header-height);
        box-sizing: border-box;
    }
    .preview {
        @apply bg-gray-100;
        padding: 1.5rem;
    }
}
</style>
