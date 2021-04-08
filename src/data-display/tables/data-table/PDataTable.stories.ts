import faker from 'faker';
import { action } from '@storybook/addon-actions';
import {
    text, number, object, boolean, withKnobs,
} from '@storybook/addon-knobs';
import PButton from '@/inputs/buttons/button/PButton.vue';
import PDataTable from '@/data-display/tables/data-table/PDataTable.vue';
import {
    computed, reactive, ref, toRefs, watch,
} from '@vue/composition-api';
import casual, { arrayOf } from '@/util/casual';
import { orderBy } from 'lodash';

export default {
    title: 'Data Display/Tables/Data Table',
    component: PDataTable,
    decorators: [withKnobs],
    parameters: {
        design: {
            type: 'figma',
            url: 'https://www.figma.com/file/wq4wSowBcADBuUrMEZLz6i/SpaceONE-Console-Design?node-id=6019%3A125596',
        },
    },
};
const actions = {
    select: action('select'),
    rowLeftClick: action('rowLeftClick'),
    changeSort: action('changeSort'),
};
const data = {
    fields: ['name', 'phone', 'email'],
    sortable: true,
    sortBy: null,
    sortDesc: true,
};

const mockupMixin = {
    setup() {
        const getUser = () => ({
            name: faker.name.firstName(),
            phone: faker.phone.phoneNumberFormat(),
            email: faker.internet.email(),
        });
        const items = computed(() => {
            const dataset = [] as any;
            for (let step = 0; step < 5; step++) {
                dataset.push(getUser());
            }
            return dataset;
        });
        return {
            items,
            getUser,
        };
    },
};

export const dataTable = () => ({
    components: { PDataTable },
    props: {
        fields: {
            default: object('fields', ['name', 'phone', 'email']),
        },
        itemCount: {
            default: number('itemCount', 10),
        },
        loading: {
            default: boolean('loading', false),
        },
        selectable: {
            default: boolean('selectable', false),
        },
        colCopy: {
            default: boolean('colCopy', false),
        },
        useCursorLoading: {
            default: boolean('useCursorLoading', false),
        },
        multiSelect: {
            default: boolean('multiSelect', false),
        },
        rowClickMultiSelectMode: {
            default: boolean('rowClickMultiSelectMode', false),
        },
        rowHeightFixed: {
            default: boolean('rowHeightFixed', true),
        },
        width: {
            default: text('width', ''),
        },
    },
    template: `
        <div style="display: flex; 
                    justify-content: center; 
                    align-items: center; 
                    height: 100vh; 
                    width: 100vw; 
                    background-color: beige;">
            <div style="background-color: white; 
                        height: 80%; 
                        width: 80%;">
                <PDataTable v-bind="$props"
                            :items="items"
                            v-on="actions"
                >
                </PDataTable>
            </div>
        </div>
    `,
    setup(props) {
        const state = reactive({
            items: [] as object,
        });

        const getUsers = () => {
            state.items = arrayOf(props.itemCount, () => {
                const res = {};
                props.fields.forEach((d) => {
                    res[d] = casual.word;
                });
                return res;
            });
        };

        watch([() => props.fields, () => props.itemCount], () => {
            getUsers();
        });


        return {
            ...toRefs(state),
            actions,
        };
    },
});

