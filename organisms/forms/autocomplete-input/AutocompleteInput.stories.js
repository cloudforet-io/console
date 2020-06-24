import {
    toRefs, reactive, ref, computed,
} from '@vue/composition-api';
import PAutocompleteInput from './AutocompleteInput.vue';
import {
    BaseAutocompleteHandler,
    DefaultAutocompleteHandler, getKeys, getSuggest,
    searchContextType,
    SearchQuery,
    makeValuesFetchHandler,
} from '@/components/organisms/search/query-search-bar/autocompleteHandler';

export default {
    title: 'organisms/forms/AutocompleteInput',
    component: PAutocompleteInput,
    parameters: {
        info: {
            summary: '',
            components: { PAutocompleteInput },
        },
    },
};

const getState = () => {
    class ACHandler extends BaseAutocompleteHandler {
        // eslint-disable-next-line class-methods-use-this
        // get keys() {
        //     return ['credential_id'];
        // }

        // eslint-disable-next-line class-methods-use-this
        get suggestKeys() {
            return ['credential_id'];
        }

        constructor() {
            super();
            this.HandlerMap = {
                key: [getSuggest(this.suggestKeys)],
                value: [...makeValuesFetchHandler(this.parent, this.valuesFetchUrl, this.valuesFetchKeys)],
            };
        }
    }

    return {
        ACHandler: new ACHandler(),
    };
};


export const defaultCase = () => ({
    components: { PAutocompleteInput },
    template: `<PAutocompleteInput
                :autocompleteHandler="ACHandler"
    />`,
    setup(props, context) {
        return {
            ...getState(),
        };
    },
});
