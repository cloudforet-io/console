import { withKnobs } from '@storybook/addon-knobs/vue';
import { ref } from '@vue/composition-api';
import { autoProps } from '@sb/storybook-util';
import { action } from '@storybook/addon-actions';
import PFilterBadge, { filterBadgeList } from './FilterBadge.vue';


export default {
    title: 'molecules/badges/FilterBadge',
    component: PFilterBadge,
    decorators: [withKnobs],
};


export const defaultCase = () => ({
    components: { PFilterBadge },
    props: {
        ...autoProps(PFilterBadge),
    },
    template: '<p-filter-badge v-bind="$props" @delete="onDelete">filtername</p-filter-badge>',
    methods: {
        onDelete: action('delete'),
    },
});

export const listCase = () => ({
    components: { PFilterBadge },
    props: {
        ...autoProps(PFilterBadge),
    },
    template: `
    <div>
        <p-filter-badge v-for="(filter, idx) in tools.filters" :key="idx + filter"
                        :idx="idx"
                        @delete="tools.deleteTag"
        >
            {{ filter }}
        </p-filter-badge>
        <br><br><br><br>
        <input v-model="newFilterName">
        <button @click="tools.addTag(newFilterName)">
            add filter
        </button>
        <p>* It doesn't check duplication)</p>
    </div>
    `,
    setup() {
        const tools = filterBadgeList(ref([
            'filter1', 'filter2', 'filter3',
        ]));

        const newFilterName = ref('newFilter');

        return {
            tools,
            newFilterName,
        };
    },
});
