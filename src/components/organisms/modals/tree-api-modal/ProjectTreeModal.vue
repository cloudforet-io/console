<template>
    <p-tree-modal />
</template>

<script lang="ts">
import { computed, defineComponent } from '@vue/composition-api';
import PTreeModal from '@/components/organisms/modals/tree-modal/TreeModal.vue';
import TreeItem, { treeProps, TreeToolSet } from '@/components/molecules/tree-new/ToolSet';
import { readonlyRefArg } from '@/lib/type';
import { SearchQueryType } from '@/components/organisms/search/query-search-bar/autocompleteHandler';
import { defaultQuery } from '@/lib/api/query';
import { BaseTreeAPI } from '@/lib/api/tree';

class ProjectTreeAPI<
        initData = any,
        node extends TreeItem = TreeItem,
        responses =any,
        T extends TreeToolSet<initData > = TreeToolSet<initData >
        > extends BaseTreeAPI {
        public treeTS: T;


        protected constructor() {
            super( '',only, fixSearchQuery, extraParams);
            // @ts-ignore
            this.treeTS = new TreeToolSet();
            this.setFetchData();
        }

        protected paramQuery = computed(() => defaultQuery(
            undefined, undefined,
            'name', true, undefined,
            // @ts-ignore
            this.apiState.fixSearchQuery, undefined, this.apiState.only,
        ));

        protected requestData = async (node?:node) => {
            if (!node) { // root tree
                return

            }
            return '';
        };

        protected toNode:(data: any)=>Promise<node[]>;
}


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
            default: 'Tree Modal',
        },
        data: treeProps.data,
        options: treeProps.options,
        icons: treeProps.icons,
        loading: treeProps.loading,
    },
    setup(props, context) {
        const treeTs = new TreeToolSet();
        return {

        };
    },
});
</script>

<style scoped>

</style>
