import { action } from '@storybook/addon-actions';
import  mockup  from './Tree.mockup.js';
import PTree from './Tree.vue';
import { autoProps } from '../../../../.storybook/storybook-util';

export default {
    title: 'molecules/tree',
    component: PTree,
    parameters: {
        info: {
            summary: '',
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
    template: `
<div>
<div>
<p-tree    ref="slvueTree"
           :tree-data="mockup"
           class="main-tree-col"
           @nodeclick="nodeclick"
           @beforedrop="beforedrop"
           @toggle="toggle"
           @nodecontextmenu="nodecontextmenu">
 </p-tree >
</div>
</div>`,


    data() {
        console.log('this', mockup);
        console.log('this', data);
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
    computed: {

    },
    methods: {

        ...actions,
    },
});
