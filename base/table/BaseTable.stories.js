import BaseTable from './BaseTable';
import { autoProps } from '@sb/storybook-util';
import { action } from '@storybook/addon-actions';

export default {
    title: 'base/BaseTable',
    component: BaseTable,
    parameters: {
        info: {
            summary: '',
            components: { BaseTable }
        }
    }
};
const actions = {
    rowClicked: action('rowClicked'),
    onSelectAll: action('onSelectAll'),
    list: action('list'),
    changed: action('changed'),
    limitChanged: action('limitChanged'),
};
const data = {
    fields: ['id', 'name', 'sample'],
    tableData: [
        { id: 1, name: 'hihi', sample: 'abcd' },
        { id: 2, name: 'hihi', sample: 'abcd' },
        { id: 3, name: 'abcd', sample: 'asdfcd' }
    ]
};

export const table = () => ({
    components: { BaseTable },
    template: `
        <BaseTable 
            @rowClicked="rowClicked" 
            @onSelectAll="onSelectAll"
            @list="list"
            @changed="changed"
            @limitChanged="limitChanged"
            :headerless="true"
            :fields="fields"
            :tableData="tableData"
            >
            
        </BaseTable>`,
    data() {
        return {
            ...data
        };
    },
    props: {
        ...autoProps(BaseTable, [
            { name: 'searchable', default: false },
            { name: 'selectable', default: false }
        ])
    },
    methods: {
        ...actions
    }
});


