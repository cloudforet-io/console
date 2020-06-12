<template>
    <p-tree-modal ref="treeRef"
                  :scrollable="false"
                  :visible.sync="treeAPITS.ts.syncState.visible"
                  :header-title="headerTitle"
                  theme-color="primary"
                  v-bind="treeAPITS.ts.state"
                  @cancel="close"
                  @close="close"
                  @confirm="confirm"
                  @node:selected="update"
                  @node:unselected="update"
    >
        <template #default>
            <div class="mt-2">
                <span @click.stop.capture="release= !release"><p-check-box v-model="release" /> release project</span>
            </div>
            <div v-show="error" class="alert">
                <span class="alert-msg">
                    <p-i name="ic_alert" width="1rem" height="1rem" />
                </span>
                <span>Please select a project or release the project</span>
            </div>
        </template>
        <template #icon="{node,isExpanded}">
            <p-i :name="node.data.item_type === 'PROJECT' ? 'ic_tree_project' :
                     isExpanded ? 'ic_tree_folder--opened' : 'ic_tree_folder'"
                 color="transparent inherit"
                 width="1rem" height="1rem"
            />
        </template>
        <template #footer-extra />
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
import PI from '@/components/atoms/icons/PI.vue';
import {ProjectTreeFluentAPI} from "@/lib/api/tree-node";

export default defineComponent({
    name: 'SProjectTreeModal',
    components: { PTreeModal, PCheckBox, PI },
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
        // const treeApiHandler = new ProjectTreeFluentAPI()
        const state = reactive({
            release: ref(false),
            error: ref(false),
        });
        const selectNode: Computed<null|ProjectNode> = computed(() => (treeAPITS.ts.metaState.firstSelectedNode as unknown as null|ProjectNode));
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

<style lang="postcss" scoped>
.alert{
    @apply text-alert mt-4 align-middle;
    .alert-msg{
        @apply align-middle;
    }
}
</style>
