import { withKnobs, text } from '@storybook/addon-knobs/vue';
import { ref, watch, reactive } from '@vue/composition-api';
import { autoProps } from '@sb/storybook-util';
import { action } from '@storybook/addon-actions';
import PFilterBadgeList from './FilterBadgeList';


export default {
    title: 'organisms/lists/FilterBadgeList',
    component: PFilterBadgeList,
    decorators: [withKnobs],
};


export const defaultCase = () => ({
    components: { PFilterBadgeList },
    template: `<div>
                    <p-filter-badge-list :filters.sync="filters" @delete="onDelete"/>
                    <br><br><br><br>
                    <input v-model="newFilterName"/>
                    <button @click="addFilter">add filter</button>    
                </div>`,
    setup() {
        const filters = ref({
            filter1: 'search',
            filter2: 'select',
            filter3: 'search',
        });
        const newFilterName = ref('newFilter');
        const addFilter = () => {
            filters.value = {
                ...filters.value,
                [newFilterName.value]: 'search',
            };
        };

        const onDelete = action('delete');

        return {
            filters,
            newFilterName,
            addFilter,
            onDelete,
        };
    },
});
