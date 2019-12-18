import { action } from '@storybook/addon-actions';
import { select } from '@storybook/addon-knobs/vue';
import faker from 'faker';
import PTr from '../../atoms/table/Tr.vue';
import PTd from '../../atoms/table/Td.vue';
import PTh from '../../atoms/table/Th.vue';
import PTable from './Table.vue';
import { autoProps } from '../../../../.storybook/storybook-util';

export default {
    title: 'molecules/table',
    component: PTable,
    parameters: {
        info: {
            summary: '',
            components: { PTable },
        },
    },
};

export const table = () => ({
    components: {
        PTable, PTr, PTd, PTh,
    },
    template: `
<p-table 
    :tableStyleType="tableStyleType"
    :theadStyleType="theadStyleType"
    :striped="striped"
    :bord="bord"
    :hover="hover"
    :small="small"
    :background="background"
    :responsive="responsive"
    
>
<template #head>
<p-tr>
    <p-th>name</p-th>
    <p-th>phone</p-th>
    <p-th>email</p-th>
</p-tr>
</template>
<template #body>
<p-tr v-for="user in users">
    <p-td>{{user[0]}}</p-td>
    <p-td>{{user[1]}}</p-td>
    <p-td>{{user[2]}}</p-td>
</p-tr>
</template>
</p-table>
`,

    props: {
        tableStyleType: {
            default: select('tableStyleType', [null, 'primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark'], null),
        },
        theadStyleType: {
            default: select('theadStyleType', [null, 'light', 'dark'], null),
        },
        responsive: {
            default: select('responsive', [null, true, 'sma', 'md', 'lg', 'xl'], null),
        },
        bord: {
            default: select('responsive', [null, true, false], null),
        },
        ...autoProps(PTable, [
            { name: 'striped' },
            { name: 'hover' },
            { name: 'small' },
            { name: 'background' },
        ]),
    },
    computed: {
        users() {
            const data = [];
            for (let step = 0; step < 5; step++) {
                data.push(this.getUser());
            }
            return data;
        },
    },
    methods: {
        getUser() {
            return [faker.name.firstName(), faker.phone.phoneNumberFormat(), faker.internet.email()];
        },
    },
});
