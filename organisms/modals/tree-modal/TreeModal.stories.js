import { action } from '@storybook/addon-actions';
import { ref } from '@vue/composition-api';
import PButton from '@/components/atoms/buttons/Button.vue';
import PTreeModal from './TreeModal.vue';
import { TreeModalToolSet } from '@/components/organisms/modals/tree-modal/toolset';
import TreeItem, { TreeState } from '@/components/molecules/tree-origin/ToolSet';

export default {
    title: 'organisms/modals/tree_origin-modal',
    component: PTreeModal,
    parameters: {
        info: {
            summary: '',
            components: { PTreeModal },
        },
        centered: { disable: true },
    },
};


export const defaultCase = () => ({
    components: { PTreeModal, PButton },
    template: `<div>
                    <p-button styleType="primary" @click="click">Launch a modal</p-button>
                <PTreeModal
                    :scrollable="false"
                    :visible.sync="visible"
                    themeColor="primary"
                    v-bind="state"
                    @cancel="close"
                    @close="close"
                    @confirm="confirm"
                    >
                </PTreeModal>
            </div>`,
    setup(props, context) {
        const state = new TreeState().state;

        const arr = _.range(5);
        arr.forEach((i) => {
            state.data.push(new TreeItem(`Item ${i}`));
        });


        const visible = ref(false);
        return {
            visible,
            state,
            click() {
                visible.value = true;
            },
            close() {
                visible.value = false;
            },
            confirm() {
                visible.value = false;
            },
        };
    },

});

export const autoScroll = () => ({
    components: { PTreeModal, PButton },
    template: `<div>
                    <p-button styleType="primary" @click="click">Launch a modal</p-button>
                <PTreeModal
                    :scrollable="false"
                    :visible.sync="visible"
                    themeColor="primary"
                    v-bind="state"
                    @cancel="close"
                    @close="close"
                    @confirm="confirm"
                    >
                </PTreeModal>
            </div>`,
    setup(props, context) {
        const state = new TreeState().state;

        const arr = _.range(30);
        arr.forEach((i) => {
            state.data.push(new TreeItem(`Item ${i}`));
        });


        const visible = ref(false);
        return {
            visible,
            state,
            click() {
                visible.value = true;
            },
            close() {
                visible.value = false;
            },
            confirm() {
                visible.value = false;
            },
        };
    },

});

export const asyncData = () => ({
    components: { PTreeModal, PButton },
    template: `<div>
                    <p-button styleType="primary" @click="click">Launch a modal</p-button>
                <PTreeModal
                    :scrollable="false"
                    :visible.sync="visible"
                    themeColor="primary"
                    v-bind="state"
                    @cancel="close"
                    @close="close"
                    @confirm="confirm"
                    >
                </PTreeModal>
            </div>`,
    setup(props, context) {
        const state = new TreeState().state;

        let count = 0;

        const getData = () => new Promise((resolve) => {
            setTimeout(() => {
                state.data = [{
                    id: `pg-e1c7d31869a${count}`,
                    name: `pg ${count}`,
                    // eslint-disable-next-line camelcase
                    has_child: true,
                }, {
                    id: `project-e1c7d31869a${count}`,
                    name: `project ${count}`,
                    // eslint-disable-next-line camelcase
                    has_child: false,
                }];
                count += 1;
                resolve(state.data);
            }, 1000);
        });

        state.options = {
            async fetchData(node) {
                state.loading = true;
                const res = await getData();
                state.loading = false;
                return res;
            },
            propertyNames: {
                id: 'id',
                text: 'name',
                isBatch: 'has_child',
            },
        };
        const visible = ref(false);
        return {
            visible,
            state,
            click() {
                visible.value = true;
            },
            close() {
                visible.value = false;
            },
            confirm() {
                visible.value = false;
            },
            nodeRightClick: action('nodeRightClick'),
            emptyRightClick: action('emptyRightClick'),
        };
    },
});

export const useToolSet = () => ({
    components: { PTreeModal, PButton },
    template: `<div>
                    <p-button styleType="primary" @click="click">Launch a modal</p-button>
                <PTreeModal 
                    ref="treeApi"
                    :scrollable="false"
                    :visible.sync="treeTs.syncState.visible"
                    themeColor="primary"
                    v-bind="treeTs.state"
                    @cancel="close"
                    @close="close"
                    @confirm="confirm"
                    @node:selected="update"
                    @node:unselected="update"
                    >
                    <div style="display: flex; max-height: 30%;" class="overflow-auto">
                        <div>
                            <h4>select node</h4>
                            <pre>{{treeTs.metaState.selectedNode}}</pre>
                        </div>
                        <div>
                            <h4>first select node</h4>
                            <pre>{{treeTs.metaState.firstSelectedNode}}</pre>
                        </div>
                    </div>
                </PTreeModal>
            </div>`,
    setup(props, context) {
        const treeTs = new TreeModalToolSet();

        treeTs.state.data = [
            { text: 'Item 1' },
            { text: 'Item 2' },
            {
                text: 'Item 3',
                kids: [
                    { text: 'Item 3.1' },
                    {
                        text: 'Item 3.2',
                        kids: [
                            { text: 'Item 3.2.1' },
                            { text: 'Item 3.2.2' },
                        ],
                    },
                ],
            },
        ];
        treeTs.state.options = {
            propertyNames: {
                text: 'text',
                children: 'kids',
            },
        };
        return {
            treeTs,
            treeApi: treeTs.treeRef,
            update: (event) => {
                treeTs.getSelectedNode(event);
            },
            click() {
                treeTs.open();
            },
            close() {
                treeTs.close();
            },
            confirm() {
                treeTs.close();
            },
        };
    },
});
