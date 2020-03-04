import { select, boolean } from '@storybook/addon-knobs/vue';
import faker from 'faker';
import PTr from '@/components/atoms/table/Tr.vue';
import PTd from '@/components/atoms/table/Td.vue';
import PTh from '@/components/atoms/table/Th.vue';
import PTable from '@/components/molecules/tables/Table.vue';

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
                <p-tr v-for="(d, key) in dataMap" :key="key">
                    <p-td>{{ d[0] }}</p-td>
                    <p-td>{{ d[1] }}</p-td>
                    <p-td>{{ d[2] }}</p-td>
                </p-tr>
            </template>
            </p-table>
            `,
    props: {
        tableStyleType: {
            default: select('tableStyleType', ['', 'primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark'], ''),
        },
        theadStyleType: {
            default: select('theadStyleType', ['', 'light', 'dark'], ''),
        },
        responsive: {
            default: select('responsive', ['', true, 'sma', 'md', 'lg', 'xl'], ''),
        },
        bord: {
            default: select('responsive', ['', true, false], ''),
        },
        striped: {
            default: boolean('striped', true),
        },
        hover: {
            default: boolean('hover', true),
        },
        small: {
            default: boolean('small', true),
        },
        background: {
            default: boolean('background', true),
        },
    },
    created() {
        this.getUsers();
    },
    data() {
        return {
            dataMap: null,
        };
    },
    methods: {
        getUsers() {
            const data = [];
            for (let i = 0; i < 5; i++) {
                data.push(this.getUser());
            }
            this.dataMap = data;
        },
        getUser() {
            const firstName = `${faker.name.firstName()} ${faker.name.lastName()}`;
            const phoneNumber = faker.phone.phoneNumber();
            const eMail = faker.internet.email();
            return [firstName, phoneNumber, eMail];
        },
    },
});
