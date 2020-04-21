import { Service, ServiceResources } from '@/lib/fluent-api/toolset';
import DataSource from '@/lib/fluent-api/monitoring/data-source';
import Metric from '@/lib/fluent-api/monitoring/metric';
import Log from '@/lib/fluent-api/monitoring/log';

export default class Monitoring extends Service implements ServiceResources<'dataSource' | 'metric'> {
    protected name = 'monitoring';

    dataSource(): DataSource { return new DataSource(this.api, this.name); }

    metric(): Metric { return new Metric(this.api, this.name); }

    log(): Log { return new Log(this.api, this.name); }
}
