<template>
    <div class="text-editor-contents" v-html="contents" />
</template>

<script lang="ts">
import {
    defineComponent,
} from '@vue/composition-api';


interface Props {
    contents: string
}

export default defineComponent<Props>({
    name: 'TextEditorViewer',
    components: {},
    props: {
        contents: {
            type: String,
            default: '',
        },
    },
});
</script>

<style lang="postcss" scoped>
@import './text-editor-nodes.pcss';
.text-editor-contents::v-deep {
    @mixin all-nodes-style;
}
</style>
