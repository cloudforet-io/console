/* eslint-disable camelcase */
import {
    BaseQueryAPI,
    ListAction, Resource, ResourceActions, SetParameterAction,
} from '@/lib/fluent-api/toolset';
import {
    HistoryDiffParam, HistoryDiffResp, HistoryParam, HistoryListResp, StatResponse,
} from '@/lib/fluent-api/statistics/type';
import {
    ApiType, BaseQuery, ListType, TimeStamp,
} from '@/lib/fluent-api/type';
import { StatAction, StatQueryAPI } from '@/lib/fluent-api/statistics/toolset';

class List extends ListAction<HistoryParam, ListType<HistoryListResp>> {
}

export class HistoryDiff<value> extends BaseQueryAPI<HistoryDiffParam, HistoryDiffResp<value>> {
    path = 'diff'

    protected query = (): BaseQuery => this.getBaseQuery<BaseQuery>({} as BaseQuery);

    setTopic(topic: string): this {
        const api = this.clone();
        api.apiState.extraParameter.topic = topic;
        return api;
    }

    setFrom(from: string): this {
        const api = this.clone();
        api.apiState.extraParameter.from = from;
        return api;
    }

    setTo(to: string): this {
        const api = this.clone();
        api.apiState.extraParameter.to = to;
        return api;
    }

    setDefaultFields(...args: string[]): this {
        const api = this.clone();
        if (!api.apiState.extraParameter.default_fields) api.apiState.extraParameter.default_fields = [];
        api.apiState.extraParameter.default_fields = args;
        return api;
    }

    setDiffFields(...args: string[]): this {
        const api = this.clone();
        if (!api.apiState.extraParameter.diff_fields) api.apiState.extraParameter.diff_fields = [];
        api.apiState.extraParameter.diff_fields = args;
        return api;
    }
}

export class HistoryStat<value> extends StatAction<HistoryParam, StatResponse<value>> {
    setTopic(topic: string): this {
        const api = this.clone();
        api.apiState.extraParameter.topic = topic;
        return api;
    }
}

export default class History extends Resource implements ResourceActions<'list'|'diff'|'stat'> {
    name = 'history'

    list(): List { return new List(this.api, this.baseUrl); }

    diff<value>(): HistoryDiff<value> { return new HistoryDiff<value>(this.api, this.baseUrl); }

    stat<value>(): HistoryStat<value> { return new HistoryStat<value>(this.api, this.baseUrl); }
}
