import { ref } from '@vue/composition-api';
import { action } from '@storybook/addon-actions';
import moment from 'moment-timezone';
import PQuerySearchBar from './QuerySearchBar.vue';
import {
    DefaultAutocompleteHandler,
    getEnumValues, getSearchEnumValues,
} from '@/components/organisms/search/query-search-bar/autocompleteHandler';

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

class ACHandler extends DefaultAutocompleteHandler {
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

class CustomEnumValueHandler extends DefaultAutocompleteHandler {
    // eslint-disable-next-line class-methods-use-this
    get keys() {
        return ['state', 'timezone'];
    }

    constructor() {
        super();
        this.HandlerMap.value.push(...[
            getEnumValues('state', ['ENABLED', 'DISABLED']),
            getSearchEnumValues('timezone', moment.tz.names(), [
                'UTC', 'Asia/Seoul',
            ], { caseSensitive: true, threshold: 0.8 }),
        ]);
    }
}

export const customEnumValue = () => ({
    components: { PQuerySearchBar },
    template: `<div>
      <PQuerySearchBar :searchText.sync="value" @newQuery="newQuery" :autocompleteHandler="mockHandler"></PQuerySearchBar>
  </div>`,
    setup() {
        return {
            value: ref(''),
            newQuery: action('newQuery'),
            mockHandler: new CustomEnumValueHandler(),
        };
    },
});
