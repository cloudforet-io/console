import faker from 'faker';
import { action } from '@storybook/addon-actions';
import possibleConstructorReturn from '@babel/runtime-corejs2/helpers/esm/possibleConstructorReturn';
import { boolean } from '@storybook/addon-knobs';
import PDataTable from './DataTable.vue';
import PTr from '../../../atoms/table/Tr.vue';
import PTd from '../../../atoms/table/Td.vue';
import PTh from '../../../atoms/table/Th.vue';
import PButton from '../../../atoms/buttons/Button.vue';

export default {
    title: 'organisms/tables/datatable',
    component: PDataTable,
    parameters: {
        info: {
            summary: '',
            components: { PDataTable },
        },
    },
};
const actions = {
    rowLeftClick: action('rowLeftClick'),
    rowRightClick: action('rowRightClick'),
    rowMiddleClick: action('rowMiddleClick'),
    rowMouseOver: action('rowMouseOver'),
    rowMouseOut: action('rowMouseOut'),
};
const data = {
    fields: ['name', 'phone', 'email'],
    sortable: true,
    sortBy: null,
    sortDesc: true,
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
export const datatable = () => ({
    components: { PDataTable },
    mixins: [mockupMixin],
    template: `
<PDataTable 
    :items="items" 
    :fields="fields"
    :hover="true"
    @rowLeftClick="rowLeftClick"
    @rowRightClick="rowRightClick"
    @rowMiddleClick="rowMiddleClick"
    @rowMouseOver="rowMouseOver"
    @rowMouseOut="rowMouseOut"
>
</PDataTable>
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

export const sortTable = () => ({
    components: { PDataTable },
    mixins: [mockupMixin],
    template: `
<div>
<PDataTable 
    :items="items" 
    :fields="fields"
    :hover="true"
    @rowLeftClick="rowLeftClick"
    @rowRightClick="rowRightClick"
    @rowMiddleClick="rowMiddleClick"
    @rowMouseOver="rowMouseOver"
    @rowMouseOut="rowMouseOut"
    :sortable="sortable"
    :sortBy.sync="sortBy"
    :sortDesc.sync="sortDesc"
>
</PDataTable>
<p>sort by : {{sortBy}}, sort desc : {{sortDesc}}</p>
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

export const selectTable = () => ({
    components: { PDataTable, PButton },
    mixins: [mockupMixin],
    template: `
<div>
<PDataTable 
    ref="table"
    :items="items" 
    :fields="fields"
    :hover="true"
    @rowLeftClick="rowLeftClick"
    :selectable="true"
    :selectIndex.sync="selectIndex"
>
</PDataTable>
<p>select index: {{selectIndex}} </p>
<p-button @click="getData" styleType="primary" >선택한 데이터 가져오기</p-button>
<p>{{selected}}</p> 
</div>
`,
    data() {
        return {
            ...data,
            selectIndex: [],
            selected: [],
        };
    },
    methods: {
        ...actions,
        getData() {
            this.selected = this.$refs.table.getSelectItem();
        },
    },
});

export const rowClickMultiSelectMode = () => ({
    components: { PDataTable, PButton },
    mixins: [mockupMixin],
    template: `
<div>
<PDataTable 
    ref="table"
    :items="items" 
    :fields="fields"
    :hover="true"
    :rowClickMultiSelectMode="true"
    @rowLeftClick="rowLeftClick"
    :selectable="true"
    :selectIndex.sync="selectIndex"
>
</PDataTable>
<p>select index: {{selectIndex}} </p>
<p-button @click="getData" styleType="primary" >선택한 데이터 가져오기</p-button>
<p>{{selected}}</p> 
</div>
`,
    data() {
        return {
            ...data,
            selectIndex: [],
            selected: [],
        };
    },
    methods: {
        ...actions,
        getData() {
            this.selected = this.$refs.table.getSelectItem();
        },
    },
});

export const rowVBind = () => ({
    components: { PDataTable },
    mixins: [mockupMixin],
    template: `
<PDataTable 
    :items="items" 
    :fields="fields"
    :hover="true"
    @rowLeftClick="rowLeftClick"
    @rowRightClick="rowRightClick"
    @rowMiddleClick="rowMiddleClick"
    @rowMouseOver="rowMouseOver"
    @rowMouseOut="rowMouseOut"
>
</PDataTable>
`,
    data() {
        return {
            ...data,
        };
    },
    methods: {
        ...actions,
        getUser(step) {
            const bindClass = step % 2 === 0 ? 'table-dark' : 'table-light';
            return {
                name: faker.name.firstName(),
                phone: faker.phone.phoneNumberFormat(),
                email: faker.internet.email(),
                vbind: {
                    class: [bindClass],
                },
            };
        },
    },
    computed: {
        items() {
            const data = [];
            for (let step = 0; step < 20; step++) {
                data.push(this.getUser(step));
            }
            return data;
        },
    },
});

export const customRowSlot = () => ({
    components: {
        PDataTable, PTr, PTh, PTd,
    },
    mixins: [mockupMixin],
    template: `
<PDataTable 
    :items="items" 
    :fields="fields"
    :hover="true"
    @rowLeftClick="rowLeftClick"
    @rowRightClick="rowRightClick"
    @rowMiddleClick="rowMiddleClick"
    @rowMouseOver="rowMouseOver"
    @rowMouseOut="rowMouseOut"
>
<template slot="row"  slot-scope="data">
<p-tr  style="color: #0f69ff;">
    <p-td v-for="field in data.fields">
        {{data.item[field]}}
    </p-td>
</p-tr>
</template>
</p-tr>
</PDataTable>
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


export const customColSlot = () => ({
    components: {
        PDataTable, PTr, PTh, PTd, PButton,
    },
    mixins: [mockupMixin],
    template: `
<PDataTable 
    :items="items" 
    :fields="fields"
    @rowLeftClick="rowLeftClick"
    @rowRightClick="rowRightClick"
    @rowMiddleClick="rowMiddleClick"
    @rowMouseOver="rowMouseOver"
    @rowMouseOut="rowMouseOut"
>
<template slot="col-email"  slot-scope="data">
    <p-td style="color: #0f69ff;" >
        <p-button styleType="primary" @click.stop="sendEmail(data.item,data.index,$event)">send email</p-button>
    </p-td>
</template>
</p-tr>
</PDataTable>
`,
    data() {
        return {
            ...data,
        };
    },
    methods: {
        ...actions,
        sendEmail: action('send_email'),
    },
});

export const loading = () => ({
    components: { PDataTable },
    mixins: [mockupMixin],
    template: `
<PDataTable 
    :items="items" 
    :fields="fields"
    :hover="true"
    @rowLeftClick="rowLeftClick"
    @rowRightClick="rowRightClick"
    @rowMiddleClick="rowMiddleClick"
    @rowMouseOver="rowMouseOver"
    @rowMouseOut="rowMouseOut"
>
</PDataTable>
`,
    props: {
        loding: {
            default: boolean('loading', false),
        },
        useSpinnerLoding: { default: boolean('useSpinnerLoding', true) },
        useCursorLoding: {
            default: boolean('useCursorLoding', false),
        },

    },
    data() {
        return {
            ...data,
        };
    },
    methods: {
        ...actions,
    },
});
