<template>
    <p-monaco-editor class="p-raw-data" :code="code" :read-only="true" />
</template>

<script lang="ts">
import { computed, createComponent } from '@vue/composition-api';
import PMonacoEditor from '@/components/molecules/text-editor/monaco/MonacoEditor.vue';

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
        return {
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
