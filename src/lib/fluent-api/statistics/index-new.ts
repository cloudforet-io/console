/* eslint-disable camelcase */
import { Service } from '@/lib/fluent-api/toolset';
import Stat from '@/lib/fluent-api/statistics/stat-new';
import History from '@/lib/fluent-api/statistics/history';


export default class Statistics extends Service {
    protected name = 'statistics';

    stat(): Stat { return new Stat(this.api, this.name); }

    history(): History { return new History(this.api, this.name); }
}
