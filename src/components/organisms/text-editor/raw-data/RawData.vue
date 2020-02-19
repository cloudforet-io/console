<template>
    <p-monaco-editor ref="monaco" class="p-raw-data" :code="code"
                     :read-only="true"
    />
</template>

<script lang="ts">
import {
    computed, createComponent, ref, watch, Ref, onMounted,
} from '@vue/composition-api';
import { editor } from 'monaco-editor';
import PMonacoEditor from '@/components/molecules/text-editor/monaco/MonacoEditor.vue';

interface MEComponent{
    editor:editor.IEditor
}


export default createComponent({
    name: 'PRawData',
    components: {
        PMonacoEditor,
    },
    props: {
        item: {
            type: Object,
            default: () => {},
        },
    },
    setup(props) {
        const monaco:Ref<MEComponent|null> = ref(null);
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
            code: computed(() => JSON.stringify(props.item, undefined, 4)),
        };
    },

});
</script>
<style lang="scss" scoped>
    .p-raw-data{
        width: 100%;
        height: 70vh;
    }


</style>
