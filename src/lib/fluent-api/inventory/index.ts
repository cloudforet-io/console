import Server from '@/lib/fluent-api/inventory/server';
import { Service, ServiceResources } from '@/lib/fluent-api/toolset';
import CloudServiceType from './cloud-service-type';
import CloudService from './cloud-service';

export default class Inventory extends Service implements ServiceResources<'cloudServiceType'> {
    protected name = 'inventory'

    cloudServiceType() { return new CloudServiceType(this.name); }

    cloudService() { return new CloudService(this.name); }

    server() { return new Server(this.name); }
}
