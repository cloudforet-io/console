import { action } from '@storybook/addon-actions';
import { autoProps } from '@sb/storybook-util';
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

const data = {
    ...mockup,
};

const actions = {
    nodeclick: action('nodeclick'),
    beforedrop: action('beforedrop'),
    toggle: action('toggle'),
    nodecontextmenu: action('nodecontextmenu'),
};

export const tree = () => ({
    components: { PTree },
    template: `<div>
                    <p-tree    ref="slvueTree"
                               :tree-data="mockup"
                               class="main-tree-col"
                               @nodeclick="nodeclick"
                               @beforedrop="beforedrop"
                               @toggle="toggle"
                               @nodecontextmenu="nodecontextmenu">
                     </p-tree >
                </div>`,
    data() {
        return {
            ...data,
        };
    },
    props: {
        ...autoProps(PTree, [
            { name: 'centered' },
            { name: 'backdrop' },
            { name: 'fade' },
            { name: 'keyboard' },
        ]),

    },
    methods: {
        ...actions,
    },
});
