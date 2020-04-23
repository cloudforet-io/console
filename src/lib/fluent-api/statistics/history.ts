import { Resource, ResourceActions } from '@/lib/fluent-api/toolset';
import {
    DiffQueryAPI,
    HistoryQueryAPI, HistoryResponse,
} from '@/lib/fluent-api/statistics/toolset_origin';


// example query
/*
 */

class Query<value> extends HistoryQueryAPI<any, HistoryResponse<value>> {
    path = 'query'
}

class Diff<value> extends DiffQueryAPI<any, HistoryResponse<value>> {
    path = 'diff'
}


export default class History extends Resource implements ResourceActions<'query'|'diff'> {
    name = 'history'

    query<value>(): Query<value> { return new Query(this.api, this.baseUrl); }

    diff<value>(): Diff<value> { return new Diff(this.api, this.baseUrl); }
}
