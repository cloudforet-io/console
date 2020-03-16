import CloudServiceType from './cloud-service-type';
import Server from '@/lib/fluent-api/inventory/server';
import { Service, ServiceResources } from '@/lib/fluent-api/toolset';

export default class Inventory extends Service implements ServiceResources<'cloudServiceType'> {
    protected name = 'inventory'

    cloudServiceType() { return new CloudServiceType(this.name); }

    server() { return new Server(this.name); }
}
