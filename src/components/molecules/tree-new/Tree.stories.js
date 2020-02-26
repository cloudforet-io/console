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
            state.data.push(new TreeItem(`Item ${i}`));
        });

        return {
            ...toRefs(state),
        };
    },
});

export const redefineData = () => ({
    components: { PTreeNew: PTree },
    template: `<div>
        <p-tree-new :data="data" :options="options"></p-tree-new>
        <br>
        <hr>
        <br>
        <div style="display: flex;">
            <div>
                <h4>data</h4>
                <pre>{{data}}</pre>
            </div>
            <div>
                <h4>options</h4>
                <pre>{{options}}</pre>
            </div>
        </div>
    </div>
    `,
    setup(props, context) {
        const state = getState(props, context);

        state.data = [
            { 'SOME-AWESOME-PROPERTY-FOR-TEXT': 'Item 1' },
            { 'SOME-AWESOME-PROPERTY-FOR-TEXT': 'Item 2' },
            {
                'SOME-AWESOME-PROPERTY-FOR-TEXT': 'Item 3',
                kids: [
                    { 'SOME-AWESOME-PROPERTY-FOR-TEXT': 'Item 3.1' },
                    {
                        'SOME-AWESOME-PROPERTY-FOR-TEXT': 'Item 3.2',
                        kids: [
                            { 'SOME-AWESOME-PROPERTY-FOR-TEXT': 'Item 3.2.1' },
                            { 'SOME-AWESOME-PROPERTY-FOR-TEXT': 'Item 3.2.2' },
                            {
                                'SOME-AWESOME-PROPERTY-FOR-TEXT': 'Item 3.2.3',
                                kids: [
                                    { 'SOME-AWESOME-PROPERTY-FOR-TEXT': 'Item 3.2.3.1' },
                                    { 'SOME-AWESOME-PROPERTY-FOR-TEXT': 'Item 3.2.3.2' },
                                    { 'SOME-AWESOME-PROPERTY-FOR-TEXT': 'Item 3.2.3.3' },
                                ],
                            },
                        ],
                    },
                ],
            },
        ];
        state.options = {
            propertyNames: {
                text: 'SOME-AWESOME-PROPERTY-FOR-TEXT',
                children: 'kids',
            },
        };
        return {
            ...toRefs(state),
        };
    },
});

export const asyncData = () => ({
    components: { PTreeNew: PTree },
    template: `<div>
        <p-tree-new :data="data" :options="options"></p-tree-new>
        <br>
        <hr>
        <br>
        <div style="display: flex;">
            <div>
                <h4>data</h4>
                <pre>{{data}}</pre>
            </div>
            <div>
                <h4>options</h4>
                <pre>{{options}}</pre>
                {{options.fetchData}}
            </div>
        </div>
    </div>
    `,
    setup(props, context) {
        const state = getState(props, context);

        state.data = [
            { item: 'Item 1' },
            { item: 'Item 2', kids: [] },
        ];

        let count = state.data.length;
        const getData = () => new Promise((resolve, reject) => {
            setTimeout(() => {
                console.log('resolve');
                // eslint-disable-next-line no-plusplus
                resolve([{ item: `Item ${++count}` }]); // Yay! Everything went well!
            }, 1000);
        });

        state.options = {
            abc: 'abc',
            fetchData: node => Promise.resolve([{ item: `Item ${++count}` }]),
            propertyNames: {
                text: 'item',
                children: 'kids',
            },
        };

        return {
            ...toRefs(state),
        };
    },
});
