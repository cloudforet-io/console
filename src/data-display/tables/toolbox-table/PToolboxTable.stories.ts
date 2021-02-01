import { action } from '@storybook/addon-actions';
import faker from 'faker';
import PToolboxTable from '@/data-display/tables/toolbox-table/PToolboxTable.vue';
import { computed } from '@vue/composition-api';

export default {
    title: 'Data Display/Tables/Data Table/Toolbox Table',
    component: PToolboxTable,
    parameters: {
        design: {
            type: 'figma',
            url: 'https://www.figma.com/file/wq4wSowBcADBuUrMEZLz6i/SpaceONE-Console-Design?node-id=7050%3A238536',
        },
    },
};
const actions = {
    rowLeftClick: action('rowLeftClick'),
    changePageSize: action('changePageSize'),
    changePageNumber: action('changePageNumber'),
    clickSetting: action('clickSetting'),
    clickExcel: action('clickExcel'),
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
    setup() {
        const getUser = () => ({
            name: faker.name.firstName(),
            phone: faker.phone.phoneNumberFormat(),
            email: faker.internet.email(),
        } as object);
        const items = computed(() => {
            const itemData: object[] = [];
            for (let step = 0; step < 5; step++) {
                itemData.push(getUser());
            }
            return itemData;
        });
        return {
            items,
            getUser,
        };
    },
};

export const toolboxTable = () => ({
    components: { PToolboxTable },
    mixins: [mockupMixin],
    template: `
        <div style="width: 80vw">
            <p-toolbox-table
                :items="items" 
                :fields="fields"
                :selectable="selectable"
                :sortable="sortable"
                :sortBy.sync="sortBy"
                :sortDesc.sync="sortDesc"
                :allPage="allPage"
                :thisPage.sync="thisPage"
                :selectIndex.sync="selectIndex"
                :pageSize.sync="pageSize"
                :excelVisible="true"
                @rowLeftClick="rowLeftClick"
                @changePageSize="changePageSize"
                @changePageNumber="changePageNumber"
                @clickSetting="clickSetting"
                @clickRefresh="clickRefresh"
                @clickExcel="clickExcel"
            >
                <template #toolbox-top><div class="w-full h-8 border-green" style="border-width:1px" ></div></template>
                <template #toolbox-left><div style="border: 1px solid green; min-width: 300px "></div></template>
                <template #toolbox-bottom><div style="border: 1px solid blue; width: 100%;height: 50px;"></div></template>
            </p-toolbox-table>
        <div>
            <h5>data</h5>
            <p> sortBy : {{sortBy}} / sortDesc : {{sortDesc}} / thisPage : {{thisPage}} / allPage : {{allPage}} / pageSize: {{pageSize}}</p>
            <p>{{selectIndex}}</p>
        
        </div>
        </div>
    `,
    setup() {
        return {
            ...data,
            ...actions,
        };
    },
});

export const rowSlot = () => ({
    components: { PToolboxTable },
    mixins: [mockupMixin],
    template: `
        <div style="width: 80vw">
            <p-toolbox-table
                :items="items"
                :fields="fields"
                :selectable="selectable"
                :sortable="sortable"
                :sortBy.sync="sortBy"
                :sortDesc.sync="sortDesc"
                :allPage="allPage"
                :thisPage.sync="thisPage"
                :selectIndex.sync="selectIndex"
                :pageSize.sync="pageSize"
                :excelVisible="true"
                @rowLeftClick="rowLeftClick"
                @changePageSize="changePageSize"
                @changePageNumber="changePageNumber"
                @clickSetting="clickSetting"
                @clickRefresh="clickRefresh"
                @clickExcel="clickExcel"
            >
                <template #row="scope">
                    <div>custom row </div>
                </template>
            </p-toolbox-table>
            <div>
                <h5>data</h5>
                <p> sortBy : {{sortBy}} / sortDesc : {{sortDesc}} / thisPage : {{thisPage}} / allPage : {{allPage}} / pageSize: {{pageSize}}</p>
                <p>{{selectIndex}}</p>
            </div>
        </div>
    `,
    setup() {
        return {
            ...data,
            ...actions,
        };
    },
});


export const colSlot = () => ({
    components: { PToolboxTable },
    mixins: [mockupMixin],
    template: `
        <div style="width: 80vw">
            <p-toolbox-table
                :items="items"
                :fields="fields"
                :selectable="selectable"
                :sortable="sortable"
                :sortBy.sync="sortBy"
                :sortDesc.sync="sortDesc"
                :allPage="allPage"
                :thisPage.sync="thisPage"
                :selectIndex.sync="selectIndex"
                :pageSize.sync="pageSize"
                :excelVisible="true"
                @rowLeftClick="rowLeftClick"
                @changePageSize="changePageSize"
                @changePageNumber="changePageNumber"
                @clickSetting="clickSetting"
                @clickRefresh="clickRefresh"
                @clickExcel="clickExcel"
            >
                <template #col-name-format="scope">
                    <td>hi {{scope.value}} </td>
                </template>
            </p-toolbox-table>
            <div>
                <h5>data</h5>
                <p> sortBy : {{sortBy}} / sortDesc : {{sortDesc}} / thisPage : {{thisPage}} / allPage : {{allPage}} / pageSize: {{pageSize}}</p>
                <p>{{selectIndex}}</p>
            </div>
        </div>
    `,
    setup() {
        return {
            ...data,
            ...actions,
        };
    },
});
