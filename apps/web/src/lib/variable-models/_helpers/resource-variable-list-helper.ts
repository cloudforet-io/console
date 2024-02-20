import { ListQuery, ListResponse } from '@/lib/variable-models/_base/types';
import ErrorHandler from '@/common/composables/error/errorHandler';

const fetchResourceVariable = async (fetcher, dataKey) => {
    try {
        const { status, response } = await fetcher(
            dataKey ? this.getStatParams(query, dataKey) : this._getParams(query),
        );
        if (status === 'succeed') {
            let more = false;
            if (query.start !== undefined && query.limit !== undefined && response.total_count !== undefined) {
                more = (query.start * query.limit) < response.total_count;
            }
            this.#response = {
                results: response.results ? response.results.map((d) => {
                    if (dataKey) {
                        return { key: d, name: d };
                    }
                    return { key: d[this.idKey], name: this.nameFormatter(d) };
                }) : [],
                more,
            };
        }
        return this.#response;
    } catch (e) {
        ErrorHandler.handleError(e);
        return this.#response;
    }
}
async #fetch(query: ListQuery = {}, dataKey?: string): Promise<ListResponse> {
