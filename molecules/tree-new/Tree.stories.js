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
        loading: false,
        nodeRightClick(node) {
            console.log('nodeRightClick', node);
        },
        emptyRightClick() {
            console.log('emptyRightClick');
        },
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
        <p-tree-new :options="options" :loading="loading" 
                    @nodeRightClick="nodeRightClick" @emptyRightClick="emptyRightClick">
        </p-tree-new>
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
                children: 'kids',
                isBatch: 'has_child',
            },
        };

        return {
            ...toRefs(state),
        };
    },
});
