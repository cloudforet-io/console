<template>
    <p-tree-modal />
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api';
import PTreeModal from '@/components/organisms/modals/tree-modal/TreeModal.vue';
import { treeProps, TreeToolSet } from '@/components/molecules/tree-new/ToolSet';

export default defineComponent({
    name: 'STreeApiModal',
    components: { PTreeModal },
    props: {
        visible: { // sync
            type: Boolean,
            default: false,
        },
        headerTitle: {
            type: String,
            default: 'Tree Modal',
        },
        data: treeProps.data,
        options: treeProps.options,
        icons: treeProps.icons,
        loading: treeProps.loading,
    },
    setup(props, context) {
        const treeTs = new TreeToolSet()
        return {

        };
    },
});
</script>

<style scoped>

</style>
