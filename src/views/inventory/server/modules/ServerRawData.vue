<template>
    <PMonacoEditor style="width: 100%;height: 70vh;" :code="code" :read-only="true" />
</template>

<script>
import { computed } from '@vue/composition-api';
import PMonacoEditor from '@/components/molecules/text-editor/monaco/MonacoEditor';

export default {
    name: 'PServerRawData',
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
        const code = computed(() => JSON.stringify(props.item, undefined, 4));
        return {
            code,
        };
    },

};
</script>
