import { Service, ServiceResources } from '@/lib/fluent-api/toolset';
import Server from '@/lib/fluent-api/inventory/server';
import Collector from '@/lib/fluent-api/inventory/collector';
import Region from '@/lib/fluent-api/inventory/region';
import Zone from '@/lib/fluent-api/inventory/zone';
import Pool from '@/lib/fluent-api/inventory/pool';
import Job from '@/lib/fluent-api/inventory/job';
import CloudService from './cloud-service';
import CloudServiceType from './cloud-service-type';

export default class Inventory extends Service implements ServiceResources<'cloudServiceType'> {
    protected name = 'inventory'

    cloudServiceType() { return new CloudServiceType(this.api, this.name); }

    cloudService() { return new CloudService(this.api, this.name); }

    server() { return new Server(this.api, this.name); }

    collector() { return new Collector(this.api, this.name); }

    region() { return new Region(this.api, this.name); }

    zone() { return new Zone(this.api, this.name); }

    pool() { return new Pool(this.api, this.name); }

    jobs(): Job { return new Job(this.api, this.name); }
}
