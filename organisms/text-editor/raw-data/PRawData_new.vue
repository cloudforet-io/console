<template>
    <p-text-editor ref="editor" class="p-raw-data" :code="code"
                   mode="readOnly" :loading="loading"
    />
</template>

<script>
import {
    computed, reactive, watch, onMounted, toRefs,
} from '@vue/composition-api';
import PTextEditor from '@/components/molecules/text-editor/text-editor/PTextEditor.vue';

export default {
    name: 'PRawDataNew',
    components: {
        PTextEditor,
    },
    props: {
        item: {
            type: Object,
            default: () => ({}),
        },
        raw: {
            type: String,
            default: undefined,
        },
        loading: {
            type: Boolean,
            default: false,
        },
    },
    setup(props, { emit }) {
        const state = reactive({
            // proxyCode: undefined,
            editor: null,
        });
        return {
            code: computed(() => props.raw || JSON.stringify(props.item, undefined, 4)),
            ...toRefs(state),
        };
    },

};
</script>
<style lang="postcss" >
    .p-raw-data {
        @apply w-auto;
    }
</style>
