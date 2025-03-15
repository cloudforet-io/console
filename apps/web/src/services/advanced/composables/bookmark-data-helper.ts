import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';
import type { QueryItem, ValueItem, ValueHandler } from '@cloudforet/mirinae/types/controls/search/query-search/type';

import { i18n } from '@/translations';

import type { BookmarkItem } from '@/common/components/bookmark/type/type';

export const makeSearchQueryTagsHandler = (queryTags: QueryItem[]) => {
    const filters: ConsoleFilter[] = [];
    queryTags.forEach((t) => {
        const { key, value } = t;
        const keyName = key?.name;

        switch (keyName) {
        case 'name':
            filters.push({ k: 'data.name', v: value.name, o: '=' });
            break;
        case 'scope':
            if (value.name === 'global') {
                filters.push({ k: 'data.isGlobal', v: true, o: '=' });
            } else {
                filters.push({ k: 'data.workspaceId', v: value.name, o: '=' });
            }
            break;
        case 'link':
            filters.push({ k: 'data.link', v: value.name, o: '=' });
            break;
        default:
            if (!keyName) {
                filters.push({ k: 'data.name', v: value.name, o: '=' });
            }
            break;
        }
    });
    return filters;
};

export const makeValueHandler = (list: BookmarkItem[], key: string): ValueHandler => async () => {
    const results: ValueItem[] = list.map((item) => {
        if (key === 'scope') {
            if (item.workspaceId) {
                return { label: item.workspaceId, name: item.workspaceId };
            }
            return { label: i18n.t('IAM.BOOKMARK.GLOBAL_BOOKMARK'), name: 'global' };
        }
        return { label: item[key], name: item[key] };
    }).filter((value) => value.name !== undefined);

    const uniqueResults = Array.from(new Set(results.map((result) => JSON.stringify(result))))
        .map((str) => JSON.parse(str));

    return {
        results: uniqueResults,
        totalCount: uniqueResults.length,
    };
};
