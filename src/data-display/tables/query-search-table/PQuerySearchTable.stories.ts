import {
    toRefs, reactive,
} from '@vue/composition-api';
import { action } from '@storybook/addon-actions';
import {
    text, number, object, withKnobs
} from '@storybook/addon-knobs';
import casual, { arrayOf } from '@/util/casual';
import PQuerySearchTable from './PQuerySearchTable.vue';

export default {
    title: 'Data Display/Tables/Data Table/Query Search Table',
    component: PQuerySearchTable,
    decorators: [withKnobs],
    parameters: {
        knobs: { escapeHTML: false },
        design: {
            type: 'figma',
            url: 'https://www.figma.com/file/wq4wSowBcADBuUrMEZLz6i/SpaceONE-Console-Design?node-id=6142%3A188410',
        },
    },
};

const getHandler = items => async (inputText, keyItem) => {
    const allItems = items.map(d => ({ name: d, label: d }));
    let res = [...allItems];
    const regex = RegExp(inputText, 'i');

    if (inputText) {
        res = allItems.reduce((result, d) => {
            if (regex.test(d.label) || regex.test(d.name)) result.push(d);
            return result;
        }, []);
    }
    return {
        results: res,
        totalCount: allItems.length,
    };
};

export const querySearchTable = () => ({
    components: { PQuerySearchTable },
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
        keyItemSets: {
            default: object('keyItemSets', [
                {
                    title: 'Key',
                    items: [{
                        name: 'id',
                        label: 'ID',
                    },
                    {
                        name: 'name',
                        label: 'Name',
                    },
                    {
                        name: 'group',
                        label: 'Group',
                    }],
                },
            ]),
        },
        valueHandlerMap: {
            default: object('valueHandlerMap', {
                id: getHandler(arrayOf(10, () => casual.word)),
                name: getHandler(arrayOf(10, () => casual.word)),
                group: getHandler(arrayOf(10, () => casual.word)),
            }),
        },
        queryTags: {
            default: object('queryTags', [
                {
                    operator: '',
                    value: { name: 'wanjin', label: 'Wanjin Noh' },
                },
            ]),
        },
    },
    template: `
        <div style="width: 80vw;">
            <PQuerySearchTable v-bind="$props"
                               :items="items"
                               :loading="loading"
                               @change="onChange"
                               @export="onExport"
                               @select="onSelect"
            ></PQuerySearchTable>
        </div>`,
    setup(props, context) {
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
