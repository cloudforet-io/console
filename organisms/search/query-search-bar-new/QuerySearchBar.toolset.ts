import {
    computed, reactive, ref, Ref,
} from '@vue/composition-api';
import { TagToolSet } from '@/components/molecules/tags/toolset';
import { SearchQueryType } from '@/components/organisms/search/query-search-bar/type';
import { BaseAutocompleteHandler } from './autocompleteHandler';


interface QuerySearchSyncState {
    searchText: string;
}

export type QuerySearchProps = QuerySearchSyncState

export const querySearchProps = {
    searchText: {
        type: String,
        default: '',
        required: true,
    },
};
