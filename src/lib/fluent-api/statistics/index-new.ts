/* eslint-disable camelcase */
import { Service } from '@/lib/fluent-api/toolset';
import Resource from '@/lib/fluent-api/statistics/resource';
import History from '@/lib/fluent-api/statistics/history';
import Topic from '@/lib/fluent-api/statistics/topic';


export default class Statistics extends Service {
    protected name = 'statistics';

    resource(): Resource { return new Resource(this.api, this.name); }

    history(): History { return new History(this.api, this.name); }

    topic(): Topic { return new Topic(this.api, this.name); }
}
