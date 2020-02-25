import {
    toRefs, reactive, ref, computed,
} from '@vue/composition-api';
import { action } from '@storybook/addon-actions';
import _ from 'lodash';
import PTree from './Tree.vue';
import TreeItem from '@/components/molecules/tree-new/TreeData';

export default {
    title: 'molecules/tree-new/Tree',
    component: PTree,
    parameters: {
        info: {
            summary: '',
            components: { PTree },
        },
    },
};

const getState = (props, context) => {
    const state = reactive({
        data: [],
        options: {},
    });

    return state;
};

export const defaultCase = () => ({
    components: { PTreeNew: PTree },
    template: '<p-tree-new :data="data" :options="options"></p-tree-new>',
    setup(props, context) {
        const state = getState(props, context);

        const arr = _.range(5);
        arr.forEach((i) => {
            state.data.push(new TreeItem(`item${i}`));
        });

        return {
            ...toRefs(state),
        };
    },
});

//
// export const redefineData = () => ({
//     components: { PTreeNew: PTree },
//     template: `<div>
//         <p-tree-new :tree-data="treeData"></p-tree-new>
//         <br>
//         <br>
//         <pre>{{sample}}</pre>
//     </div>
//     `,
//     setup(props, context) {
//         const state = getState(props, context);
//
//         const sample = [
//             { 'SOME-AWESOME-PROPERTY-FOR-TEXT': 'Item 1' },
//             { 'SOME-AWESOME-PROPERTY-FOR-TEXT': 'Item 2' },
//             {
//                 'SOME-AWESOME-PROPERTY-FOR-TEXT': 'Item 3',
//                 kids: [
//                     { 'SOME-AWESOME-PROPERTY-FOR-TEXT': 'Item 3.1' },
//                     { 'SOME-AWESOME-PROPERTY-FOR-TEXT': 'Item 3.2' },
//                 ],
//             },
//         ];
//
//         state.tree = new Tree(sample, {
//             propertyNames: {
//                 text: 'SOME-AWESOME-PROPERTY-FOR-TEXT',
//                 children: 'kids',
//             },
//         });
//         return {
//             ...toRefs(state),
//             sample,
//         };
//     },
// });
