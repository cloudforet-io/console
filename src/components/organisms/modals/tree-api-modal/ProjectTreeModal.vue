<template>
    <p-button-modal header-title="Change Project"
                    scrollable
                    size="md"
                    centered
                    fade
                    backdrop
                    :visible.sync="proxyVisible"
                    @confirm="confirm"
    >
        <template #body>
            <div class="mb-8">
                Selected Project: {{ treeApiHandler.ts.metaState.firstSelectedNode ?
                    treeApiHandler.ts.metaState.firstSelectedNode.node.data.name
                    : 'No Project is selected' }}
            </div>
            <div>
                <p-tree-node v-for="(node, idx) in treeApiHandler.ts.metaState.nodes" :key="idx"
                             v-bind="treeApiHandler.ts.state"
                             :data.sync="node.data"
                             :children.sync="node.children"
                             :state.sync="node.state"
                             @toggle:click="treeApiHandler.getData"
                             @node:click="selectItem"
                             @checkbox:click="selectItem"
                >
                    <template #data="{data}">
                        {{ data.name }}
                    </template>
                    <template #left-extra="{state, getListeners, data}">
                        <span>
                            <p-check-box v-if="data.item_type === 'PROJECT'"
                                         :selected="state.selected" :value="true" v-on="getListeners('checkbox')"
                            />
                        </span>
                    </template>
                    <template #toggle="{state, toggleSize}">
                        <p-i v-if="state.loading" name="ic_working" :width="toggleSize"
                             :height="toggleSize"
                        />
                    </template>
                </p-tree-node>
            </div>
        </template>
    </p-button-modal>
</template>

<script lang="ts">
import { watch } from '@vue/composition-api';
import { makeProxy } from '@/lib/compostion-util';
import PCheckBox from '@/components/molecules/forms/checkbox/CheckBox.vue';
import PI from '@/components/atoms/icons/PI.vue';
import PButtonModal from '@/components/organisms/modals/button-modal/ButtonModal.vue';
import { ProjectNodeState, ProjectTreeFluentAPI } from '@/lib/api/tree-node';
import PTreeNode from '@/components/molecules/tree/PTreeNode.vue';
import { fluentApi } from '@/lib/fluent-api';
import { TreeItem } from '@/components/molecules/tree/PTreeNode.toolset';
import { ProjectItemResp } from '@/lib/fluent-api/identity/project';

export default {
    name: 'SProjectTreeModal',
    components: {
        PTreeNode,
        PCheckBox,
        PI,
        PButtonModal,
    },
    props: {
        visible: { // sync
            type: Boolean,
            default: false,
        },
        projectId: {
            type: String,
            default: '',
        },
    },
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    setup(props, { emit }) {
        const projectApi = fluentApi.identity().project();

        const treeApiHandler = new ProjectTreeFluentAPI({
            treeAction: projectApi.tree().setSortBy('name').setSortDesc(false),
            treeSearchAction: projectApi.treeSearch(),
        });

        watch(() => props.visible, async (after, before) => {
            if (after === before) return;
            if (after) {
                if (props.projectId) await treeApiHandler.getSearchData(props.projectId);
                else await treeApiHandler.getData();
            } else {
                treeApiHandler.ts.metaState.nodes = [];
                treeApiHandler.ts.metaState.selectedNodes = [];
            }
        });

        return {
            proxyVisible: makeProxy('visible'),
            treeApiHandler,
            selectItem(item: TreeItem<ProjectItemResp, ProjectNodeState>): void {
                if (item.node.data.item_type === 'PROJECT') treeApiHandler.ts.setSelectedNodes(item);
            },
            confirm(): void {
                if (treeApiHandler.ts.metaState.firstSelectedNode) {
                    emit('confirm', treeApiHandler.ts.metaState.firstSelectedNode.node.data);
                } else {
                    emit('confirm', null);
                }
            },
        };
    },
};
</script>

<style lang="postcss" scoped>
.p-tree-node::v-deep {
    .basic {
        .left-extra {
            display: inline-block;
            width: 1rem;
            margin-left: 0.5rem;
        }
    }
}
</style>
