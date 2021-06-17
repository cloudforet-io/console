import { ApiQueryHelper } from '@/lib/space-connector/helper';
import { Query } from '@/lib/space-connector/type';

export const getApiQueryWithToolboxOptions = (apiQueryHelper: ApiQueryHelper, options: any = {}): undefined|Query => {
    if (!Object.keys(options).length) return undefined;

    if (options.pageStart !== undefined) apiQueryHelper.setPageStart(options.pageStart);
    if (options.pageLimit !== undefined) apiQueryHelper.setPageLimit(options.pageLimit);
    if (options.sortBy !== undefined) apiQueryHelper.setSort(options.sortBy, options.sortDesc);
    if (options.queryTags !== undefined) {
        apiQueryHelper.setFiltersAsQueryTag(options.queryTags);
    } else if (options.searchText !== undefined) {
        apiQueryHelper.setFilters([{ v: options.searchText || '' }]);
    }
    return apiQueryHelper.data;
};
