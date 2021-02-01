import { toRefs, reactive } from '@vue/composition-api';
import { action } from '@storybook/addon-actions';
import { text, number, object, withKnobs } from '@storybook/addon-knobs';
import casual, { arrayOf } from '@/util/casual';
import PSearchTable from './PSearchTable.vue';

export default {
    title: 'Data Display/Tables/Data Table/Search Table',
    component: PSearchTable,
    decorators: [withKnobs],
    parameters: {
        knobs: { escapeHTML: false },
        design: {
            type: 'figma',
            url: 'https://www.figma.com/file/wq4wSowBcADBuUrMEZLz6i/SpaceONE-Console-Design?node-id=7050%3A233002',
        },
    },
};


export const searchTable = () => ({
    components: { PSearchTable },
    props: {
        fields: {
            default: object('fields', [
                { name: 'id', label: 'ID' },
                { name: 'name', label: 'Name' },
                { name: 'group', label: 'Group' },
            ]),
        },
        sortBy: {
            default: text('sortBy', 'id'),
        },
        selectIndex: {
            default: object('selectIndex', []),
        },
        thisPage: {
            default: number('thisPage', 1),
        },
        pageSize: {
            default: number('pageSize', 10),
        },
        totalCount: {
            default: number('totalCount', 50),
        },
        searchText: {
            default: text('searchText', 'Search Text'),
        },
    },
    template: `
    <div style="width: 80vw;">
        <PSearchTable v-bind="$props"
                      :items="items"
                      :loading="loading"
                      @change="onChange"
                      @export="onExport"
                      @select="onSelect"
        ></PSearchTable>
    </div>`,
    setup() {
        const state = reactive({
            items: [] as object,
            loading: true,
        });

        const getData = async () => {
            state.loading = true;
            state.items = await new Promise(resolve => setTimeout(() => resolve(arrayOf(10, () => ({
                id: casual.uuid, name: casual.word, group: casual.word,
            }))), 1000));
            state.loading = false;
        };

        getData();

        return {
            ...toRefs(state),
            onChange: (...args) => {
                action('change')(...args);
                getData();
            },
            onExport: action('export'),
            onSelect: action('select'),
        };
    },
});
