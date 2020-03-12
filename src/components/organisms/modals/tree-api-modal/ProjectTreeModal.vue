<template>
    <p-tree-modal ref="treeRef"
                  :scrollable="false"
                  :visible.sync="treeAPITS.ts.syncState.visible"
                  theme-color="primary"
                  v-bind="treeAPITS.ts.state"
                  @cancel="close"
                  @close="close"
                  @confirm="confirm"
                  @node:selected="update"
                  @node:unselected="update"
    >
        <template #default>
            <div v-show="error" class="text-alert mt-2">
                Please Choice Project or check release project
            </div>
        </template>
        <template #footer-extra>
            <span @click.stop.capture="release= !release"><p-check-box v-model="release" /> release project</span>
        </template>
    </p-tree-modal>
</template>

<script lang="ts">
import {
    computed, defineComponent, reactive, ref, toRefs, watch,
} from '@vue/composition-api';
import PTreeModal from '@/components/organisms/modals/tree-modal/TreeModal.vue';
import { ProjectNode, ProjectTreeAPI } from '@/lib/api/tree';
import { TreeModalToolSet } from '@/components/organisms/modals/tree-modal/toolset';
import { makeProxy } from '@/lib/compostion-util';
import PCheckBox from '@/components/molecules/forms/checkbox/CheckBox.vue';
import { Computed } from '@/lib/type';

export default defineComponent({
    name: 'SProjectTreeModal',
    components: { PTreeModal, PCheckBox },
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
    setup(props, { emit }) {
        const visible = makeProxy<boolean>('visible');
        const treeRef = ref(null);
        const treeAPITS = new ProjectTreeAPI<any, any, ProjectNode, any, TreeModalToolSet>(
            TreeModalToolSet, undefined, { visible }, treeRef,
        );
        const state = reactive({
            release: ref(false),
            error: ref(false),
        });
        const selectNode:Computed<null|ProjectNode> = computed(() => (treeAPITS.ts.metaState.firstSelectedNode as unknown as null|ProjectNode));
        watch(visible, (show, preShow) => {
            if (!show && show !== preShow) {
                state.error = false;
                state.release = false;
            }
        });

        return {
            treeAPITS,
            treeRef: treeAPITS.ts.treeRef,
            ...toRefs(state),
            update: (event) => {
                console.log(event);
                treeAPITS.ts.getSelectedNode(event);
            },
            click() {
                treeAPITS.ts.open();
            },
            close() {
                treeAPITS.ts.close();
            },
            confirm() {
                state.error = false;
                if (state.release) {
                    emit('confirm');
                } else if (selectNode.value && selectNode.value.data.item_type === 'PROJECT') {
                    treeAPITS.ts.confirm();
                } else {
                    state.error = true;
                }
            },
        };
    },
});
</script>

<style scoped>

</style>
