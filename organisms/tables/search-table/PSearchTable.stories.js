import {
    toRefs, reactive, ref, computed,
} from '@vue/composition-api';
import { action } from '@storybook/addon-actions';
import { getKnobProps } from '@sb/storybook-util';
import {
    text, number, select, object, boolean,
} from '@storybook/addon-knobs/vue';
import casual, { arrayOf } from '@/components/util/casual';
import PSearchTable from './PSearchTable.vue';

export default {
    title: 'Data Display/Tables',
    component: PSearchTable,
    parameters: {
        info: {
            summary: '',
            components: { PSearchTable },
        },
        knobs: { escapeHTML: false },
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
    setup(props, context) {
        const state = reactive({
            items: [],
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
