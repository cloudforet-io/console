/* eslint-disable consistent-return */
import {
    computed, reactive, toRefs, watch,
} from 'vue';

import { debounce } from 'lodash';

import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import type { MenuItem } from '@cloudforet/mirinae/types/inputs/context-menu/type';
import type { SelectDropdownMenuItem } from '@cloudforet/mirinae/types/inputs/dropdown/select-dropdown/type';

import type { ListResponse } from '@/schema/_common/api-verbs/list';

import ErrorHandler from '@/common/composables/error/errorHandler';



interface SelectDownListProps {
    isSearch?: boolean;
    filter?: ConsoleFilter[];
    pageSize?: number;
    transformer: (item: any) => SelectDropdownMenuItem,
    fetcher: (apiQueryHelper: ApiQueryHelper) => Promise<ListResponse<any>>
}

export const useSelectDropDownList = ({
    isSearch = true, filter, pageSize = 10, transformer, fetcher,
}: SelectDownListProps) => {
    const state = reactive({
        searchText: '',
        loading: false,
        totalCount: 0,
        list: [],
        menuList: computed<SelectDropdownMenuItem[]>(() => {
            const menuList = [...(state.list ?? []).map(transformer)];

            if (state.isShowMore) {
                menuList.push({ type: 'showMore' });
            }

            return menuList;
        }),
        selectedItems: [] as MenuItem[],
        pageStart: 1,
        pageLimit: pageSize,
        isShowMore: computed(() => {
            if (state.list.length) {
                return state.list.length < state.totalCount;
            }

            return false;
        }),
    });

    const fetchList = async () => {
        state.loading = true;

        const apiQueryHelper = new ApiQueryHelper()
            .setPageStart(state.pageStart).setPageLimit(state.pageLimit)
            .setSort('name', true);

        if (isSearch) {
            const filters: ConsoleFilter[] = [
                { k: 'name', v: state.searchText, o: '' },
            ];

            if (filter) {
                filters.concat(filter);
            }

            apiQueryHelper.setFilters(filters);
        }

        try {
            const { results, total_count } = await fetcher(apiQueryHelper);

            state.totalCount = total_count;
            return results;
        } catch (e) {
            ErrorHandler.handleError(e);
            state.totalCount = 0;
        } finally {
            state.loading = false;
        }
    };

    const handleClickShowMore = async () => {
        state.pageStart += state.pageLimit;
        const results = await fetchList();
        state.list = state.list.concat(results);
    };

    (async () => {
        state.list = await fetchList();
    })();

    watch(() => state.searchText, debounce(async () => {
        state.list = await fetchList() || [];
        state.pageStart = 1;
    }, 300));

    return {
        ...toRefs(state),
        handleClickShowMore,
    };
};
