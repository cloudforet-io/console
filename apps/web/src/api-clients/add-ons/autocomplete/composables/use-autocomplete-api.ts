import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { AutocompleteDistinctParameters } from '@/api-clients/add-ons/autocomplete/schema/api-verbs/distinct';

export const useAutocompleteApi = () => {
    const actions = {
        distinct: SpaceConnector.client.addOns.autocomplete.distinct<AutocompleteDistinctParameters, ListResponse<{ name: string; key: string }>>,
    };

    return {
        autocompleteAPI: actions,
    };
};
