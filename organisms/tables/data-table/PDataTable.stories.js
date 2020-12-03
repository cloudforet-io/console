import faker from 'faker';
import { action } from '@storybook/addon-actions';
import {
    text, number, select, object, boolean,
} from '@storybook/addon-knobs/vue';
import PButton from '@/components/atoms/buttons/PButton.vue';
import md from '@/components/organisms/tables/data-table/PDataTable.md';
import PDataTable from '@/components/organisms/tables/data-table/PDataTable.vue';
import {
    computed, reactive, toRefs, watch,
} from '@vue/composition-api';
import casual, { arrayOf } from '@/components/util/casual';
import { orderBy } from 'lodash';

export default {
    title: 'Data Display/Tables',
    component: PDataTable,
    parameters: {
        notes: md,
    },
};
const actions = {
    select: action('select'),
    rowLeftClick: action('rowLeftClick'),
    rowRightClick: action('rowRightClick'),
    rowMiddleClick: action('rowMiddleClick'),
    rowMouseOver: action('rowMouseOver'),
    rowMouseOut: action('rowMouseOut'),
    theadClick: action('theadClick'),
    changeSort: action('changeSort'),
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
            const dataset = [];
            for (let step = 0; step < 5; step++) {
                dataset.push(this.getUser());
            }
            return dataset;
        },
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
        skeletonRows: {
            default: number('skeletonRows', 5),
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
            default: text('width', undefined),
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
            items: [],
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
            })),
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
            const bindClass = step % 2 === 0 ? 'gray900' : 'light';
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
            const dataset = [];
            for (let step = 0; step < 20; step++) {
                dataset.push(this.getUser(step));
            }
            return dataset;
        },
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
    @rowRightClick="rowRightClick"
    @rowMiddleClick="rowMiddleClick"
    @rowMouseOver="rowMouseOver"
    @rowMouseOut="rowMouseOut"
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
        PDataTable, PButton,
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
    <td style="color: #0f69ff;" >
        <p-button styleType="primary" @click.stop="sendEmail(data.item,data.index,$event)">send email</p-button>
    </td>
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
                @rowRightClick="rowRightClick"
                @rowMiddleClick="rowMiddleClick"
                @rowMouseOver="rowMouseOver"
                @rowMouseOut="rowMouseOut"
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
    data() {
        return {
            ...data,
        };
    },
    methods: {
        ...actions,
    },
});
