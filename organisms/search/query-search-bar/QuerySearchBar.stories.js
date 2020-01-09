import { ref } from '@vue/composition-api';
import { action } from '@storybook/addon-actions';
import PQuerySearchBar from './QuerySearchBar.vue';

export default {
    title: 'organisms/search/query-search-bar',
    component: PQuerySearchBar,
    parameters: {
        info: {
            summary: '',
            components: { PQuerySearchBar },
        },
    },
};

export const defaultCase = () => ({
    components: { PQuerySearchBar },
    template: `<div>
      <PQuerySearchBar :searchText.sync="value" @newQuery="newQuery"></PQuerySearchBar>
  </div>`,
    setup() {
        return {
            value: ref(''),
            newQuery: action('newQuery'),
        };
    },
});
