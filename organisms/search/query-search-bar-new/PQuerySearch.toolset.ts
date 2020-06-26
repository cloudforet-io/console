
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
