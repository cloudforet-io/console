import CloudServiceType from './cloud-service-type';
import { Service, ServiceResources } from '@/lib/fluent-api/toolset';

export default class Inventory extends Service implements ServiceResources<'cloudServiceType'> {
    protected name = 'inventory'

    cloudServiceType() { return new CloudServiceType(this.name); }
}
