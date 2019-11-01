import { action } from '@storybook/addon-actions';
import faker from 'faker';
import ToolboxTable from './ToolboxTable';
import { autoProps } from '../../../../setup/storybook-util';

export default {
    title: 'organisms/tables/toolbox-table',
    component: ToolboxTable,
    parameters: {
        info: {
            summary: '',
            components: { ToolboxTable },
        },
        // centered: { disable: true },
    },
};
const actions = {
    rowLeftClick: action('rowLeftClick'),
    rowRightClick: action('rowRightClick'),
    rowMiddleClick: action('rowMiddleClick'),
    rowMouseOver: action('rowMouseOver'),
    rowMouseOut: action('rowMouseOut'),
    changePageSize: action('changePageSize'),
    changePageNumber: action('changePageNumber'),
    clickSetting: action('clickSetting'),
    clickRefresh: action('clickRefresh'),
};
const data = {
    fields: ['name', 'phone', 'email'],
    selectable: true,
    sortable: true,
    selectIndex: [],
    sortBy: 'name',
    sortDesc: true,
    thisPage: 1,
    allPage: 10,
    pageSize: 15,
};

const mockupMixin = {
    methods: {
        getUser() {
            return {
                name: faker.name.firstName(),
                phone: faker.phone.phoneNumberFormat(),
                email: faker.internet.email(),
            };
        },
    },
    computed: {
        items() {
            const data = [];
            for (let step = 0; step < 5; step++) {
                data.push(this.getUser());
            }
            return data;
        },
    },
};

export const table = () => ({
    components: { ToolboxTable },
    mixins: [mockupMixin],
    template: `
<div style="width: 80vw">
<ToolboxTable
    :items="items" 
    :fields="fields"
    :selectable="selectable"
    :sortable="sortable"
    :sortBy="sortBy"
    :sortDesc="sortDesc"
    :allPage="allPage"
    :thisPage.sync="thisPage"
    :selectIndex.sync="selectIndex"
    :pageSize.sync="pageSize"
    @rowLeftClick="rowLeftClick"
    @rowRightClick="rowRightClick"
    @changePageSize="changePageSize"
    @changePageNumber="changePageNumber"
    @clickSetting="clickSetting"
    @clickRefresh="clickRefresh"
></ToolboxTable>
<div>
<h5>data</h5>
<p> sortBy : {{sortBy}} / sortDesc : {{sortDesc}} / thisPage : {{thisPage}} / allPage : {{allPage}} / pageSize: {{pageSize}}</p>
<p>{{selectIndex}}</p>

</div>
</div>
`,
    data() {
        return {
            ...data,
        };
    },
    methods: {
        ...actions,
    },
});
