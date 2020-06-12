<template>
    <p-button-modal :header-title="headerTitle"
                    :scrollable="false"
                    size="sm"
                    centered
                    fade
                    backdrop
                    :visible.sync="proxyVisible"
                    @cancel="close"
                    @close="close"
                    @confirm="confirm"
    >
        <template #body>
            <p-tree-node v-for="(node, idx) in treeApiHandler.ts.metaState.nodes" :key="idx"
                         v-bind="node"
                         :data.sync="node.data"
                         :children.sync="node.children"
                         :state.sync="node.state"
                         @toggle:click="treeApiHandler.getData"
                         @node:click="treeApiHandler.ts.setSelectedNodes"
            >
                <template #data="{data}">
                    {{ data.name }}
                </template>
                <template #toggle="{state, toggleSize}">
                    <p-i v-if="state.loading" name="ic_working" :width="toggleSize"
                         :height="toggleSize"
                    />
                </template>
            </p-tree-node>
        </template>
    </p-button-modal>
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
import PButtonModal from '@/components/organisms/modals/button-modal/ButtonModal.vue';
import { ProjectTreeFluentAPI } from '@/lib/api/tree-node';
import PTreeNode from '@/components/molecules/tree/PTreeNode.vue';
import { fluentApi } from '@/lib/fluent-api';

export default {
    name: 'SProjectTreeModal',
    components: {
        PTreeNode,
        PTreeModal,
        PCheckBox,
        PI,
        PButtonModal,
    },
    props: {
        visible: { // sync
            type: Boolean,
            default: false,
        },
        headerTitle: {
            type: String,
            default: 'Change Project',
        },
        projectId: {
            type: String,
            default: undefined,
        },
    },
    setup(props, { emit }) {
        const projectApi = fluentApi.identity().project();
        const treeAction = projectApi.tree()
            .setSortBy('name')
            .setSortDesc(false);

        const treeApiHandler = new ProjectTreeFluentAPI({
            treeAction, treeSearchAction: projectApi.treeSearch(),
        });

        const state = reactive({
            release: ref(false),
            error: ref(false),
        });

        watch(() => props.visible, async (after, before) => {
            if (after === before) return;
            if (after) {
                if (props.projectId) await treeApiHandler.getSearchData(props.projectId);
                else await treeApiHandler.getData();
            } else {
                treeApiHandler.ts.metaState.nodes = [];
            }
        });

        return {
            proxyVisible: makeProxy('visible'),
            treeApiHandler,
            ...toRefs(state),
            update: (event) => {
            },
            click() {
            },
            close() {
            },
            confirm() {
                state.error = false;
            },
        };
    },
};
</script>

<style lang="postcss" scoped>
.alert{
    @apply text-alert mt-4 align-middle;
    .alert-msg{
        @apply align-middle;
    }
}
</style>
