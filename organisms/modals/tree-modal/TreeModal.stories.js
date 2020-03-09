import { action } from '@storybook/addon-actions';
import {
    toRefs, reactive, ref, computed, Ref,
} from '@vue/composition-api';
import PButton from '@/components/atoms/buttons/Button.vue';
import PTreeModal from './TreeModal.vue';
import TreeItem, { TreeState } from '@/components/molecules/tree-new/ToolSet';

export default {
    title: 'organisms/modals/tree-modal',
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
                    @cancel="cancel"
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
                    @cancel="cancel"
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
                    @cancel="cancel"
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

