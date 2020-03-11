<template>
    <p-tree-modal ref="treeApi"
                  :scrollable="false"
                  :visible.sync="treeAPITS.ts.syncState.visible"
                  theme-color="primary"
                  v-bind="treeAPITS.ts.state"
                  @cancel="close"
                  @close="close"
                  @node:selected="update"
                  @node:unselected="update"
    />
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api';
import PTreeModal from '@/components/organisms/modals/tree-modal/TreeModal.vue';
import { ProjectNode, ProjectTreeAPI } from '@/lib/api/tree';
import { TreeModalToolSet } from '@/components/organisms/modals/tree-modal/toolset';
import { makeProxy } from '@/lib/compostion-util';


export default defineComponent({
    name: 'SProjectTreeModal',
    components: { PTreeModal },
    props: {
        visible: { // sync
            type: Boolean,
            default: false,
        },
        headerTitle: {
            type: String,
            default: 'Change Project',
        },
    },
    setup() {
        const visible = makeProxy<boolean>('visible');
        const treeAPITS = new ProjectTreeAPI<any, any, ProjectNode, any, TreeModalToolSet>(
            TreeModalToolSet, {}, { visible },
        );


        return {
            treeAPITS,
            treeApi: treeAPITS.ts.treeApi,
            update: (event) => {
                treeAPITS.ts.getSelectedNode(event);
            },
            click() {
                treeAPITS.ts.open();
            },
            close() {
                treeAPITS.ts.close();
            },
        };
    },
});
</script>

<style scoped>

</style>
