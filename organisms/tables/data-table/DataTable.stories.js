import faker from 'faker';
import { action } from '@storybook/addon-actions';
import { boolean } from '@storybook/addon-knobs';
import PTr from '@/components/atoms/table/Tr.vue';
import PTd from '@/components/atoms/table/Td.vue';
import PTh from '@/components/atoms/table/Th.vue';
import PButton from '@/components/atoms/buttons/Button.vue';
import { DataTableToolSet } from '@/components/organisms/tables/data-table/DataTable.toolset';
import md from './DataTable.md';
import PDataTable from './DataTable.vue';

export default {
    title: 'organisms/tables/datatable',
    component: PDataTable,
    parameters: {
        notes: md,
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
        <div style="background-color: white;">
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

export const usingToolSet = () => ({
    components: { PDataTable },
    mixins: [mockupMixin],
    template: `
        <div style="background-color: white;">
<PDataTable 
    v-bind="ts.state"
    @rowLeftClick="rowLeftClick"
    @rowRightClick="rowRightClick"
    @rowMiddleClick="rowMiddleClick"
    @rowMouseOver="rowMouseOver"
    @rowMouseOut="rowMouseOut"
>
</PDataTable>
        </div>
`,
    setup() {
        const ts = new DataTableToolSet(data);
        return {
            ts,
            ...actions,
        };
    },
});

export const dataTableWithSortFunctionality = () => ({
    components: { PDataTable },
    mixins: [mockupMixin],
    template: `
<div>
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
<div style="background-color: white;">
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
            const bindClass = step % 2 === 0 ? 'table-gray900' : 'table-light';
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
        <div style="background-color: white;">
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
</PDataTable>
        </div>
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
//
// export const loading = () => ({
//     components: { PDataTable },
//     mixins: [mockupMixin],
//     template: `<PDataTable
//                 :items="items"
//                 :fields="fields"
//                 :hover="true"
//                 :loading="loading"
//                 :useCursorLoding="useCursorLoading"
//                 @rowLeftClick="rowLeftClick"
//                 @rowRightClick="rowRightClick"
//                 @rowMiddleClick="rowMiddleClick"
//                 @rowMouseOver="rowMouseOver"
//                 @rowMouseOut="rowMouseOut"
//                 >
//                </PDataTable>
//               `,
//     props: {
//         loading: {
//             default: boolean('loading', true),
//         },
//         useCursorLoading: {
//             default: boolean('useCursorLoading', false),
//         },
//     },
//     data() {
//         return {
//             ...data,
//         };
//     },
//     methods: {
//         ...actions,
//     },
// });
