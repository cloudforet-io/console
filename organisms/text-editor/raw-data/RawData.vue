<template>
    <p-monaco-editor ref="monaco" class="p-raw-data" :code="code"
                     :read-only="true"
    />
</template>

<script lang="ts">
import {
    computed, defineComponent, ref, watch, Ref, onMounted,
} from '@vue/composition-api';
import { editor } from 'monaco-editor';
import PMonacoEditor from '@/components/molecules/text-editor/monaco/PMonacoEditor.vue';

interface MEComponent{
    editor: editor.IEditor;
}


export default defineComponent({
    name: 'PRawData',
    components: {
        PMonacoEditor,
    },
    props: {
        item: {
            type: Object,
            default: () => ({}),
        },
        raw: {
            type: String,
            default: null,
        },
    },
    setup(props) {
        const monaco: Ref<MEComponent|null> = ref(null);
        onMounted(() => {
            watch(() => props.item, (pre, next) => {
                if (pre !== next && (monaco.value as MEComponent).editor !== null) {
                    (monaco.value as MEComponent).editor.trigger('default', 'editor.foldLevel3', {});
                    (monaco.value as MEComponent).editor.trigger('default', 'editor.foldLevel2', {});
                }
            });
        });

        return {
            monaco,
            code: computed(() => props.raw || JSON.stringify(props.item, undefined, 4)),
        };
    },

});
</script>
<style lang="postcss" scoped>
    .p-raw-data{
        @apply w-auto;
        height: 65vh;
    }


</style>
