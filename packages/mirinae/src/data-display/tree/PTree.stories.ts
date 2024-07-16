import { reactive, toRefs, computed } from 'vue';

import { faker } from '@faker-js/faker';
import type { Meta, StoryObj } from '@storybook/vue';
import type { ComponentProps } from 'vue-component-type-helpers';

import { getTreeDefaultArgs, getTreeArgTypes } from '@/data-display/tree/story-helper';
import PI from '@/foundation/icons/PI.vue';
import PButton from '@/inputs/buttons/button/PButton.vue';
import PIconButton from '@/inputs/buttons/icon-button/PIconButton.vue';
import PTextInput from '@/inputs/input/text-input/PTextInput.vue';
import PRadio from '@/inputs/radio/PRadio.vue';

import { getTreeList, getTreeData, getRecursiveInfo } from './mock';
import PTree from './PTree.vue';


import './PTree.stories.pcss';

type PTreePropsAndCustomArgs = ComponentProps<typeof PTree>;

const meta : Meta<PTreePropsAndCustomArgs> = {
    title: 'Data Display/Tree',
    component: PTree,
    argTypes: {
        ...getTreeArgTypes(),
        node: { table: { disable: true } },
        'left-extra': { table: { disable: true } },
        toggle: { table: { disable: true } },
        'toggle-right': { table: { disable: true } },
        icon: { table: { disable: true } },
        data: { table: { disable: true } },
        'right-extra': { table: { disable: true } },
    },
    args: {
        ...getTreeDefaultArgs(),
    },
};

export default meta;
type Story = StoryObj<typeof PTree>;


