import { ref } from '@vue/composition-api';
import { action } from '@storybook/addon-actions';
import PQuerySearchBar from './QuerySearchBar.vue';
import { mockHandler } from './QuerySearchBar.stories.toolset';

export default {
    title: 'organisms/search/query-search-bar-new',
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
      <PQuerySearchBar :searchText.sync="value"
                       @newQuery="newQuery"
                        :autocomplete-handler="mockHandler"></PQuerySearchBar>
  </div>`,
    setup() {
        return {
            value: ref(''),
            newQuery: action('newQuery'),
            mockHandler,
        };
    },
});
