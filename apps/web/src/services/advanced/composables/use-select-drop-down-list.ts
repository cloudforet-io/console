/* eslint-disable consistent-return */
import type { ComputedRef, ToRefs } from 'vue';
import {
    computed, reactive, toRefs, watch,
} from 'vue';

import { debounce } from 'lodash';

import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import type { SelectDropdownMenuItem } from '@cloudforet/mirinae/types/controls/dropdown/select-dropdown/type';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';

import ErrorHandler from '@/common/composables/error/errorHandler';



interface SelectDownListProps<T> {
    isSearch?: boolean;
    filter?: ComputedRef<ConsoleFilter[]>;
    pageSize?: number;
    transformer: (item: T) => SelectDropdownMenuItem,
    fetcher: (apiQueryHelper: ApiQueryHelper) => Promise<ListResponse<any>>
    searchKey?: string;
}

interface SelectDropDownListState<T> {
    searchText: string,
    loading: boolean,
    totalCount: number,
    list: T[],
    menuList: ComputedRef<SelectDropdownMenuItem[]>,
    selectedItems: (SelectDropdownMenuItem & T)[],
    pageStart: number,
    pageLimit: number,
    isShowMore: ComputedRef<boolean>,
}

export const useSelectDropDownList = <DataModel>({
    isSearch = true, filter, pageSize = 10, transformer, fetcher, searchKey = 'name',
}: SelectDownListProps<DataModel>) : ToRefs<SelectDropDownListState<DataModel>> & {
    reset: () => Promise<void>,
    handleClickShowMore: () => Promise<void>,
} => {
    const state = reactive<SelectDropDownListState<DataModel>>({
        searchText: '',
        loading: false,
        totalCount: 0,
        list: [],
        menuList: computed<SelectDropdownMenuItem[]>(() => {
            const menuListSource: DataModel[] = state.list ?? [];
            const menuList: SelectDropdownMenuItem[] = menuListSource.map(transformer);
            if (state.isShowMore) {
                menuList.push({ type: 'showMore', name: 'Show More' });
            }

            return menuList;
        }),
        selectedItems: [],
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
            .setSort(searchKey, true);

        if (isSearch) {
            let filters: ConsoleFilter[] = [
                { k: searchKey, v: state.searchText, o: '' },
            ];

            if (filter?.value) {
                filters = filters.concat(filter.value);
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
            return [];
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

    const reset = async () => {
        state.pageStart = 1;
        state.list = await fetchList() || [];
    };

    watch(() => state.searchText, debounce(async () => {
        state.pageStart = 1;
        state.list = await fetchList() || [];
    }, 300));

    return {
        ...toRefs<SelectDropDownListState<DataModel>>(state),
        reset,
        handleClickShowMore,
    };
};