const ExpertTemplate: Story = {
    render: () => ({
        components: {
            PTree, PButton, PTextInput, PI, PIconButton, PRadio,
        },
        template: `
            <div class="h-full w-full p-4 overflow-auto">
                <div class="mb-4">
                    <p-button style-type="substitutive" @click="refresh">Refresh</p-button>
                    <p-button style-type="highlight" @click="add">Add node to root</p-button>
                    <p-button style-type="positive" @click="onClickEdit">
                        {{editMode ? 'Done' : 'Edit' }}
                    </p-button>
                    <p-button @click="find">Find node</p-button>
                    <div class="mt-4">
                        <p-text-input v-model="target"/>
                        <p-button style-type="secondary" @click="fetchAndFind">Fetch and find node</p-button>
                    </div>
                    <div class="mt-4">
                        <p-text-input v-model="editText"/>
                        <p-button style-type="negative-primary" @click="updateData">Update selected node</p-button>
                    </div>
                </div>
                <p-tree :edit-options="editOptions"
                        :drag-options="dragOptions"
                        :select-options="selectOptions"
                        :toggle-options="toggleOptions"
                        :data-getter="dataGetter"
                        :data-setter="dataSetter"
                        :data-fetcher="dataFetcher"
                        :get-class-names="getClassNames"
                        fetch-on-init
                        @init="onInit"
                        @change-select="onChangeSelect"
                        @start-drag="onStartDrag"
                        @drop="onDrop"
                        @end-drag="onEndDrag"
                        @finish-edit="onFinishEdit"
                >
                    <template #data="{node}">
                            {{ node.data.name }} ({{node.data.id}})
                    </template>
                    <template #toggle="{node, path, selected}">
                        <p-radio v-if="node.data.item_type === 'PROJECT'"
                                 :selected="selected"
                                 :value="true"
                                 @click.stop="changeSelectState(node, path)"
                        />
                    </template>
                    <template #toggle-right>
                        <p-i name="ic_favorite-filled"
                             width="1rem" height="1rem"
                             color="inherit"
                        />
                    </template>
                    <template #icon="{node}">
                        <template v-if="editMode">
                            <p-i v-if="node.data.item_type === 'PROJECT_GROUP'"
                                 :name="permissionInfo[node.data.id] ? 'ic_folder-filled' : 'ic_lock-filled'"
                                 width="1rem" height="1rem" color="inherit"
                            />
                        </template>
                        <p-i v-else :name="node.data.item_type === 'PROJECT' ? 'ic_document-filled' : 'ic_folder-filled'"
                             width="1rem" height="1rem" color="inherit"
                        />
                    </template>
                    <template #right-extra="{node, path}">
                        <p-icon-button v-if="editMode && permissionInfo[node.data.id]" name="ic_minus"
                                       color="inherit transparent"
                                       size="sm"
                                       @click.stop="deleteNode(path)"
                        />
                        <p-icon-button v-else name="ic_plus"
                                       class="add-btn"
                                       size="sm"
                                       @click.stop="addNode(path, getTreeData())"
                        />
                    </template>
                </p-tree>
            </div>
        `,
        setup() {
            const state = reactive({
                editOptions: computed(() => ({
                    disabled: !state.editMode,
                    editStartValidator: ({ data }) => !!state.permissionInfo[data.id],
                    validator: (text) => (text && text.length > 2 && text.length < 40),
                })),
                dragOptions: computed(() => ({
                    disabled: !state.editMode,
                    /* eslint-disable @typescript-eslint/no-unused-vars */
                    dragValidator(node, dragNodeParent) {
                        return !!state.permissionInfo[node.data.id];
                    },
                    /* eslint-disable @typescript-eslint/no-unused-vars */
                    dropValidator(node, oldParent, parent) {
                        if (oldParent === parent) return true;
                        return !!state.permissionInfo[parent?.data?.id];
                    },
                })),
                editMode: false,
                permissionInfo: {},
                target: '',
                findMode: false,
                lists: [],
                listIdx: 0,
                editText: '',
                selectedItem: {},
                dragNode: null,
            });
            const selectOptions = {
                validator({ data }) {
                    if (data.item_type !== 'PROJECT') return false;
                    return state.editMode ? !!state.permissionInfo[data.id] : true;
                },
                visibleRado: true,
            };
            const toggleOptions = {
                validator: (node) => node.data.has_child || node.children.length > 0,
            };
            const getClassNames = ({ data }) => ({ 'no-permission': state.editMode && !state.permissionInfo[data.id] });
            const dataSetter = (text, node) => {
                node.data.name = text;
            };
            const dataGetter = (node) => node.data.name;
            /* eslint-disable @typescript-eslint/no-unused-vars */
            const dataFetcher = (node) => new Promise((resolve, reject) => {
                setTimeout(() => {
                    let res;
                    if (state.findMode) {
                        res = state.lists[state.listIdx++];
                    } else {
                        res = getTreeList();
                    }
                    if (state.editMode) {
                        res.forEach((d) => { state.permissionInfo[d.id] = faker.datatype.boolean(); });
                    }
                    resolve(res);
                }, 1000);
            });
            const refresh = async () => {
                if (state.root) {
                    state.root.resetSelect();
                    await state.root.fetchData();
                }
            };
            const onClickEdit = () => {
                const all = state.root.getAllNodes();
                state.permissionInfo = {};
                all.forEach((d) => { state.permissionInfo[d.data.id] = faker.datatype.boolean(); });
                state.editMode = !state.editMode;
            };
            const onInit = async (root) => {
                state.root = root;
            };
            const add = () => {
                if (state.root) state.root.addNode(getTreeData());
            };
            const find = () => {
                if (state.root) state.root.findNode((data) => data.name === state.target);
            };
            const fetchAndFind = async () => {
                const { lists, names } = getRecursiveInfo();
                state.findMode = true;
                state.lists = lists;
                state.listIdx = 0;
                const predicates = names.map((d) => (data) => data.name === d);
                state.target = names[names.length - 1];
                if (state.root) {
                    await state.root.fetchAndFindNode(predicates);
                }
                state.findMode = false;
            };
            const deleteNode = (path) => {
                state.root.deleteNodeByPath(path);
            };
            const addNode = (path, data) => {
                state.root.addChildNodeByPath(path, data);
            };
            const updateData = () => {
                if (state.root && state.selectedItem.node) {
                    state.root.updateNodeByPath(state.selectedItem.path, {
                        ...state.selectedItem.node.data,
                        name: state.editText,
                    });
                }
            };
            const onChangeSelect = (selected) => {
                state.selectedItem = selected.length > 0 ? selected[0] : {};
                state.editText = selected.length ? selected[0].node.data.name : '';
            };
            const onStartDrag = (node, dragNodeParent) => {
                console.debug('start drag', node, dragNodeParent);
                state.dragNode = node;
            };
            const onDrop = (node, oldParent, parent, rollback) => {
                console.debug('drop', node, oldParent, parent, rollback);
                if (Math.random() > 0.5) {
                    /* eslint-disable no-alert */
                    alert('Drop Failed! Rollback.');
                    rollback();
                }
            };
            const onEndDrag = (node, parent) => {
                console.debug('end drag', node, parent);
                state.dragNode = null;
            };
            const onFinishEdit = (node, editText) => {
                console.debug('finish edit', node, editText);
                if (Math.random() > 0.5) {
                    node.data.name = editText;
                } else {
                    /* eslint-disable no-alert */
                    alert('Failed to update node data!');
                }
            };
            const changeSelectState = (node, path) => {
                state.root.changeSelectState(node, path);
            };
            return {
                ...toRefs(state),
                selectOptions,
                toggleOptions,
                getClassNames,
                dataSetter,
                dataGetter,
                dataFetcher,
                refresh,
                onClickEdit,
                onInit,
                add,
                find,
                fetchAndFind,
                getTreeData,
                deleteNode,
                addNode,
                updateData,
                onChangeSelect,
                onStartDrag,
                onDrop,
                onEndDrag,
                onFinishEdit,
                changeSelectState,
            };
        },
    }),
};


const Template: Story = {
    render: (args, { argTypes }) => ({
        props: Object.keys(argTypes),
        components: { PTree },
        template: `
            <div class="h-full w-full p-4 overflow-auto">
                <div class="mb-4">
                </div>
                <p-tree :data-fetcher="treeDataFetcher" fetch-on-init>
                </p-tree>
            </div>
        `,
        setup() {
            const treeDataFetcher = () => ['A1', 'A2', 'A3'];
            return {
                treeDataFetcher,
            };
        },
    }),
};

export const Basic: Story = {
    ...Template,
};

export const Expert: Story = {
    ...ExpertTemplate,
};

export const Playground: Story = {
    ...Template,
};
