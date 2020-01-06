import { action } from '@storybook/addon-actions';
import { autoProps } from '@sb/storybook-util';
import { ref, reactive, toRefs } from '@vue/composition-api';
import mockup from '@/components/molecules/tree/Tree.mockup';
import PTree from '@/components/molecules/tree/Tree';

export default {
    title: 'molecules/tree',
    component: PTree,
    parameters: {
        info: {
            summary: 'Tree view which ',
            components: { PTree },
        },
    },
};

const data = reactive({
    ...mockup,
});

const actions = context => ({
    nodeclick: action('nodeclick'),
    beforedrop: action('beforedrop'),
    toggle: (node) => {
        console.log('######################################');
        const tree = context.refs.slvueTree;
        const path = tree.getSelectedNode()[0];
        debugger;
        tree.insert(path, { data: { title: 'test!', isLeaf: true, data: { visible: false } } });
        //
        // childrenNode = this.getSelectedNodeArr(response.data.items, 'PROJECT');
        // tree.updateNode(path, { data: dataParam });
        // if (!this.isEmpty(childrenNode)) {
        //     childrenNode.forEach((curItem) => {
        //         tree.insert({ node: selected, placement: 'inside' }, curItem);
        //     });
        // }
        // action('toggle')
        // },
    },
    nodecontextmenu: action('nodecontextmenu'),
});

export const tree = () => ({
    components: { PTree },
    template: `<div>
                    <p-tree    ref="slvueTree"
                               :tree-data="mockup"
                               class="main-tree-col"
                               @nodeClick="nodeclick"
                               @beforeDrop="beforedrop"
                               @nodeToggle="toggle"
                               @nodeContextMenu="nodecontextmenu">
                     </p-tree >
                </div>`,
    props: {
        ...autoProps(PTree, [
            { name: 'centered' },
            { name: 'backdrop' },
            { name: 'fade' },
            { name: 'keyboard' },
        ]),

    },
    setup(props, context) {
        return {
            ...toRefs(data),
            ...actions(context),
        };
    },
});
