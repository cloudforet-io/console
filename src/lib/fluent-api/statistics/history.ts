/* eslint-disable camelcase */
import {
    ListAction, Resource, ResourceActions, SetParameterAction,
} from '@/lib/fluent-api/toolset';
import {
    HistoryDiffParam, HistoryDiffResp, HistoryParam, HistoryListResp, StatResponse,
} from '@/lib/fluent-api/statistics/type';
import { ListType, TimeStamp } from '@/lib/fluent-api/type';
import { StatAction, StatQueryAPI } from '@/lib/fluent-api/statistics/toolset';

class List extends ListAction<HistoryParam, ListType<HistoryListResp>> {
}

class Diff<value> extends StatQueryAPI<HistoryDiffParam, HistoryDiffResp<value>> {
    path = 'diff'

    setTopic(topic: string): this {
        const api = this.clone();
        api.apiState.extraParameter.topic = topic;
        return api;
    }

    setStart(start: TimeStamp): this {
        const api = this.clone();
        api.apiState.extraParameter.start = start;
        return api;
    }

    setEnd(end: TimeStamp): this {
        const api = this.clone();
        api.apiState.extraParameter.end = end;
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

class Stat<value> extends StatAction<HistoryParam, StatResponse<value>> {
    setTopic(topic: string): this {
        const api = this.clone();
        api.apiState.extraParameter.topic = topic;
        return api;
    }
}

export default class History extends Resource implements ResourceActions<'list'|'diff'|'stat'> {
    name = 'history'

    list(): List { return new List(this.api, this.baseUrl); }

    diff<value>(): Diff<value> { return new Diff<value>(this.api, this.baseUrl); }

    stat<value>(): Stat<value> { return new Stat<value>(this.api, this.baseUrl); }
}
