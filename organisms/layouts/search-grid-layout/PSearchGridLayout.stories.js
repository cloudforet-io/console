import { action } from '@storybook/addon-actions';
import PSearchGridLayout from '@/components/organisms/layouts/search-grid-layout/PSearchGridLayout.vue';
import { reactive, toRefs } from '@vue/composition-api';
import { number, object, select } from '@storybook/addon-knobs/vue';
import casual, { arrayOf } from '@/components/util/casual';

export default {
    title: 'organisms/layouts/Search-grid-layout',
    component: PSearchGridLayout,
    parameters: {
        info: {
            components: { PSearchGridLayout },
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

export const defaultCase = () => ({
    components: { PSearchGridLayout },
    props: {
        thisPage: {
            default: number('thisPage', 1),
        },
        pageSize: {
            default: number('pageSize', 24),
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
                    value: { name: 'siyeon', label: 'Siyeon' },
                },
            ]),
        },
        paginationValues: {
            default: select('paginationValues', [12, 24, 36]),
        },
    },
    template: `<PSearchGridLayout
                v-bind="$props"
                :items="items"
                :loading="loading"
                :query-tags="tags"
                :keyItemSets="keyItemSets"
                :value-handler-map="valueHandlerMap"
                @change="onChange"
                @refresh="onChange"
    >
    </PSearchGridLayout>`,
    setup(props, context) {
        const state = reactive({
            items: [],
            loading: true,
        });
        const getData = async () => {
            state.loading = true;
            state.items = await new Promise(resolve => setTimeout(() => resolve(arrayOf(30, () => ({
                id: casual.uuid, name: casual.word, group: casual.word,
            }))), 100));
            state.totalCount = state.items.length;
            state.loading = false;
        };
        getData();

        const onChange = (...args) => {
            action('change')(...args);
            getData();
        };

        return {
            ...toRefs(state),
            onChange,
        };
    },
});
