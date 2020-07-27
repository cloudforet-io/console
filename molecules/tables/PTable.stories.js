import { select, boolean } from '@storybook/addon-knobs/vue';
import faker from 'faker';
import PTable from '@/components/molecules/tables/PTable.vue';

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
        PTable,
    },
    template: `
            <p-table 
                :tableStyleType="tableStyleType"
                :striped="striped"
                :bordered="bordered"
                :hover="hover"
                :background="background"
                
            >
            <template #head>
            <tr>
                <th>name</th>
                <th>phone</th>
                <th>email</th>
            </tr>
            </template>
            <template #body>
                <tr v-for="(d, key) in dataMap" :key="key">
                    <td>{{ d[0] }}</td>
                    <td>{{ d[1] }}</td>
                    <td>{{ d[2] }}</td>
                </tr>
            </template>
            </p-table>
            `,
    props: {
        tableStyleType: {
            default: select('tableStyleType', ['default', 'light', 'primary4'], 'default'),
        },
        bordered: {
            default: boolean('bordered', true),
        },
        striped: {
            default: boolean('striped', true),
        },
        hover: {
            default: boolean('hover', true),
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
