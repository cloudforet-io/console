<template>
    <div class="project">
        <p-vertical-page-layout2 :min-width="260" :init-width="260" :max-width="400">
            <template #sidebar="{width}">
                <div>
                    <p-tree-new v-bind="state" />
                    <br>
                </div>
            </template>
            <template #default>
                <p-horizontal-layout />
            </template>
        </p-vertical-page-layout2>
    </div>
</template>

<script lang="ts">
import {
    computed, defineComponent, reactive, toRefs, watch,
} from '@vue/composition-api';
import _ from 'lodash';
import PHorizontalLayout from '@/components/organisms/layouts/horizontal-layout/HorizontalLayout.vue';
import PVerticalPageLayout2 from '@/views/containers/page-layout/VerticalPageLayout2.vue';
import PTree from '@/components/molecules/tree-new/Tree.vue';
import TreeItem, { TreeState } from '@/components/molecules/tree-new/ToolSet';

export default defineComponent({
    name: 'ProjectTemplate',
    components: {
        PVerticalPageLayout2,
        PHorizontalLayout,
        PTreeNew: PTree,
    },
    setup(props, context) {
        const state: any = new TreeState().state;

        const arr = _.range(5);
        arr.forEach((i) => {
            state.data.push(new TreeItem(`Item ${i}`));
        });


        return {
            state,
        };
    },
});

</script>

<style scoped>

</style>