export const sortCase = () => ({
    components: { PDataTable },
    props: {
        sortable: {
            default: boolean('sortable', true),
        },
    },
    template: `
        <div>
            <PDataTable :sortable="sortable"
                        :sort-by.sync="sortBy"
                        :sort-desc.sync="sortDesc"
                        :fields="fields"
                        :items="items"
                        @changeSort="onChangeSort"
            >
            </PDataTable>
            <p>sort by : {{sortBy}}, sort desc : {{sortDesc}}</p>
        </div>
    `,
    setup() {
        const state = reactive({
            fields: ['name', 'phone', 'email'],
            items: arrayOf(10, () => ({
                name: casual.full_name,
                phone: casual.phone,
                email: casual.email,
            })) as object,
            sortBy: 'name',
            sortDesc: true,
        });


        return {
            ...toRefs(state),
            onChangeSort(sortBy, sortDesc) {
                if (sortBy) {
                    state.items = orderBy(state.items, [sortBy], [sortDesc ? 'desc' : 'asc']);
                }
                action('changeSort')(sortBy, sortDesc);
            },
        };
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
            <p-button @click="getData" styleType="primary" >Import Selected Data</p-button>
            <p>{{selected}}</p>
        </div>
    `,
    setup(props, { table }) {
        const selected = ref([]);
        const getData = () => {
            selected.value = table.getSelectItem();
        };
        return {
            ...data,
            ...actions,
            selectIndex: [],
            selected,
            getData,
        };
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
            <p-button @click="getData" styleType="primary" >Import Selected Data</p-button>
            <p>{{selected}}</p>
        </div>
    `,
    setup() {
        let $refs!: {
            table: HTMLFormElement;
        };
        const selected = ref([]);
        const getData = () => {
            selected.value = $refs.table.getSelectItem();
        };
        return {
            $refs,
            ...data,
            ...actions,
            selectIndex: [],
            selected,
            getData,
        };
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
        >
        </PDataTable>
    `,
    setup() {
        const getUser = (step) => {
            const bindClass = step % 2 === 0 ? 'gray900' : 'light';
            return {
                name: faker.name.firstName(),
                phone: faker.phone.phoneNumberFormat(),
                email: faker.internet.email(),
            };
        };
        const items = computed(() => {
            const dataset = [] as any;
            for (let step = 0; step < 20; step++) {
                dataset.push(getUser(step));
            }
            return dataset;
        });
        return {
            ...data,
            getUser,
            items,
            ...actions,
        };
    },
});

export const customRowSlot = () => ({
    components: {
        PDataTable,
    },
    mixins: [mockupMixin],
    template: `
        <PDataTable
            :items="items"
            :fields="fields"
            :hover="true"
            @rowLeftClick="rowLeftClick"
        >
            <template slot="row"  slot-scope="data">
                <tr  style="color: #0f69ff;">
                    <td v-for="field in data.fields">
                        {{data.item[field]}}
                    </td>
                </tr>
            </template>
        </PDataTable>
    `,
    setup() {
        return {
            ...data,
            ...actions,
        };
    },
});


export const customColSlot = () => ({
    components: {
        PDataTable, PButton,
    },
    mixins: [mockupMixin],
    template: `
        <div style="background-color: white;">
            <PDataTable
                :items="items"
                :fields="fields"
                @rowLeftClick="rowLeftClick"
            >
            <template slot="col-email"  slot-scope="data">
                <td style="color: #0f69ff;" >
                    <p-button styleType="primary" @click.stop="sendEmail(data.item,data.index,$event)">send email</p-button>
                </td>
            </template>
            </PDataTable>
        </div>
    `,
    setup() {
        return {
            ...data,
            ...actions,
            sendEmail: action('send_email'),
        };
    },
});

export const loading = () => ({
    components: { PDataTable },
    mixins: [mockupMixin],
    template: `<PDataTable
                :items="items"
                :fields="fields"
                :hover="true"
                :loading="loading"
                :useCursorLoding="useCursorLoading"
                @rowLeftClick="rowLeftClick"
                >
               </PDataTable>
              `,
    props: {
        loading: {
            default: boolean('loading', true),
        },
        useCursorLoading: {
            default: boolean('useCursorLoading', false),
        },
    },
    setup() {
        return {
            ...data,
            ...actions,
        };
    },
});

export const invalid = () => ({
    components: { PDataTable },
    mixins: [mockupMixin],
    template: `<PDataTable
                :items="items"
                :fields="fields"
                :hover="true"
                :invalid="invalid"
                selectable
                @rowLeftClick="rowLeftClick"
                >
               </PDataTable>
              `,
    props: {
        invalid: {
            default: boolean('invalid', true),
        },
    },
    setup() {
        return {
            ...data,
            ...actions,
        };
    },
});
