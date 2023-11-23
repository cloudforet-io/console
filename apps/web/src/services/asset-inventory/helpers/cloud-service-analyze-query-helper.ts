import dayjs from 'dayjs';

import { QueryHelper } from '@cloudforet/core-lib/query';
import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';
import type { ApiFilter, Sort } from '@cloudforet/core-lib/space-connector/type';

import type { Period } from '@/services/asset-inventory/types/type';

const cloudServiceQueryHelper = new QueryHelper();

const FILTER_OR_KEYS = ['provider', 'cloud_service_group', 'cloud_service_type'];

interface Page {
    start: number;
    limit: number;
}
interface Query {
    group_by: string[];
    fields: any;
    field_group?: string[];
    page?: Page;
    filter: ApiFilter[];
    filter_or: ApiFilter[];
    sort: Sort[];
}
const DEFAULT_SORT = [
    { key: 'provider', desc: false },
    { key: 'cloud_service_group', desc: false },
];
export const getCloudServiceAnalyzeQuery = (allFilters: ConsoleFilter[], page?: Page, period?: Period): Query => {
    // initialize query helper
    cloudServiceQueryHelper.setOrFilters([]).setFilters([]);

    // set filters by user selection
    cloudServiceQueryHelper.addFilter(...allFilters);

    // set default filters
    cloudServiceQueryHelper.addFilter({ k: 'ref_cloud_service_type.is_primary', v: true, o: '=' });

    // set filters by period
    if (period) {
        const start = dayjs.utc(period.start).format('YYYY-MM-DD');
        const end = dayjs.utc(period.end).add(1, 'day').format('YYYY-MM-DD');
        cloudServiceQueryHelper.addFilter({ k: 'created_at', v: end, o: '<=t' });
        cloudServiceQueryHelper.addOrFilter({ k: 'deleted_at', v: start, o: '>t' });
        cloudServiceQueryHelper.addOrFilter({ k: 'deleted_at', v: null, o: '=' });
        cloudServiceQueryHelper.addFilter({ k: 'state', v: ['ACTIVE', 'DELETED'], o: '=' });
    } else {
        cloudServiceQueryHelper.addFilter({ k: 'state', v: ['ACTIVE'], o: '=' });
    }

    // get api query parameters from query helper
    const {
        filter, filterOr, keyword,
    } = cloudServiceQueryHelper.apiQuery;
    const filter_or: ApiFilter[] = filterOr ?? [];

    // set filterOr by keyword since analyze api doesn't support keyword filter.
    if (keyword) {
        const values = keyword.split(' ');
        FILTER_OR_KEYS.forEach((key) => {
            filterOr.push({
                k: key,
                o: 'contain_in',
                v: values,
            });
        });
    }

    return {
        group_by: ['cloud_service_group', 'provider', 'cloud_service_type'],
        fields: {
            resources: {
                operator: 'count',
            },
        },
        field_group: ['cloud_service_type'],
        filter,
        filter_or,
        page,
        sort: DEFAULT_SORT,
    };
};
