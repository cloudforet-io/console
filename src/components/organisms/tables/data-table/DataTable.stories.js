import faker from 'faker';
import { action } from '@storybook/addon-actions';
import { boolean } from '@storybook/addon-knobs';
import PDataTable from 'src/components/organisms/tables/data-table/DataTable.vue';
import PTr from 'src/components/atoms/table/Tr.vue';
import PTd from 'src/components/atoms/table/Td.vue';
import PTh from 'src/components/atoms/table/Th.vue';
import PButton from 'src/components/atoms/buttons/Button.vue';

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

export const rowVBind = () => ({
    components: { PDataTable },
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
        <p-button styleType="primary" @click="sendEmail">send email</p-button>
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
    },
});
