import { ListAction, Resource, ResourceActions } from '@/lib/fluent-api/toolset';
import { HistoryListParam, HistoryListResp } from '@/lib/fluent-api/statistics/type';
import { ListType } from '@/lib/fluent-api/type';

class List extends ListAction<HistoryListParam, ListType<HistoryListResp>> {
}

export default class History extends Resource implements ResourceActions<'list'> {
    name = 'history'

    list(): List { return new List(this.api, this.baseUrl); }
}
