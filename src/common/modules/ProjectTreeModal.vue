<template>
    <p-button-modal :header-title="$t('COMMON.TREE_MODAL.TITLE')"
                    size="md"
                    :scrollable="true"
                    fade
                    backdrop
                    :visible.sync="proxyVisible"
                    :loading="loading"
                    @confirm="confirm"
    >
        <template #body>
            <div class="title">
                {{ $t('COMMON.TREE_MODAL.SELECT_PROJECT') }}
            </div>
            <div class="body-container">
                <p-tree :edit-options="{disabled: true}"
                        :drag-options="{disabled: true}"
                        :toggle-options="toggleOptions"
                        :select-options="selectOptions"
                        :data-setter="dataSetter"
                        :data-getter="dataGetter"
                        :data-fetcher="dataFetcher"
                        @init="onTreeInit"
                        @change-select="onChangeSelect"
                >
                    <template #data="{node}">
                        <span :class="{
                            'ml-2': node.data.item_type === 'PROJECT'
                        }"
                        >{{ node.data.name }}</span>
                    </template>
                    <template #toggle="{node, path, selected}">
                        <p-radio v-if="node.data.item_type === 'PROJECT'"
                                 :selected="selected" :value="true"
                                 @click.stop="changeSelectState(node, path)"
                        />
                    </template>
                    <template #toggle-right="{node}">
                        <p-i v-if="node.data.item_type === 'PROJECT_GROUP'" name="ic_tree_project-group" class="mx-1"
                             width="1rem" height="1rem" color="inherit transparent"
                        />
                    </template>
                </p-tree>
                <div class="no-select">
                    <p-radio class="mr-2"
                             :selected="!selectedNode"
                             :value="true" @click="resetSelectedNodes"
                    /><span class="cursor-pointer" @click="resetSelectedNodes">{{ $t('COMMON.TREE_MODAL.SELECT_NO_PROJECT') }}</span>
                </div>
            </div>
        </template>
    </p-button-modal>
</template>

<script lang="ts">
/* eslint-disable no-await-in-loop */
import {
    computed,
    reactive, toRefs, watch,
} from '@vue/composition-api';

import {
    PI, PButtonModal, PRadio, PTree,
} from '@spaceone/design-system';
import { makeProxy } from '@spaceone/design-system/src/util/composition-helpers';

import { ProjectGroupTreeItem } from '@/views/project/project/type';
import { SpaceConnector } from '@/lib/space-connector';
import { ProjectGroup } from '@/views/identity/service-account/type';


interface Props {
    visible: boolean;
    projectId: string;
    loading: boolean;
}

export default {
    name: 'ProjectTreeModal',
    components: {
        PTree,
        PRadio,
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
        loading: {
            type: Boolean,
            default: false,
        },
    },
    setup(props: Props, { emit }) {
        const state = reactive({
            treeRef: null as null|any,
            root: null as any,
            selectedItem: {} as ProjectGroupTreeItem,
            selectedNode: computed(() => state.selectedItem.node),
            proxyVisible: makeProxy('visible', props, emit),
        });

        const toggleOptions = {
            validator: node => node.data.has_child || node.children.length > 0,
        };

        const selectOptions = {
            validator(node) {
                return node?.data.item_type === 'PROJECT';
            },
        };

        const dataSetter = (text, node) => {
            node.data.name = text;
        };
        const dataGetter = node => node.data.name;

        const dataFetcher = async (node): Promise<ProjectGroup[]> => {
            try {
                const params: any = {
                    sort: { key: 'name', desc: false },
                    item_type: 'ROOT',
                    check_child: true,
                };

                if (node.data?.id && node.data?.item_type) {
                    params.item_id = node.data.id;
                    params.item_type = node.data.item_type;
                }

                const { items } = await SpaceConnector.client.identity.project.tree(params);
                return items;
            } catch (e) {
                console.error(e);
                return [];
            }
        };

        const onChangeSelect = (selected) => {
            state.selectedItem = selected.length > 0 ? selected[0] : {};
        };

        const changeSelectState = (node, path) => {
            state.root.changeSelectState(node, path);
        };

        const resetSelectedNodes = () => {
            if (state.root) state.root.resetSelect();
        };

        const getSearchPath = async (id: string, type: string): Promise<string[]> => {
            try {
                const res = await SpaceConnector.client.identity.project.tree.search({
                    item_id: id,
                    item_type: type,
                });
                return res.open_path || [];
            } catch (e) {
                console.error(e);
                return [];
            }
        };

        const findNode = async (targetId: string) => {
            if (!state.root) return;

            if (!targetId) {
                state.root.resetSelect();
                return;
            }

            try {
                const paths = await getSearchPath(targetId, 'PROJECT');
                await state.root.fetchAndFindNode(paths.map(d => (data => data.id === d)));
            } catch (e) {
                console.error(e);
            }
        };

        const autoScroll = (el: HTMLElement) => {
            if (state.treeRef.$el) {
                const offsetBottom = el.offsetTop + el.offsetHeight;
                const scrollBottom = state.treeRef.$el.scrollTop + state.treeRef.$el.offsetHeight;
                if (offsetBottom > scrollBottom) {
                    state.treeRef.$el.scrollTop = offsetBottom - state.treeRef.$el.offsetHeight;
                }
            }
        };

        watch([() => props.visible, () => state.root], async ([visible, root]) => {
            if (visible && root) {
                if (props.projectId) {
                    await findNode(props.projectId);
                } else {
                    await root.fetchData();
                }
            } else if (!visible && root) {
                resetSelectedNodes();
            }
        }, { immediate: true });


        const onTreeInit = (root) => {
            state.root = root;
        };

        const confirm = () => {
            if (state.selectedNode) {
                emit('confirm', state.selectedNode.data);
            } else {
                emit('confirm', null);
            }
        };

        return {
            ...toRefs(state),
            toggleOptions,
            selectOptions,
            dataSetter,
            dataGetter,
            dataFetcher,
            onChangeSelect,
            changeSelectState,
            resetSelectedNodes,
            confirm,
            onTreeInit,
        };
    },
};
</script>

<style lang="postcss" scoped>
.title {
    font-size: 1.375rem;
    line-height: 1.6;
    margin-bottom: 1.2rem;
}
.body-container {
    @apply bg-primary4 border border-gray-200 rounded-sm flex flex-col;
}
.tree-container {
    @apply overflow-auto flex-grow px-2 py-4;
    height: 21.5rem;
    .project-group-icon {
        @apply mx-1;
    }
}

.no-select {
    @apply border-t border-gray-200 p-4 flex items-center;
}

.p-tree::v-deep {
    .p-tree-node .tree-row {
        .right-extra {
            display: none;
        }
        &:hover .node .right-extra {
            display: block;
        }
    }
}
</style>
