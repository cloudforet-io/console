export const querySearchTableProps = {
    fields: Array,
    items: Array,
    searchText: String,
    searchTags: {
        type: Array,
        default: () => [],
    },
    loading: {
        type: Boolean,
        default: false,
    },
    sortBy: {
        type: String,
        default: '',
    },
    sortDesc: {
        type: Boolean,
        default: true,
    },
    selectIndex: {
        type: Array,
        default: () => [],
    },
    pageSize: {
        type: Number,
        default: 15,
    },
    thisPage: {
        type: Number,
        default: 1,
    },
    totalCount: {
        type: Number,
        default: 0,
    },
    responsiveStyle: {
        type: Object,
        default: null,
    },
};
