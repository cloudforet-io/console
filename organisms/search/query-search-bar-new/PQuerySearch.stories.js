import { ref } from '@vue/composition-api';
import { action } from '@storybook/addon-actions';
import PQuerySearch from './PQuerySearch.vue';

export default {
    title: 'organisms/search/query-search',
    component: PQuerySearch,
    parameters: {
        info: {
            summary: '',
            components: { PQuerySearch },
        },
    },
};

export const defaultCase = () => ({
    components: { PQuerySearch },
    template: `<div>
<!--      <PQuerySearch :searchText.sync="value"-->
<!--                       @newQuery="newQuery"-->
<!--                        :autocomplete-handler="mockHandler"></PQuerySearch>-->
  </div>`,
    setup() {
        return {
            value: ref(''),
            newQuery: action('newQuery'),
        };
    },
});
