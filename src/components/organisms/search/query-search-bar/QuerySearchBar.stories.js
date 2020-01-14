import { ref } from '@vue/composition-api';
import { action } from '@storybook/addon-actions';
import PQuerySearchBar from './QuerySearchBar.vue';
import { defaultAutocompleteHandler } from '@/components/organisms/search/query-search-bar/autocompleteHandler';

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

class ACHandler extends defaultAutocompleteHandler {
    // eslint-disable-next-line class-methods-use-this
    get keys() {
        return ['domain_id', 'private_ip', 'public_ip', 'id', 'suggestKey', 'server_id', '자동완성', '펭수'];
    }

    // eslint-disable-next-line class-methods-use-this
    get suggestKeys() {
        return ['domain_id', 'suggestKey', 'private_ip', 'public_ip'];
    }
}

export const defaultCase = () => ({
    components: { PQuerySearchBar },
    template: `<div>
      <PQuerySearchBar :searchText.sync="value" @newQuery="newQuery" :autocompleteHandler="mockHandler"></PQuerySearchBar>
  </div>`,
    setup() {
        return {
            value: ref(''),
            newQuery: action('newQuery'),
            mockHandler: new ACHandler(),
        };
    },
});
