import { Resource, ResourceActions } from '@/lib/fluent-api/toolset';
import {
    DiffQueryAPI,
    HistoryQueryAPI,
} from '@/lib/fluent-api/statistics/toolset';


// example query
/*
 */

class Query extends HistoryQueryAPI<any, any> {
    path = 'query'
}

class Diff extends DiffQueryAPI<any, any> {
    path = 'diff'
}


export default class History extends Resource implements ResourceActions<'query'|'diff'> {
    name = 'history'

    query(): Query { return new Query(this.baseUrl); }

    diff(): Diff { return new Diff(this.baseUrl); }
}
